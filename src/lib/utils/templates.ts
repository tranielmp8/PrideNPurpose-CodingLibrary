export type TemplateName = 'blank' | 'concept' | 'codePattern' | 'debugLog' | 'commandRef';

const h2 = (text: string) => ({
	type: 'heading',
	attrs: { level: 2 },
	content: [{ type: 'text', text }]
});
const p = () => ({ type: 'paragraph', content: [] });
const code = (lang = 'plaintext') => ({
	type: 'codeBlock',
	attrs: { language: lang },
	content: [{ type: 'text', text: '' }]
});
const bullets = () => ({
	type: 'bulletList',
	content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [] }] }]
});

export const TEMPLATES: Record<TemplateName, { label: string; icon: string; content: object | null }> = {
	blank: {
		label: 'Blank',
		icon: '📄',
		content: null
	},
	concept: {
		label: 'Concept',
		icon: '💡',
		content: {
			type: 'doc',
			content: [h2('What is it?'), p(), h2('How does it work?'), p(), h2('When to use it?'), p(), h2('Example'), p()]
		}
	},
	codePattern: {
		label: 'Code Pattern',
		icon: '🔧',
		content: {
			type: 'doc',
			content: [h2('Problem'), p(), h2('Solution'), p(), h2('Code'), code(), h2('Gotchas & Notes'), bullets()]
		}
	},
	debugLog: {
		label: 'Debug Log',
		icon: '🐛',
		content: {
			type: 'doc',
			content: [h2('Problem'), p(), h2('Steps Tried'), bullets(), h2('Root Cause'), p(), h2('Fix'), code(), h2('Prevention'), p()]
		}
	},
	commandRef: {
		label: 'Command Ref',
		icon: '💲',
		content: {
			type: 'doc',
			content: [h2('Command'), code('bash'), h2('Common Flags'), bullets(), h2('Examples'), p(), h2('Notes'), p()]
		}
	}
};

export function getTemplateContent(name: string): string | null {
	const t = TEMPLATES[name as TemplateName];
	if (!t?.content) return null;
	return JSON.stringify(t.content);
}
