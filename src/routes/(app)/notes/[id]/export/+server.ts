import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { notes, categories, tags, noteTagLinks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { buildMarkdownFile } from '$lib/utils/markdownExport';

export const GET: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) error(401, 'Unauthorized');

	const { id } = event.params;

	const [note] = await db
		.select()
		.from(notes)
		.where(and(eq(notes.id, id), eq(notes.userId, userId)))
		.limit(1);

	if (!note) error(404, 'Note not found');

	const [category, noteTags] = await Promise.all([
		db.select({ name: categories.name }).from(categories).where(eq(categories.id, note.categoryId)).limit(1).then((r) => r[0]),
		db
			.select({ name: tags.name })
			.from(noteTagLinks)
			.innerJoin(tags, eq(noteTagLinks.tagId, tags.id))
			.where(eq(noteTagLinks.noteId, id))
	]);

	const markdown = buildMarkdownFile({
		title: note.title,
		contentJson: note.contentJson,
		status: note.status,
		difficulty: note.difficulty,
		categoryName: category?.name,
		tags: noteTags.map((t) => t.name),
		createdAt: note.createdAt,
		updatedAt: note.updatedAt
	});

	const filename = note.title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '') || 'note';

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}.md"`
		}
	});
};
