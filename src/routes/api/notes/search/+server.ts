import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { and, eq, ilike } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) return json([]);

	const q = event.url.searchParams.get('q') ?? '';

	const results = await db
		.select({ id: notes.id, title: notes.title })
		.from(notes)
		.where(and(eq(notes.userId, userId), eq(notes.isArchived, false), ilike(notes.title, `%${q}%`)))
		.limit(8);

	return json(results);
};
