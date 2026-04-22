import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notes, categories } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const archived = await db
		.select({
			id: notes.id,
			title: notes.title,
			status: notes.status,
			updatedAt: notes.updatedAt,
			categoryName: categories.name,
			categoryIcon: categories.icon,
			categorySlug: categories.slug
		})
		.from(notes)
		.leftJoin(categories, eq(notes.categoryId, categories.id))
		.where(and(eq(notes.userId, userId), eq(notes.isArchived, true)))
		.orderBy(desc(notes.updatedAt));

	return { notes: archived };
};

export const actions: Actions = {
	restore: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const noteId = formData.get('noteId')?.toString() ?? '';
		if (!noteId) return fail(400);
		await db.update(notes).set({ isArchived: false }).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
		return { success: true };
	},

	deletePermanently: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const noteId = formData.get('noteId')?.toString() ?? '';
		if (!noteId) return fail(400);
		await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
		return { success: true };
	}
};
