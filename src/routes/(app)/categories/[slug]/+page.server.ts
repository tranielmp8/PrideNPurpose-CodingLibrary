import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, folders, notes } from '$lib/server/db/schema';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import { slugify } from '$lib/utils/slugify';
import { getTemplateContent } from '$lib/utils/templates';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const { slug } = event.params;

	const [category] = await db
		.select()
		.from(categories)
		.where(and(eq(categories.slug, slug), eq(categories.userId, userId)))
		.limit(1);

	if (!category) error(404, 'Category not found');

	const [categoryFolders, categoryNotes] = await Promise.all([
		db
			.select()
			.from(folders)
			.where(and(eq(folders.categoryId, category.id), eq(folders.userId, userId)))
			.orderBy(folders.sortOrder),

		db
			.select({
				id: notes.id,
				title: notes.title,
				slug: notes.slug,
				status: notes.status,
				difficulty: notes.difficulty,
				isFavorite: notes.isFavorite,
				isPinned: notes.isPinned,
				folderId: notes.folderId,
				updatedAt: notes.updatedAt
			})
			.from(notes)
			.where(and(eq(notes.categoryId, category.id), eq(notes.userId, userId), eq(notes.isArchived, false)))
			.orderBy(sql`${notes.isPinned} desc`, desc(notes.updatedAt))
	]);

	return { category, folders: categoryFolders, notes: categoryNotes };
};

export const actions: Actions = {
	createNote: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const categoryId = formData.get('categoryId')?.toString() ?? '';
		const folderId = formData.get('folderId')?.toString() || null;
		const title = formData.get('title')?.toString().trim() || 'Untitled';
		const template = formData.get('template')?.toString() || 'blank';

		if (!categoryId) return fail(400, { message: 'Category is required.' });

		const [category] = await db
			.select({ id: categories.id })
			.from(categories)
			.where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
			.limit(1);
		if (!category) return fail(403, { message: 'Category not found.' });

		if (folderId) {
			const [folder] = await db
				.select({ id: folders.id })
				.from(folders)
				.where(and(eq(folders.id, folderId), eq(folders.categoryId, categoryId), eq(folders.userId, userId)))
				.limit(1);
			if (!folder) return fail(400, { message: 'Folder not found.' });
		}

		const slug = `${slugify(title)}-${Date.now()}`;
		const contentJson = getTemplateContent(template);

		const [created] = await db
			.insert(notes)
			.values({ userId, categoryId, folderId, title, slug, contentJson })
			.returning({ id: notes.id });

		redirect(302, `/notes/${created.id}`);
	},

	createFolder: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const categoryId = formData.get('categoryId')?.toString() ?? '';
		const name = formData.get('name')?.toString().trim() ?? '';
		const parentFolderId = formData.get('parentFolderId')?.toString() || null;

		if (!name) return fail(400, { message: 'Folder name is required.' });

		const [category] = await db
			.select({ id: categories.id })
			.from(categories)
			.where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
			.limit(1);
		if (!category) return fail(403, { message: 'Category not found.' });

		if (parentFolderId) {
			const [parent] = await db
				.select({ id: folders.id })
				.from(folders)
				.where(and(eq(folders.id, parentFolderId), eq(folders.categoryId, categoryId), eq(folders.userId, userId)))
				.limit(1);
			if (!parent) return fail(400, { message: 'Parent folder not found.' });
		}

		await db.insert(folders).values({ userId, categoryId, name, parentFolderId });
	},

	deleteFolder: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const folderId = formData.get('folderId')?.toString() ?? '';
		if (!folderId) return fail(400);
		await db.delete(folders).where(and(eq(folders.id, folderId), eq(folders.userId, userId)));
	},

	bulkArchive: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const ids = formData.getAll('noteId').map((id) => id.toString()).filter(Boolean);
		if (ids.length === 0) return fail(400);
		await db.update(notes).set({ isArchived: true }).where(and(eq(notes.userId, userId), inArray(notes.id, ids)));
	},

	bulkDelete: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const ids = formData.getAll('noteId').map((id) => id.toString()).filter(Boolean);
		if (ids.length === 0) return fail(400);
		await db.delete(notes).where(and(eq(notes.userId, userId), inArray(notes.id, ids)));
	},

	editCategory: async (event) => {
		const userId = event.locals.user!.id;
		const { slug } = event.params;
		const formData = await event.request.formData();

		const name = formData.get('name')?.toString().trim() ?? '';
		const description = formData.get('description')?.toString().trim() || null;
		const icon = formData.get('icon')?.toString() ?? '📁';
		const color = formData.get('color')?.toString() ?? '#f97316';

		if (!name) return fail(400, { editMessage: 'Name is required.' });

		const newSlug = slugify(name);

		await db
			.update(categories)
			.set({ name, description, icon, color, slug: newSlug })
			.where(and(eq(categories.slug, slug), eq(categories.userId, userId)));

		if (newSlug !== slug) redirect(302, `/categories/${newSlug}`);

		return { editSuccess: true };
	}
};
