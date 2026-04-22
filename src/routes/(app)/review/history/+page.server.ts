import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { reviewLogs } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const logs = await db
		.select({
			id: reviewLogs.id,
			noteId: reviewLogs.noteId,
			noteTitle: reviewLogs.noteTitle,
			result: reviewLogs.result,
			reviewedAt: reviewLogs.reviewedAt,
			date: sql<string>`DATE(${reviewLogs.reviewedAt})`
		})
		.from(reviewLogs)
		.where(eq(reviewLogs.userId, userId))
		.orderBy(desc(reviewLogs.reviewedAt))
		.limit(500);

	// Group by date
	const grouped = new Map<string, typeof logs>();
	for (const log of logs) {
		const d = log.date;
		if (!grouped.has(d)) grouped.set(d, []);
		grouped.get(d)!.push(log);
	}

	const sessions = Array.from(grouped.entries()).map(([date, entries]) => ({
		date,
		total: entries.length,
		gotIt: entries.filter((e) => e.result === 'got_it').length,
		needsWork: entries.filter((e) => e.result === 'needs_work').length,
		entries
	}));

	return { sessions };
};
