import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { snippets, categories } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const { id } = event.params;

	const [row] = await db
		.select({
			id: snippets.id,
			title: snippets.title,
			language: snippets.language,
			description: snippets.description,
			code: snippets.code,
			categoryId: snippets.categoryId,
			createdAt: snippets.createdAt,
			updatedAt: snippets.updatedAt,
			categoryName: categories.name,
			categorySlug: categories.slug
		})
		.from(snippets)
		.leftJoin(categories, eq(snippets.categoryId, categories.id))
		.where(and(eq(snippets.id, id), eq(snippets.userId, userId)))
		.limit(1);

	if (!row) error(404, 'Snippet not found');

	const userCategories = await db
		.select({ id: categories.id, name: categories.name, icon: categories.icon })
		.from(categories)
		.where(eq(categories.userId, userId))
		.orderBy(categories.sortOrder);

	return { snippet: row, categories: userCategories };
};

export const actions: Actions = {
	save: async (event) => {
		const userId = event.locals.user!.id;
		const { id } = event.params;
		const formData = await event.request.formData();

		const title = formData.get('title')?.toString().trim() ?? '';
		const language = formData.get('language')?.toString() ?? 'plaintext';
		const description = formData.get('description')?.toString().trim() || null;
		const code = formData.get('code')?.toString() ?? '';
		const categoryId = formData.get('categoryId')?.toString() || null;

		if (!title) return fail(400, { message: 'Title is required.' });
		if (!code) return fail(400, { message: 'Code is required.' });

		await db
			.update(snippets)
			.set({ title, language, description, code, categoryId })
			.where(and(eq(snippets.id, id), eq(snippets.userId, userId)));

		return { success: true };
	},

	delete: async (event) => {
		const userId = event.locals.user!.id;
		const { id } = event.params;

		await db
			.delete(snippets)
			.where(and(eq(snippets.id, id), eq(snippets.userId, userId)));

		redirect(302, '/snippets');
	}
};
