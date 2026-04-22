import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { eq, and, or, isNull, lte, count } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, '/login');

	const userId = event.locals.user.id;
	const now = new Date();

	const [dueResult] = await db
		.select({ count: count() })
		.from(notes)
		.where(and(eq(notes.userId, userId), eq(notes.isArchived, false), or(isNull(notes.nextReviewAt), lte(notes.nextReviewAt, now))));

	return {
		user: event.locals.user,
		dueCount: Number(dueResult?.count ?? 0)
	};
};
