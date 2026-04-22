import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notes, categories, reviewLogs } from '$lib/server/db/schema';
import { eq, and, or, isNull, lte } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const now = new Date();

	const due = await db
		.select({
			id: notes.id,
			title: notes.title,
			excerpt: notes.excerpt,
			status: notes.status,
			difficulty: notes.difficulty,
			reviewInterval: notes.reviewInterval,
			lastReviewedAt: notes.lastReviewedAt,
			nextReviewAt: notes.nextReviewAt,
			categoryName: categories.name,
			categoryIcon: categories.icon,
			categorySlug: categories.slug
		})
		.from(notes)
		.leftJoin(categories, eq(notes.categoryId, categories.id))
		.where(
			and(
				eq(notes.userId, userId),
				eq(notes.isArchived, false),
				or(isNull(notes.nextReviewAt), lte(notes.nextReviewAt, now))
			)
		)
		.orderBy(notes.nextReviewAt)
		.limit(50);

	return { due };
};

export const actions: Actions = {
	markReviewed: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const noteId = formData.get('noteId')?.toString();
		const result = formData.get('result')?.toString(); // 'got_it' | 'needs_work'

		if (!noteId || !result) return fail(400, { message: 'Missing fields' });

		const [note] = await db
			.select({ reviewInterval: notes.reviewInterval, status: notes.status })
			.from(notes)
			.where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
			.limit(1);

		if (!note) return fail(404, { message: 'Note not found' });

		const now = new Date();
		let newInterval: number;
		let newStatus = note.status;

		if (result === 'got_it') {
			newInterval = Math.min(note.reviewInterval * 2, 60);
			if (newInterval >= 14 && note.status === 'learning') newStatus = 'reviewing';
			if (newInterval >= 30 && note.status === 'reviewing') newStatus = 'mastered';
		} else {
			newInterval = 1;
		}

		const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

		const [updated] = await db
			.update(notes)
			.set({
				lastReviewedAt: now,
				nextReviewAt: nextReview,
				reviewInterval: newInterval,
				status: newStatus
			})
			.where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
			.returning({ title: notes.title });

		await db.insert(reviewLogs).values({
			userId,
			noteId,
			noteTitle: updated?.title ?? '',
			result
		});

		return { success: true };
	}
};
