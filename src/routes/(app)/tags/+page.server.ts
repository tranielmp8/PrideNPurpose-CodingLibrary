import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { tags, noteTagLinks } from '$lib/server/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;

	const rows = await db
		.select({ id: tags.id, name: tags.name, color: tags.color, count: count(noteTagLinks.noteId) })
		.from(tags)
		.leftJoin(noteTagLinks, eq(noteTagLinks.tagId, tags.id))
		.where(eq(tags.userId, userId))
		.groupBy(tags.id)
		.orderBy(tags.name);

	return { tags: rows };
};

export const actions: Actions = {
	deleteTag: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const tagId = formData.get('tagId')?.toString() ?? '';
		if (!tagId) return fail(400);
		await db.delete(tags).where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
		return { success: true };
	}
};
