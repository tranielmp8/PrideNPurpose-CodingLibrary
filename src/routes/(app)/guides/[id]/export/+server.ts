import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { guides, guideNodes, categories } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) error(401, 'Unauthorized');

	const { id } = event.params;

	const [guide] = await db
		.select({
			id: guides.id,
			title: guides.title,
			description: guides.description,
			categoryName: categories.name
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

	const nodeMap = new Map(nodes.map((n) => [n.id, n]));

	function getPath(nodeId: string): string {
		const parts: string[] = [];
		let cur = nodeMap.get(nodeId);
		while (cur) {
			parts.unshift(cur.name);
			cur = cur.parentId ? nodeMap.get(cur.parentId) : undefined;
		}
		return parts.join('/');
	}

	function buildTree(parentId: string | null): typeof nodes {
		return nodes
			.filter((n) => (n.parentId ?? null) === parentId)
			.sort((a, b) => {
				if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
				return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
			});
	}

	function renderTree(parentId: string | null, depth: number): string {
		const children = buildTree(parentId);
		return children
			.map((n) => {
				const indent = '  '.repeat(depth);
				const prefix = n.type === 'directory' ? '📁' : '📄';
				const line = `${indent}- ${prefix} ${n.name}`;
				if (n.type === 'directory') {
					const sub = renderTree(n.id, depth + 1);
					return sub ? `${line}\n${sub}` : line;
				}
				return line;
			})
			.join('\n');
	}

	const lines: string[] = [];

	// Frontmatter
	lines.push('---');
	lines.push(`title: "${guide.title.replace(/"/g, '\\"')}"`);
	if (guide.categoryName) lines.push(`category: "${guide.categoryName}"`);
	lines.push(`exported: ${new Date().toISOString().split('T')[0]}`);
	lines.push('---', '');

	// Title + description
	lines.push(`# ${guide.title}`, '');
	if (guide.description) lines.push(`> ${guide.description}`, '');

	// File tree
	lines.push('## File Structure', '');
	lines.push('```');
	lines.push(renderTree(null, 0));
	lines.push('```', '');

	// File sections (files only, sorted by path)
	const fileNodes = nodes
		.filter((n) => n.type === 'file')
		.sort((a, b) => getPath(a.id).localeCompare(getPath(b.id)));

	for (const node of fileNodes) {
		const path = getPath(node.id);
		lines.push('---', '');
		lines.push(`## \`${path}\``, '');

		if (node.explanation) {
			lines.push('### Explanation', '');
			lines.push(node.explanation, '');
		}

		if (node.codeContent) {
			lines.push('### Code', '');
			lines.push('```' + (node.codeLanguage ?? 'plaintext'));
			lines.push(node.codeContent);
			lines.push('```', '');
		}
	}

	const markdown = lines.join('\n');
	const slug = guide.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `attachment; filename="${slug}-guide.md"`
		}
	});
};
