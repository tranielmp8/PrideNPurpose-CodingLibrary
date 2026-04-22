import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, notes } from '$lib/server/db/schema';
import { eq, desc, count, and, or, isNull, lte, isNotNull, gte, sql } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const now = new Date();

	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

	const [userCategories, recentNotes, statusRows, dueResult, reviewDates, weekActivity] = await Promise.all([
		db
			.select({
				id: categories.id,
				name: categories.name,
				slug: categories.slug,
				icon: categories.icon,
				color: categories.color,
				noteCount: count(notes.id)
			})
			.from(categories)
			.leftJoin(notes, eq(notes.categoryId, categories.id))
			.where(eq(categories.userId, userId))
			.groupBy(categories.id)
			.orderBy(categories.sortOrder)
			.limit(8),

		db
			.select({
				id: notes.id,
				title: notes.title,
				slug: notes.slug,
				status: notes.status,
				updatedAt: notes.updatedAt,
				categoryId: notes.categoryId
			})
			.from(notes)
			.where(eq(notes.userId, userId))
			.orderBy(desc(notes.updatedAt))
			.limit(6),

		db
			.select({ status: notes.status, count: count() })
			.from(notes)
			.where(and(eq(notes.userId, userId), eq(notes.isArchived, false)))
			.groupBy(notes.status),

		db
			.select({ count: count() })
			.from(notes)
			.where(and(eq(notes.userId, userId), eq(notes.isArchived, false), or(isNull(notes.nextReviewAt), lte(notes.nextReviewAt, now)))),

		db
			.select({ date: sql<string>`DATE(${notes.lastReviewedAt})` })
			.from(notes)
			.where(and(eq(notes.userId, userId), isNotNull(notes.lastReviewedAt)))
			.orderBy(sql`DATE(${notes.lastReviewedAt}) DESC`),

		db
			.select({ date: sql<string>`DATE(${notes.lastReviewedAt})`, count: count() })
			.from(notes)
			.where(and(eq(notes.userId, userId), isNotNull(notes.lastReviewedAt), gte(notes.lastReviewedAt, sevenDaysAgo)))
			.groupBy(sql`DATE(${notes.lastReviewedAt})`)
	]);

	const stats = { learning: 0, reviewing: 0, mastered: 0, total: 0 };
	for (const row of statusRows) {
		const n = Number(row.count);
		stats[row.status] = n;
		stats.total += n;
	}

	// Compute streak from distinct review dates
	const dateSet = new Set(reviewDates.map((r) => r.date));
	const todayStr = now.toISOString().split('T')[0];
	const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
	let streak = 0;
	if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
		let check = new Date(dateSet.has(todayStr) ? todayStr : yesterdayStr);
		while (dateSet.has(check.toISOString().split('T')[0])) {
			streak++;
			check = new Date(check.getTime() - 86400000);
		}
	}

	// Build 7-day chart: last 7 days including today
	const activityMap = new Map(weekActivity.map((r) => [r.date, Number(r.count)]));
	const chart = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(now.getTime() - (6 - i) * 86400000);
		const dateStr = d.toISOString().split('T')[0];
		return {
			label: d.toLocaleDateString('en-US', { weekday: 'short' }),
			count: activityMap.get(dateStr) ?? 0
		};
	});

	return {
		categories: userCategories,
		recentNotes,
		stats,
		dueCount: Number(dueResult[0]?.count ?? 0),
		streak,
		chart
	};
};
