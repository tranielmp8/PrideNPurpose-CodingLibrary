import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { tags, noteTagLinks, notes, categories } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const { id } = event.params;

	const [tag] = await db
		.select()
		.from(tags)
		.where(and(eq(tags.id, id), eq(tags.userId, userId)))
		.limit(1);

	if (!tag) error(404, 'Tag not found');

	const taggedNotes = await db
		.select({
			id: notes.id,
			title: notes.title,
			status: notes.status,
			difficulty: notes.difficulty,
			updatedAt: notes.updatedAt,
			categoryName: categories.name,
			categoryIcon: categories.icon
		})
		.from(noteTagLinks)
		.innerJoin(notes, and(eq(noteTagLinks.noteId, notes.id), eq(notes.isArchived, false)))
		.leftJoin(categories, eq(notes.categoryId, categories.id))
		.where(and(eq(noteTagLinks.tagId, id), eq(notes.userId, userId)))
		.orderBy(desc(notes.updatedAt));

	return { tag, notes: taggedNotes };
};
