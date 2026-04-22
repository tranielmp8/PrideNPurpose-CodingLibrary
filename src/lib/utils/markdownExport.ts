type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = { type: string; attrs?: Record<string, unknown>; content?: Node[]; text?: string; marks?: Mark[] };

function applyMarks(text: string, marks: Mark[] = []): string {
	let out = text;
	for (const m of marks) {
		switch (m.type) {
			case 'bold': out = `**${out}**`; break;
			case 'italic': out = `*${out}*`; break;
			case 'code': out = `\`${out}\``; break;
			case 'strike': out = `~~${out}~~`; break;
			case 'link': out = `[${out}](${m.attrs?.href ?? ''})`; break;
		}
	}
	return out;
}

function inline(node: Node): string {
	return (node.content ?? []).map((n) => {
		if (n.type === 'text') return applyMarks(n.text ?? '', n.marks);
		if (n.type === 'hardBreak') return '  \n';
		if (n.type === 'noteLink') return `[[${n.attrs?.noteTitle ?? ''}]]`;
		return inline(n);
	}).join('');
}

function convert(node: Node, depth = 0): string {
	switch (node.type) {
		case 'doc':
			return (node.content ?? []).map((n) => convert(n, depth)).filter(Boolean).join('\n\n');

		case 'heading':
			return '#'.repeat((node.attrs?.level as number) ?? 1) + ' ' + inline(node);

		case 'paragraph':
			return inline(node);

		case 'codeBlock': {
			const lang = (node.attrs?.language as string) ?? '';
			const code = (node.content ?? []).map((n) => n.text ?? '').join('');
			return '```' + lang + '\n' + code + '\n```';
		}

		case 'bulletList':
			return (node.content ?? []).map((item) => listItem(item, depth, '-')).join('\n');

		case 'orderedList':
			return (node.content ?? []).map((item, i) => listItem(item, depth, `${i + 1}.`)).join('\n');

		case 'blockquote': {
			const inner = (node.content ?? []).map((n) => convert(n, depth)).join('\n');
			return inner.split('\n').map((l) => '> ' + l).join('\n');
		}

		case 'horizontalRule':
			return '---';

		case 'taskList':
			return (node.content ?? []).map((item) => {
				const checked = item.attrs?.checked ? '[x]' : '[ ]';
				const text = inline((item.content ?? [])[0] ?? { type: 'paragraph', content: [] });
				return '  '.repeat(depth) + `- ${checked} ${text}`;
			}).join('\n');

		case 'image': {
			const src = (node.attrs?.src as string) ?? '';
			const alt = (node.attrs?.alt as string) ?? '';
			return `![${alt}](${src})`;
		}

		default:
			return inline(node);
	}
}

function listItem(node: Node, depth: number, bullet: string): string {
	const [first, ...rest] = node.content ?? [];
	const text = first ? inline(first) : '';
	const prefix = '  '.repeat(depth) + bullet + ' ';
	const nested = rest.map((n) => convert(n, depth + 1)).filter(Boolean).join('\n');
	return prefix + text + (nested ? '\n' + nested : '');
}

export function tiptapToMarkdown(contentJson: string | null, title: string): string {
	let body = '';
	if (contentJson) {
		try {
			const doc: Node = JSON.parse(contentJson);
			body = convert(doc);
		} catch {
			body = '';
		}
	}
	return body || `# ${title}\n`;
}

export function buildMarkdownFile(opts: {
	title: string;
	contentJson: string | null;
	status: string;
	difficulty: string;
	categoryName?: string;
	tags?: string[];
	createdAt: Date;
	updatedAt: Date;
}): string {
	const { title, contentJson, status, difficulty, categoryName, tags = [], createdAt, updatedAt } = opts;

	const frontmatter = [
		'---',
		`title: "${title.replace(/"/g, '\\"')}"`,
		`status: ${status}`,
		`difficulty: ${difficulty}`,
		categoryName ? `category: "${categoryName}"` : null,
		tags.length ? `tags: [${tags.map((t) => `"${t}"`).join(', ')}]` : null,
		`created: ${createdAt.toISOString().split('T')[0]}`,
		`updated: ${updatedAt.toISOString().split('T')[0]}`,
		'---'
	].filter(Boolean).join('\n');

	const body = tiptapToMarkdown(contentJson, title);

	return frontmatter + '\n\n' + body;
}
