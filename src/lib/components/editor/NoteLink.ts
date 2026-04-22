import { Node, mergeAttributes } from '@tiptap/core';

export const NoteLink = Node.create({
	name: 'noteLink',
	group: 'inline',
	inline: true,
	atom: true,

	addAttributes() {
		return {
			noteId: { default: null },
			noteTitle: { default: '' }
		};
	},

	parseHTML() {
		return [{ tag: 'a[data-note-link]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'a',
			mergeAttributes(HTMLAttributes, {
				'data-note-link': 'true',
				href: `/notes/${HTMLAttributes.noteId}`,
				class: 'note-link-node'
			}),
			`[[${HTMLAttributes.noteTitle}]]`
		];
	}
});
