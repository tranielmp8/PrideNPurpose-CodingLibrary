import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = (event) => {
	if (!event.locals.user) redirect(302, '/login');
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();

		const name = formData.get('name')?.toString().trim() ?? '';
		const description = formData.get('description')?.toString().trim() ?? '';
		const icon = formData.get('icon')?.toString() ?? '📁';
		const color = formData.get('color')?.toString() ?? '#f97316';

		if (!name) return fail(400, { message: 'Name is required.' });

		let slug = slugify(name);

		const existing = await db
			.select({ id: categories.id })
			.from(categories)
			.where(and(eq(categories.userId, userId), eq(categories.slug, slug)))
			.limit(1);

		if (existing.length > 0) slug = `${slug}-${Date.now()}`;

		const [created] = await db
			.insert(categories)
			.values({ userId, name, slug, description: description || null, icon, color })
			.returning({ slug: categories.slug });

		redirect(302, `/categories/${created.slug}`);
	}
};
