import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { guides, categories } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const cats = await db
		.select({ id: categories.id, name: categories.name, icon: categories.icon })
		.from(categories)
		.where(eq(categories.userId, userId))
		.orderBy(categories.name);
	return { categories: cats };
};

export const actions: Actions = {
	default: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();

		const title = formData.get('title')?.toString().trim() ?? '';
		const description = formData.get('description')?.toString().trim() ?? '';
		const categoryId = formData.get('categoryId')?.toString() ?? '';

		if (!title) return fail(400, { message: 'Title is required.' });

		let slug = slugify(title);
		const existing = await db
			.select({ id: guides.id })
			.from(guides)
			.where(and(eq(guides.userId, userId), eq(guides.slug, slug)))
			.limit(1);
		if (existing.length > 0) slug = `${slug}-${Date.now()}`;

		const [created] = await db
			.insert(guides)
			.values({
				userId,
				title,
				slug,
				description: description || null,
				categoryId: categoryId || null
			})
			.returning({ id: guides.id });

		redirect(302, `/guides/${created.id}`);
	}
};
