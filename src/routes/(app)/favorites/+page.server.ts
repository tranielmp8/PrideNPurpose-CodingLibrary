import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notes, categories } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const favoriteNotes = await db
		.select({
			id: notes.id,
			title: notes.title,
			status: notes.status,
			difficulty: notes.difficulty,
			updatedAt: notes.updatedAt,
			categoryName: categories.name,
			categorySlug: categories.slug,
			categoryIcon: categories.icon
		})
		.from(notes)
		.leftJoin(categories, eq(notes.categoryId, categories.id))
		.where(and(eq(notes.userId, userId), eq(notes.isFavorite, true), eq(notes.isArchived, false)))
		.orderBy(desc(notes.updatedAt));

	return { notes: favoriteNotes };
};
