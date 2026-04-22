<script lang="ts">
	import { onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
	import Placeholder from '@tiptap/extension-placeholder';
	import TaskList from '@tiptap/extension-task-list';
	import TaskItem from '@tiptap/extension-task-item';
	import Link from '@tiptap/extension-link';
	import { common, createLowlight } from 'lowlight';
	import { NoteLink } from './NoteLink';

	let {
		content = '',
		onUpdate
	}: {
		content?: string;
		onUpdate: (json: string) => void;
	} = $props();

	let element: HTMLDivElement;
	let editor: Editor | undefined;

	// Toolbar reactive state
	let isBold = $state(false);
	let isItalic = $state(false);
	let isStrike = $state(false);
	let isCode = $state(false);
	let isH1 = $state(false);
	let isH2 = $state(false);
	let isH3 = $state(false);
	let isBullet = $state(false);
	let isOrdered = $state(false);
	let isTask = $state(false);
	let isBlockquote = $state(false);
	let isCodeBlock = $state(false);

	// Note-link autocomplete state
	let suggestOpen = $state(false);
	let suggestResults = $state<{ id: string; title: string }[]>([]);
	let suggestIndex = $state(0);
	let suggestX = $state(0);
	let suggestY = $state(0);
	let suggestStart = $state(0);
	let fetchTimer: ReturnType<typeof setTimeout> | null = null;

	function syncState() {
		if (!editor) return;
		isBold = editor.isActive('bold');
		isItalic = editor.isActive('italic');
		isStrike = editor.isActive('strike');
		isCode = editor.isActive('code');
		isH1 = editor.isActive('heading', { level: 1 });
		isH2 = editor.isActive('heading', { level: 2 });
		isH3 = editor.isActive('heading', { level: 3 });
		isBullet = editor.isActive('bulletList');
		isOrdered = editor.isActive('orderedList');
		isTask = editor.isActive('taskList');
		isBlockquote = editor.isActive('blockquote');
		isCodeBlock = editor.isActive('codeBlock');
	}

	function injectCopyButtons() {
		const pres = element?.querySelectorAll<HTMLElement>('.ProseMirror pre');
		pres?.forEach((pre) => {
			if (pre.querySelector('.code-copy-btn')) return;
			const btn = document.createElement('button');
			btn.className = 'code-copy-btn';
			btn.type = 'button';
			btn.textContent = 'Copy';
			btn.addEventListener('click', () => {
				const code = pre.querySelector('code')?.textContent ?? '';
				navigator.clipboard.writeText(code).then(() => {
					btn.textContent = '✓ Copied';
					btn.classList.add('copied');
					setTimeout(() => {
						btn.textContent = 'Copy';
						btn.classList.remove('copied');
					}, 2000);
				});
			});
			pre.appendChild(btn);
		});
	}

	function checkForNoteTrigger(e: Editor) {
		const { from } = e.state.selection;
		const textBefore = e.state.doc.textBetween(Math.max(0, from - 200), from, '\n');
		const match = textBefore.match(/\[\[([^\]\n]*)$/);

		if (match) {
			const query = match[1];
			suggestStart = from - match[0].length;
			suggestIndex = 0;

			try {
				const coords = e.view.coordsAtPos(from);
				const editorRect = element.getBoundingClientRect();
				suggestX = coords.left - editorRect.left;
				suggestY = coords.bottom - editorRect.top + 4;
			} catch {
				// position unavailable, skip
			}

			suggestOpen = true;

			if (fetchTimer) clearTimeout(fetchTimer);
			fetchTimer = setTimeout(async () => {
				const res = await fetch(`/api/notes/search?q=${encodeURIComponent(query)}`);
				suggestResults = await res.json();
			}, 120);
		} else {
			suggestOpen = false;
		}
	}

	function insertNoteLink(note: { id: string; title: string }) {
		if (!editor) return;
		const { from } = editor.state.selection;
		editor
			.chain()
			.focus()
			.deleteRange({ from: suggestStart, to: from })
			.insertContent({ type: 'noteLink', attrs: { noteId: note.id, noteTitle: note.title } })
			.run();
		suggestOpen = false;
		suggestResults = [];
	}

	function handleEditorKeydown(e: KeyboardEvent) {
		if (!suggestOpen || suggestResults.length === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			suggestIndex = (suggestIndex + 1) % suggestResults.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			suggestIndex = (suggestIndex - 1 + suggestResults.length) % suggestResults.length;
		} else if (e.key === 'Enter' || e.key === 'Tab') {
			e.preventDefault();
			insertNoteLink(suggestResults[suggestIndex]);
		} else if (e.key === 'Escape') {
			suggestOpen = false;
		}
	}

	onMount(() => {
		const lowlight = createLowlight(common);

		editor = new Editor({
			element,
			extensions: [
				StarterKit.configure({ codeBlock: false }),
				CodeBlockLowlight.configure({ lowlight }),
				Placeholder.configure({ placeholder: 'Start writing your notes… (type [[ to link a note)' }),
				TaskList,
				TaskItem.configure({ nested: true }),
				Link.configure({ openOnClick: false }),
				NoteLink
			],
			content: content ? JSON.parse(content) : '',
			onTransaction: syncState,
			onUpdate: ({ editor: e }) => {
				onUpdate(JSON.stringify(e.getJSON()));
				checkForNoteTrigger(e);
				injectCopyButtons();
			}
		});

		element.addEventListener('keydown', handleEditorKeydown, true);
		setTimeout(injectCopyButtons, 100);

		return () => {
			element.removeEventListener('keydown', handleEditorKeydown, true);
			editor?.destroy();
		};
	});

	function btn(active: boolean) {
		return active
			? 'bg-orange-500/20 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300 ring-1 ring-orange-500'
			: 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#282828] hover:text-slate-900 dark:hover:text-white';
	}

	function addLink() {
		const url = window.prompt('Enter URL:');
		if (!url) return;
		editor?.chain().focus().setLink({ href: url }).run();
	}
</script>

<div class="relative flex flex-col">
	<!-- Toolbar -->
	<div
		class="flex flex-wrap items-center gap-0.5 border-b border-gray-400 dark:border-[#2d2d2d] bg-gray-50 dark:bg-[#181818] px-3 py-2"
	>
		<!-- Headings -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
			class="rounded px-2.5 py-1.5 text-sm font-bold transition-colors {btn(isH1)}"
			title="Heading 1"
		>H1</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			class="rounded px-2.5 py-1.5 text-sm font-bold transition-colors {btn(isH2)}"
			title="Heading 2"
		>H2</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
			class="rounded px-2.5 py-1.5 text-sm font-bold transition-colors {btn(isH3)}"
			title="Heading 3"
		>H3</button>

		<div class="mx-1.5 h-5 w-px bg-gray-300 dark:bg-[#282828]"></div>

		<!-- Inline marks -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleBold().run()}
			class="rounded px-2.5 py-1.5 text-sm font-bold transition-colors {btn(isBold)}"
			title="Bold"
		><b>B</b></button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleItalic().run()}
			class="rounded px-2.5 py-1.5 text-sm italic transition-colors {btn(isItalic)}"
			title="Italic"
		>I</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleStrike().run()}
			class="rounded px-2.5 py-1.5 text-sm line-through transition-colors {btn(isStrike)}"
			title="Strikethrough"
		>S</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleCode().run()}
			class="rounded px-2.5 py-1.5 font-mono text-sm transition-colors {btn(isCode)}"
			title="Inline code"
		>`c`</button>

		<div class="mx-1.5 h-5 w-px bg-gray-300 dark:bg-[#282828]"></div>

		<!-- Lists -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleBulletList().run()}
			class="rounded px-2.5 py-1.5 text-sm transition-colors {btn(isBullet)}"
			title="Bullet list"
		>• List</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleOrderedList().run()}
			class="rounded px-2.5 py-1.5 text-sm transition-colors {btn(isOrdered)}"
			title="Numbered list"
		>1. List</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleTaskList().run()}
			class="rounded px-2.5 py-1.5 text-sm transition-colors {btn(isTask)}"
			title="Task list"
		>☐ Tasks</button>

		<div class="mx-1.5 h-5 w-px bg-gray-300 dark:bg-[#282828]"></div>

		<!-- Block types -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleBlockquote().run()}
			class="rounded px-2.5 py-1.5 text-sm transition-colors {btn(isBlockquote)}"
			title="Blockquote"
		>" Quote</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
			class="rounded px-2.5 py-1.5 font-mono text-sm transition-colors {btn(isCodeBlock)}"
			title="Code block"
		>{'</>'}</button>
		<button
			type="button"
			onclick={addLink}
			class="rounded px-2.5 py-1.5 text-sm transition-colors {btn(false)}"
			title="Add link"
		>🔗 Link</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().setHorizontalRule().run()}
			class="rounded px-2.5 py-1.5 text-sm text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-[#282828] hover:text-slate-900 dark:hover:text-white"
			title="Horizontal rule"
		>— Rule</button>

		<div class="mx-1.5 h-5 w-px bg-gray-300 dark:bg-[#282828]"></div>

		<span class="text-xs text-slate-400 dark:text-slate-600 select-none">
			[[ to link note
		</span>
	</div>

	<!-- Editor area -->
	<div
		bind:this={element}
		class="tiptap-editor min-h-96 flex-1 px-6 py-5 focus-within:outline-none"
	></div>

	<!-- Note-link autocomplete dropdown -->
	{#if suggestOpen && suggestResults.length > 0}
		<div
			class="note-suggest-dropdown absolute z-50 min-w-56 max-w-xs rounded-xl border border-gray-300 bg-white shadow-xl dark:border-[#2d2d2d] dark:bg-[#1e1e1e]"
			style="left: {suggestX}px; top: {suggestY}px;"
		>
			<p class="border-b border-gray-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:border-[#2d2d2d]">
				Link to note
			</p>
			{#each suggestResults as note, i}
				<button
					type="button"
					onmousedown={(e) => { e.preventDefault(); insertNoteLink(note); }}
					class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors {i === suggestIndex
						? 'bg-orange-500/10 text-orange-500 dark:text-orange-400'
						: 'text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#282828]'}"
				>
					<span class="text-slate-400">📄</span>
					{note.title}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	:global(.tiptap-editor .ProseMirror) {
		outline: none;
		min-height: 400px;
	}

	:global(.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before) {
		color: #94a3b8;
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
	:global(.dark .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before) {
		color: #64748b;
	}

	/* Headings — light mode */
	:global(.tiptap-editor .ProseMirror h1) { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin: 1.5rem 0 0.75rem; }
	:global(.tiptap-editor .ProseMirror h2) { font-size: 1.5rem; font-weight: 600; color: #0f172a; margin: 1.25rem 0 0.5rem; }
	:global(.tiptap-editor .ProseMirror h3) { font-size: 1.25rem; font-weight: 600; color: #1e293b; margin: 1rem 0 0.5rem; }

	/* Headings — dark mode */
	:global(.dark .tiptap-editor .ProseMirror h1) { color: #f1f5f9; }
	:global(.dark .tiptap-editor .ProseMirror h2) { color: #f1f5f9; }
	:global(.dark .tiptap-editor .ProseMirror h3) { color: #e2e8f0; }

	/* Paragraphs and text — light mode */
	:global(.tiptap-editor .ProseMirror p) { color: #334155; line-height: 1.75; margin: 0.5rem 0; }
	:global(.tiptap-editor .ProseMirror strong) { color: #0f172a; }
	:global(.tiptap-editor .ProseMirror em) { color: #1e293b; }
	:global(.tiptap-editor .ProseMirror s) { color: #64748b; }

	/* Paragraphs and text — dark mode */
	:global(.dark .tiptap-editor .ProseMirror p) { color: #cbd5e1; }
	:global(.dark .tiptap-editor .ProseMirror strong) { color: #f1f5f9; }
	:global(.dark .tiptap-editor .ProseMirror em) { color: #e2e8f0; }
	:global(.dark .tiptap-editor .ProseMirror s) { color: #94a3b8; }

	/* Lists */
	:global(.tiptap-editor .ProseMirror ul) { list-style: disc; padding-left: 1.5rem; color: #334155; margin: 0.5rem 0; }
	:global(.tiptap-editor .ProseMirror ol) { list-style: decimal; padding-left: 1.5rem; color: #334155; margin: 0.5rem 0; }
	:global(.dark .tiptap-editor .ProseMirror ul) { color: #cbd5e1; }
	:global(.dark .tiptap-editor .ProseMirror ol) { color: #cbd5e1; }
	:global(.tiptap-editor .ProseMirror li) { margin: 0.25rem 0; }

	/* Task list */
	:global(.tiptap-editor .ProseMirror ul[data-type="taskList"]) { list-style: none; padding-left: 0.5rem; }
	:global(.tiptap-editor .ProseMirror ul[data-type="taskList"] li) { display: flex; align-items: flex-start; gap: 0.5rem; }
	:global(.tiptap-editor .ProseMirror ul[data-type="taskList"] li > label) { margin-top: 0.15rem; }
	:global(.tiptap-editor .ProseMirror ul[data-type="taskList"] input[type="checkbox"]) { accent-color: #f97316; }

	/* Inline code */
	:global(.tiptap-editor .ProseMirror code:not(pre code)) {
		background: #252525;
		color: #fb923c;
		padding: 0.15rem 0.4rem;
		border-radius: 0.25rem;
		font-family: ui-monospace, monospace;
		font-size: 0.875em;
	}

	/* Code blocks + syntax highlighting → defined globally in layout.css */

	/* Blockquote */
	:global(.tiptap-editor .ProseMirror blockquote) {
		border-left: 3px solid #f97316;
		padding-left: 1rem;
		color: #94a3b8;
		font-style: italic;
		margin: 0.75rem 0;
	}

	/* Horizontal rule */
	:global(.tiptap-editor .ProseMirror hr) { border: none; border-top: 1px solid #252525; margin: 1.5rem 0; }

	/* Links */
	:global(.tiptap-editor .ProseMirror a) { color: #fb923c; text-decoration: underline; }

	/* Note-link inline node */
	:global(.tiptap-editor .ProseMirror .note-link-node) {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: color-mix(in srgb, #f97316 12%, transparent);
		color: #f97316;
		border: 1px solid color-mix(in srgb, #f97316 30%, transparent);
		border-radius: 0.375rem;
		padding: 0.05rem 0.45rem;
		font-size: 0.875em;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition: background 0.15s;
	}
	:global(.tiptap-editor .ProseMirror .note-link-node:hover) {
		background: color-mix(in srgb, #f97316 22%, transparent);
		text-decoration: none;
	}
</style>
