import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { guides, guideNodes, categories } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const rows = await db
		.select({
			id: guides.id,
			title: guides.title,
			slug: guides.slug,
			description: guides.description,
			updatedAt: guides.updatedAt,
			categoryName: categories.name,
			categoryIcon: categories.icon
		})
		.from(guides)
		.leftJoin(categories, eq(guides.categoryId, categories.id))
		.where(eq(guides.userId, userId))
		.orderBy(guides.updatedAt);

	const nodeCounts = await db
		.select({ guideId: guideNodes.guideId, count: count() })
		.from(guideNodes)
		.groupBy(guideNodes.guideId);

	const countMap = new Map(nodeCounts.map((r) => [r.guideId, Number(r.count)]));

	return {
		guides: rows.map((g) => ({ ...g, nodeCount: countMap.get(g.id) ?? 0 }))
	};
};
