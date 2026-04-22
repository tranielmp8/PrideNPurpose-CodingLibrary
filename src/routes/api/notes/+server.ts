import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { notes, categories } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { slugify } from '$lib/utils/slugify';
import { getTemplateContent } from '$lib/utils/templates';

export const GET: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) error(401);

	const cats = await db
		.select({ id: categories.id, name: categories.name, icon: categories.icon })
		.from(categories)
		.where(eq(categories.userId, userId))
		.orderBy(categories.name);

	return json(cats);
};

export const POST: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) error(401);

	const body = await event.request.json();
	const { title, categoryId, template } = body as { title: string; categoryId: string; template?: string };

	if (!categoryId) error(400, 'categoryId required');

	const [cat] = await db
		.select({ id: categories.id })
		.from(categories)
		.where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
		.limit(1);
	if (!cat) error(403);

	const slug = `${slugify(title || 'untitled')}-${Date.now()}`;
	const contentJson = getTemplateContent(template ?? 'blank');

	const [note] = await db
		.insert(notes)
		.values({ userId, categoryId, title: title?.trim() || 'Untitled', slug, contentJson })
		.returning({ id: notes.id });

	return json({ id: note.id });
};
