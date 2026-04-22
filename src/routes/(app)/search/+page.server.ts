import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { notes, snippets, categories } from '$lib/server/db/schema';
import { ilike, or, and, eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const q = event.url.searchParams.get('q')?.trim() ?? '';

	if (!q) return { q, notes: [], snippets: [] };

	const pattern = `%${q}%`;

	const [noteResults, snippetResults] = await Promise.all([
		db
			.select({
				id: notes.id,
				title: notes.title,
				excerpt: notes.excerpt,
				status: notes.status,
				difficulty: notes.difficulty,
				updatedAt: notes.updatedAt,
				categoryName: categories.name,
				categoryIcon: categories.icon,
				categorySlug: categories.slug
			})
			.from(notes)
			.leftJoin(categories, eq(notes.categoryId, categories.id))
			.where(and(eq(notes.userId, userId), or(ilike(notes.title, pattern), ilike(notes.excerpt, pattern))))
			.orderBy(notes.updatedAt)
			.limit(30),

		db
			.select()
			.from(snippets)
			.where(
				and(
					eq(snippets.userId, userId),
					or(
						ilike(snippets.title, pattern),
						ilike(snippets.description, pattern),
						ilike(snippets.code, pattern)
					)
				)
			)
			.limit(20)
	]);

	return { q, notes: noteResults, snippets: snippetResults };
};
