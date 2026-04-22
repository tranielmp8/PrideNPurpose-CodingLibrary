import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { snippets, categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const userCategories = await db
		.select({ id: categories.id, name: categories.name, icon: categories.icon })
		.from(categories)
		.where(eq(categories.userId, userId))
		.orderBy(categories.sortOrder);
	return { categories: userCategories };
};

export const actions: Actions = {
	default: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();

		const title = formData.get('title')?.toString().trim() ?? '';
		const language = formData.get('language')?.toString() ?? 'plaintext';
		const description = formData.get('description')?.toString().trim() || null;
		const code = formData.get('code')?.toString() ?? '';
		const categoryId = formData.get('categoryId')?.toString() || null;

		if (!title) return fail(400, { message: 'Title is required.' });
		if (!code) return fail(400, { message: 'Code is required.' });

		const [created] = await db
			.insert(snippets)
			.values({ userId, title, language, description, code, categoryId })
			.returning({ id: snippets.id });

		redirect(302, `/snippets/${created.id}`);
	}
};
