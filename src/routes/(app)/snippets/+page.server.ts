import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { snippets, categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const rows = await db
		.select({
			id: snippets.id,
			title: snippets.title,
			language: snippets.language,
			description: snippets.description,
			code: snippets.code,
			createdAt: snippets.createdAt,
			updatedAt: snippets.updatedAt,
			categoryId: snippets.categoryId,
			categoryName: categories.name,
			categorySlug: categories.slug
		})
		.from(snippets)
		.leftJoin(categories, eq(snippets.categoryId, categories.id))
		.where(eq(snippets.userId, userId))
		.orderBy(snippets.updatedAt);

	return { snippets: rows };
};
