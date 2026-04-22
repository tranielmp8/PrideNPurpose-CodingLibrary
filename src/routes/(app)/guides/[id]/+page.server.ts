import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { guides, guideNodes, categories } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user!.id;
	const { id } = event.params;

	const [guide] = await db
		.select({
			id: guides.id,
			title: guides.title,
			description: guides.description,
			categoryName: categories.name,
			categoryIcon: categories.icon
		})
		.from(guides)
		.leftJoin(categories, eq(guides.categoryId, categories.id))
		.where(and(eq(guides.id, id), eq(guides.userId, userId)))
		.limit(1);

	if (!guide) error(404, 'Guide not found');

	const nodes = await db
		.select()
		.from(guideNodes)
		.where(eq(guideNodes.guideId, id))
		.orderBy(guideNodes.sortOrder);

	return { guide, nodes };
};

export const actions: Actions = {
	addNode: async (event) => {
		const userId = event.locals.user!.id;
		const { id: guideId } = event.params;
		const formData = await event.request.formData();

		const name = formData.get('name')?.toString().trim() ?? '';
		const type = formData.get('type')?.toString() as 'file' | 'directory';
		const parentId = formData.get('parentId')?.toString() || null;

		if (!name) return fail(400, { message: 'Name is required.' });

		const [guide] = await db
			.select({ id: guides.id })
			.from(guides)
			.where(and(eq(guides.id, guideId), eq(guides.userId, userId)))
			.limit(1);
		if (!guide) return fail(403);

		const siblings = await db
			.select({ sortOrder: guideNodes.sortOrder })
			.from(guideNodes)
			.where(eq(guideNodes.guideId, guideId));
		const maxOrder = siblings.reduce((m, n) => Math.max(m, n.sortOrder), -1);

		const [node] = await db
			.insert(guideNodes)
			.values({ guideId, parentId, name, type, sortOrder: maxOrder + 1 })
			.returning({ id: guideNodes.id });

		return { success: true, nodeId: node.id };
	},

	updateNode: async (event) => {
		const userId = event.locals.user!.id;
		const { id: guideId } = event.params;
		const formData = await event.request.formData();

		const nodeId = formData.get('nodeId')?.toString() ?? '';
		const name = formData.get('name')?.toString().trim();
		const explanation = formData.get('explanation')?.toString();
		const codeContent = formData.get('codeContent')?.toString();
		const codeLanguage = formData.get('codeLanguage')?.toString();

		const [guide] = await db
			.select({ id: guides.id })
			.from(guides)
			.where(and(eq(guides.id, guideId), eq(guides.userId, userId)))
			.limit(1);
		if (!guide) return fail(403);

		await db
			.update(guideNodes)
			.set({
				...(name !== undefined && { name }),
				...(explanation !== undefined && { explanation: explanation || null }),
				...(codeContent !== undefined && { codeContent: codeContent || null }),
				...(codeLanguage !== undefined && { codeLanguage })
			})
			.where(and(eq(guideNodes.id, nodeId), eq(guideNodes.guideId, guideId)));

		return { success: true };
	},

	deleteNode: async (event) => {
		const userId = event.locals.user!.id;
		const { id: guideId } = event.params;
		const formData = await event.request.formData();
		const nodeId = formData.get('nodeId')?.toString() ?? '';

		const [guide] = await db
			.select({ id: guides.id })
			.from(guides)
			.where(and(eq(guides.id, guideId), eq(guides.userId, userId)))
			.limit(1);
		if (!guide) return fail(403);

		await db
			.delete(guideNodes)
			.where(and(eq(guideNodes.id, nodeId), eq(guideNodes.guideId, guideId)));

		return { success: true };
	},

	deleteGuide: async (event) => {
		const userId = event.locals.user!.id;
		const { id: guideId } = event.params;

		await db.delete(guides).where(and(eq(guides.id, guideId), eq(guides.userId, userId)));
		redirect(302, '/guides');
	},

	updateGuide: async (event) => {
		const userId = event.locals.user!.id;
		const { id: guideId } = event.params;
		const formData = await event.request.formData();

		const title = formData.get('title')?.toString().trim() ?? '';
		const description = formData.get('description')?.toString().trim() ?? '';

		if (!title) return fail(400, { message: 'Title is required.' });

		await db
			.update(guides)
			.set({ title, description: description || null })
			.where(and(eq(guides.id, guideId), eq(guides.userId, userId)));

		return { success: true };
	}
};
