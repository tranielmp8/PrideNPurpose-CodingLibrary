import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notes, categories, tags, noteTagLinks } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const { id } = event.params;

	const [note] = await db
		.select()
		.from(notes)
		.where(and(eq(notes.id, id), eq(notes.userId, userId)))
		.limit(1);

	if (!note) error(404, 'Note not found');

	const [category, allTags, noteTags, backlinks] = await Promise.all([
		db
			.select({ name: categories.name, slug: categories.slug })
			.from(categories)
			.where(eq(categories.id, note.categoryId))
			.limit(1)
			.then((r) => r[0]),

		db.select().from(tags).where(eq(tags.userId, userId)).orderBy(tags.name),

		db
			.select({ tagId: noteTagLinks.tagId })
			.from(noteTagLinks)
			.where(eq(noteTagLinks.noteId, id)),

		db
			.select({ id: notes.id, title: notes.title })
			.from(notes)
			.where(
				and(
					eq(notes.userId, userId),
					sql`${notes.contentJson} LIKE ${`%"noteId":"${id}"%`}`
				)
			)
			.limit(20)
	]);

	return {
		note,
		category,
		allTags,
		noteTagIds: noteTags.map((t) => t.tagId),
		backlinks
	};
};

export const actions: Actions = {
	save: async (event) => {
		const userId = event.locals.user!.id;
		const { id } = event.params;
		const formData = await event.request.formData();

		const title = formData.get('title')?.toString().trim();
		const contentJson = formData.get('content')?.toString();

		const updates: Record<string, unknown> = {};
		if (title !== undefined) updates.title = title || 'Untitled';
		if (contentJson !== undefined) updates.contentJson = contentJson;

		if (Object.keys(updates).length === 0) return { success: true };

		await db
			.update(notes)
			.set(updates)
			.where(and(eq(notes.id, id), eq(notes.userId, userId)));

		return { success: true };
	},

	updateMeta: async (event) => {
		const userId = event.locals.user!.id;
		const { id } = event.params;
		const formData = await event.request.formData();

		const status = formData.get('status')?.toString();
		const difficulty = formData.get('difficulty')?.toString();
		const isFavorite = formData.get('isFavorite')?.toString();

		const updates: Record<string, unknown> = {};
		if (status) updates.status = status;
		if (difficulty) updates.difficulty = difficulty;
		if (isFavorite !== undefined) updates.isFavorite = isFavorite === 'true';

		if (Object.keys(updates).length === 0) return fail(400, { message: 'Nothing to update.' });

		await db
			.update(notes)
			.set(updates)
			.where(and(eq(notes.id, id), eq(notes.userId, userId)));

		return { success: true };
	},

	addTag: async (event) => {
		const userId = event.locals.user!.id;
		const { id: noteId } = event.params;
		const formData = await event.request.formData();
		const tagId = formData.get('tagId')?.toString();
		const newTagName = formData.get('newTagName')?.toString().trim();

		const [note] = await db
			.select({ id: notes.id })
			.from(notes)
			.where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
			.limit(1);
		if (!note) return fail(403);

		let resolvedId = tagId;
		let createdTag: { id: string; name: string; color: string } | null = null;

		if (!tagId && newTagName) {
			const [existing] = await db
				.select()
				.from(tags)
				.where(and(eq(tags.userId, userId), eq(tags.name, newTagName)))
				.limit(1);

			if (existing) {
				resolvedId = existing.id;
			} else {
				const [created] = await db
					.insert(tags)
					.values({ userId, name: newTagName })
					.returning();
				resolvedId = created.id;
				createdTag = { id: created.id, name: created.name, color: created.color ?? '#f97316' };
			}
		}

		if (!resolvedId) return fail(400, { message: 'No tag specified.' });

		const existing = await db
			.select()
			.from(noteTagLinks)
			.where(and(eq(noteTagLinks.noteId, noteId), eq(noteTagLinks.tagId, resolvedId)))
			.limit(1);

		if (existing.length === 0) {
			await db.insert(noteTagLinks).values({ noteId, tagId: resolvedId });
		}

		return { success: true, tagId: resolvedId, createdTag };
	},

	togglePin: async (event) => {
		const userId = event.locals.user!.id;
		const { id } = event.params;
		const formData = await event.request.formData();
		const pin = formData.get('pin') === 'true';
		await db
			.update(notes)
			.set({ isPinned: pin })
			.where(and(eq(notes.id, id), eq(notes.userId, userId)));
		return { success: true };
	},

	archiveNote: async (event) => {
		const userId = event.locals.user!.id;
		const { id } = event.params;
		await db
			.update(notes)
			.set({ isArchived: true })
			.where(and(eq(notes.id, id), eq(notes.userId, userId)));
		return { success: true };
	},

	removeTag: async (event) => {
		const userId = event.locals.user!.id;
		const { id: noteId } = event.params;
		const formData = await event.request.formData();
		const tagId = formData.get('tagId')?.toString() ?? '';

		const [note] = await db
			.select({ id: notes.id })
			.from(notes)
			.where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
			.limit(1);
		if (!note) return fail(403);

		await db
			.delete(noteTagLinks)
			.where(and(eq(noteTagLinks.noteId, noteId), eq(noteTagLinks.tagId, tagId)));

		return { success: true };
	}
};
