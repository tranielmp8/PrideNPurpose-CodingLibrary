import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, notes } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const userCategories = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug,
			description: categories.description,
			icon: categories.icon,
			color: categories.color,
			sortOrder: categories.sortOrder,
			noteCount: count(notes.id)
		})
		.from(categories)
		.leftJoin(notes, eq(notes.categoryId, categories.id))
		.where(eq(categories.userId, userId))
		.groupBy(categories.id)
		.orderBy(categories.sortOrder);

	return { categories: userCategories };
};
