<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const statusColors: Record<string, string> = {
		learning: 'text-amber-400 bg-amber-400/10',
		reviewing: 'text-blue-400 bg-blue-400/10',
		mastered: 'text-emerald-400 bg-emerald-400/10'
	};

	let showNewNoteForm = $state(false);
	let showNewFolderForm = $state(false);
	let showEditForm = $state(false);
	let newNoteTitle = $state('');
	let newFolderName = $state('');
	let selectedTemplate = $state('blank');

	const templateOptions = [
		{ id: 'blank', icon: '📄', label: 'Blank' },
		{ id: 'concept', icon: '💡', label: 'Concept' },
		{ id: 'codePattern', icon: '🔧', label: 'Code Pattern' },
		{ id: 'debugLog', icon: '🐛', label: 'Debug Log' },
		{ id: 'commandRef', icon: '💲', label: 'Command Ref' }
	];

	// Edit form state — seeded from current category
	let editIcon = $state(data.category.icon ?? '📁');
	let editColor = $state(data.category.color ?? '#f97316');
	let editLoading = $state(false);

	const icons = [
		// Folders & general
		'📁','📂','📚','📝','📄','🗒️',
		// Web frameworks
		'⚛️','💚','🔸','▲','🌀','🚀','💿','🅰️',
		// Languages
		'🦀','🐹','🐍','📘','☕','💎','🐘','🦅','🔷','📜','💧','🌙','🐪','🔴',
		// Tools & infra
		'💻','🌐','🗄️','🐳','📦','🔧','☁️','🏗️','🔌','🔀','🖥️','🐧','🔐',
		// Concepts & data
		'⚡','🔥','🎯','🌿','🧪','🧮','📊','🤖','🔍','🔄','💡','🛠️','🗺️','🏆',
		// Misc tech
		'🕸️','💨','🍃','🔩','⚙️','🛡️','📡','🎨','🧩','🔑'
	];
	const colors = [
		{ label: 'Indigo',  value: '#f97316' },
		{ label: 'Violet',  value: '#8b5cf6' },
		{ label: 'Blue',    value: '#3b82f6' },
		{ label: 'Cyan',    value: '#06b6d4' },
		{ label: 'Emerald', value: '#10b981' },
		{ label: 'Teal',    value: '#14b8a6' },
		{ label: 'Rose',    value: '#f43f5e' },
		{ label: 'Orange',  value: '#f97316' },
		{ label: 'Amber',   value: '#f59e0b' }
	];

	function timeAgo(date: Date | string) {
		const d = new Date(date);
		const diff = Math.floor((Date.now() - d.getTime()) / 1000);
		if (diff < 60) return 'just now';
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
		return `${Math.floor(diff / 86400)}d ago`;
	}

	const notesWithoutFolder = $derived(data.notes.filter((n) => !n.folderId));
	const notesInFolder = (folderId: string) => data.notes.filter((n) => n.folderId === folderId);

	// Bulk selection
	let selected = $state(new Set<string>());
	let bulkLoading = $state(false);
	const allIds = $derived(data.notes.map((n) => n.id));
	const allSelected = $derived(allIds.length > 0 && allIds.every((id) => selected.has(id)));

	function toggleNote(id: string) {
		if (selected.has(id)) selected.delete(id);
		else selected.add(id);
		selected = selected;
	}

	function toggleAll() {
		if (allSelected) selected = new Set();
		else selected = new Set(allIds);
	}

	async function bulkAction(action: 'bulkArchive' | 'bulkDelete') {
		if (selected.size === 0) return;
		const label = action === 'bulkDelete' ? 'permanently delete' : 'archive';
		if (!confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${selected.size} note${selected.size > 1 ? 's' : ''}?`)) return;
		bulkLoading = true;
		const body = new FormData();
		for (const id of selected) body.append('noteId', id);
		await fetch(`?/${action}`, { method: 'POST', body });
		bulkLoading = false;
		selected = new Set();
		window.location.reload();
	}

	type Folder = (typeof data.folders)[0] & { children: Folder[] };
	function buildFolderTree(folders: typeof data.folders): Folder[] {
		const map = new Map<string, Folder>(folders.map((f) => [f.id, { ...f, children: [] }]));
		const roots: Folder[] = [];
		for (const f of map.values()) {
			if (f.parentFolderId && map.has(f.parentFolderId)) map.get(f.parentFolderId)!.children.push(f);
			else roots.push(f);
		}
		return roots;
	}
	const folderTree = $derived(buildFolderTree(data.folders));
	let addingSubfolderTo = $state<string | null>(null);
</script>

<div class="mx-auto max-w-4xl px-8 py-10">
	<!-- Breadcrumb -->
	<div class="mb-6 flex items-center gap-2 text-sm text-slate-500">
		<a href="/categories" class="hover:text-slate-300 transition-colors">Categories</a>
		<span>›</span>
		<span class="text-slate-300">{data.category.name}</span>
	</div>

	<!-- Category header -->
	<div class="mb-8 flex items-start gap-5">
		<span class="text-6xl">{data.category.icon}</span>
		<div class="flex-1">
			<h1 class="text-3xl font-bold text-slate-900 dark:text-white">{data.category.name}</h1>
			{#if data.category.description}
				<p class="mt-1 text-slate-400">{data.category.description}</p>
			{/if}
			<div class="mt-3 flex items-center gap-4 text-sm text-slate-500">
				<span>{data.notes.length} {data.notes.length === 1 ? 'note' : 'notes'}</span>
				<span>{data.folders.length} {data.folders.length === 1 ? 'folder' : 'folders'}</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={() => { showEditForm = !showEditForm; showNewNoteForm = false; showNewFolderForm = false; }}
				class="rounded-lg border border-[#2d2d2d] px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-[#333333] hover:text-white"
			>
				✏️ Edit
			</button>
			<button
				onclick={() => { showNewFolderForm = !showNewFolderForm; showNewNoteForm = false; showEditForm = false; }}
				class="rounded-lg border border-[#2d2d2d] px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-[#333333] hover:text-white"
			>
				+ Folder
			</button>
			<button
				onclick={() => { showNewNoteForm = !showNewNoteForm; showNewFolderForm = false; showEditForm = false; }}
				class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
			>
				+ New Note
			</button>
		</div>
	</div>

	<!-- Edit category form -->
	{#if showEditForm}
		<form
			method="post"
			action="?/editCategory"
			use:enhance={() => {
				editLoading = true;
				return async ({ update, result }) => {
					editLoading = false;
					if (result.type !== 'redirect') showEditForm = false;
					await update();
				};
			}}
			class="mb-8 rounded-xl border border-orange-700/40 bg-orange-950/20 p-5 space-y-5"
		>
			<input type="hidden" name="icon" value={editIcon} />
			<input type="hidden" name="color" value={editColor} />

			<div class="flex items-center justify-between">
				<h3 class="font-semibold text-white">Edit category</h3>
				<button type="button" onclick={() => showEditForm = false} class="text-slate-500 hover:text-slate-300">✕</button>
			</div>

			<!-- Name + description -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-1.5 block text-xs font-medium text-slate-400" for="edit-name">Name</label>
					<input
						id="edit-name"
						type="text"
						name="name"
						required
						value={data.category.name}
						class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
					/>
				</div>
				<div>
					<label class="mb-1.5 block text-xs font-medium text-slate-400" for="edit-desc">Description</label>
					<input
						id="edit-desc"
						type="text"
						name="description"
						value={data.category.description ?? ''}
						placeholder="Optional"
						class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none"
					/>
				</div>
			</div>

			<!-- Icon picker -->
			<div>
				<p class="mb-2 text-xs font-medium text-slate-400">Icon</p>
				<div class="flex flex-wrap gap-1.5">
					{#each icons as icon}
						<button
							type="button"
							onclick={() => editIcon = icon}
							class="rounded-lg px-2.5 py-1.5 text-lg transition-colors {editIcon === icon
								? 'bg-orange-500/20 ring-1 ring-orange-500'
								: 'bg-[#1e1e1e] hover:bg-[#282828]'}"
						>{icon}</button>
					{/each}
				</div>
			</div>

			<!-- Color picker -->
			<div>
				<p class="mb-2 text-xs font-medium text-slate-400">Color</p>
				<div class="flex flex-wrap gap-2">
					{#each colors as c}
						<button
							type="button"
							onclick={() => editColor = c.value}
							title={c.label}
							class="h-7 w-7 rounded-full transition-transform hover:scale-110 {editColor === c.value
								? 'ring-2 ring-white ring-offset-2 ring-offset-[#181818]'
								: ''}"
							style="background-color: {c.value}"
						></button>
					{/each}
				</div>
			</div>

			{#if form?.editMessage}
				<p class="text-sm text-red-400">{form.editMessage}</p>
			{/if}

			<div class="flex gap-3">
				<button
					type="submit"
					disabled={editLoading}
					class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-60"
				>
					{editLoading ? 'Saving…' : 'Save changes'}
				</button>
				<button
					type="button"
					onclick={() => showEditForm = false}
					class="rounded-lg border border-[#2d2d2d] px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
				>
					Cancel
				</button>
			</div>
		</form>
	{/if}

	<!-- Quick-create new note form -->
	{#if showNewNoteForm}
		<form
			method="post"
			action="?/createNote"
			use:enhance
			class="mb-6 space-y-3 rounded-xl border border-orange-700/40 bg-orange-950/20 p-4"
		>
			<input type="hidden" name="categoryId" value={data.category.id} />
			<input type="hidden" name="template" value={selectedTemplate} />
			<div class="flex items-center gap-3">
				<input
					type="text"
					name="title"
					bind:value={newNoteTitle}
					placeholder="Note title…"
					autofocus
					class="flex-1 rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
				/>
				<button
					type="submit"
					class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-red-600"
				>Create</button>
				<button type="button" onclick={() => (showNewNoteForm = false)} class="text-slate-500 hover:text-slate-300">✕</button>
			</div>
			<!-- Template picker -->
			<div class="flex flex-wrap gap-1.5">
				{#each templateOptions as t}
					<button
						type="button"
						onclick={() => (selectedTemplate = t.id)}
						class="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {selectedTemplate === t.id
							? 'bg-orange-500 text-white'
							: 'bg-[#1e1e1e] text-slate-400 hover:text-slate-200'}"
					>{t.icon} {t.label}</button>
				{/each}
			</div>
		</form>
	{/if}

	<!-- Quick-create folder form -->
	{#if showNewFolderForm}
		<form
			method="post"
			action="?/createFolder"
			use:enhance={() => async ({ update }) => { showNewFolderForm = false; newFolderName = ''; await update(); }}
			class="mb-6 flex items-center gap-3 rounded-xl border border-[#2d2d2d] bg-[#181818] p-4"
		>
			<input type="hidden" name="categoryId" value={data.category.id} />
			<input
				type="text"
				name="name"
				bind:value={newFolderName}
				placeholder="Folder name…"
				autofocus
				class="flex-1 rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
			/>
			<button
				type="submit"
				class="rounded-lg border border-[#333333] px-4 py-2 text-sm font-medium text-slate-300 hover:bg-[#282828]"
			>
				Create
			</button>
			<button
				type="button"
				onclick={() => (showNewFolderForm = false)}
				class="text-slate-500 hover:text-slate-300"
			>
				✕
			</button>
		</form>
	{/if}

	<!-- Folders (nested) -->
	{#snippet folderNode(folder: Folder, depth: number)}
		{@const folderNotes = notesInFolder(folder.id)}
		<details class="group rounded-xl border border-gray-400 dark:border-[#252525] bg-white dark:bg-[#181818]" style="margin-left: {depth * 20}px">
			<summary class="flex cursor-pointer items-center gap-2 px-4 py-3.5 select-none">
				<span class="text-xs text-slate-400 transition-transform group-open:rotate-90">▶</span>
				<span class="text-slate-500">📂</span>
				<span class="font-medium text-slate-900 dark:text-white">{folder.name}</span>
				<span class="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						type="button"
						onclick={(e) => { e.preventDefault(); addingSubfolderTo = addingSubfolderTo === folder.id ? null : folder.id; }}
						class="rounded px-2 py-0.5 text-xs text-slate-400 hover:bg-orange-500/10 hover:text-orange-400 transition-colors"
						title="Add subfolder"
					>+ subfolder</button>
					<form method="post" action="?/deleteFolder" use:enhance={() => async ({ update }) => { await update(); }}>
						<input type="hidden" name="folderId" value={folder.id} />
						<button
							type="submit"
							onclick={(e) => { e.stopPropagation(); }}
							class="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
							title="Delete folder"
						>✕</button>
					</form>
				</span>
				<span class="text-xs text-slate-500 ml-2 group-hover:hidden">
					{folderNotes.length + folder.children.reduce((s, c) => s + notesInFolder(c.id).length, 0)} notes
				</span>
			</summary>

			<!-- Subfolder creation form -->
			{#if addingSubfolderTo === folder.id}
				<form
					method="post"
					action="?/createFolder"
					use:enhance={() => async ({ update }) => { addingSubfolderTo = null; await update(); }}
					class="mx-4 mb-2 mt-1 flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/5 px-3 py-2"
				>
					<input type="hidden" name="categoryId" value={data.category.id} />
					<input type="hidden" name="parentFolderId" value={folder.id} />
					<input
						type="text"
						name="name"
						placeholder="Subfolder name…"
						autofocus
						class="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
					/>
					<button type="submit" class="text-xs font-medium text-orange-400 hover:text-orange-300">Create</button>
					<button type="button" onclick={() => (addingSubfolderTo = null)} class="text-slate-500 hover:text-slate-300 text-xs">✕</button>
				</form>
			{/if}

			<!-- Child folders -->
			{#if folder.children.length > 0}
				<div class="mx-3 mb-2 space-y-2 pt-1">
					{#each folder.children as child}
						{@render folderNode(child, 0)}
					{/each}
				</div>
			{/if}

			<!-- Notes in this folder -->
			{#if folderNotes.length > 0}
				<div class="border-t border-gray-200 dark:border-[#252525]">
					{#each folderNotes as note}
						<a
							href="/notes/{note.id}"
							class="group/note flex items-center justify-between px-5 py-3 transition-all hover:bg-orange-50 hover:ring-1 hover:ring-inset hover:ring-orange-400/50 dark:hover:bg-[#1e1e1e] dark:hover:ring-orange-500/40 last:rounded-b-xl"
						>
							<div class="flex items-center gap-3">
								<span class="text-slate-500 text-sm">📄</span>
								<span class="text-slate-700 dark:text-slate-200 group-hover/note:text-orange-500 dark:group-hover/note:text-orange-500 transition-colors">{note.title}</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize {statusColors[note.status]}">{note.status}</span>
								<span class="text-xs text-slate-500">{timeAgo(note.updatedAt)}</span>
							</div>
						</a>
					{/each}
				</div>
			{:else if folder.children.length === 0}
				<p class="px-5 py-3 text-sm text-slate-500">No notes in this folder yet.</p>
			{/if}
		</details>
	{/snippet}

	{#if folderTree.length > 0}
		<div class="mb-8 space-y-3">
			{#each folderTree as folder}
				{@render folderNode(folder, 0)}
			{/each}
		</div>
	{/if}

	<!-- Notes (no folder) -->
	<div>
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">
				{data.folders.length > 0 ? 'Unsorted Notes' : 'Notes'}
			</h2>
			{#if data.notes.length > 0}
				<button
					onclick={toggleAll}
					class="text-xs text-slate-500 transition-colors hover:text-slate-300"
				>
					{allSelected ? 'Deselect all' : 'Select all'}
				</button>
			{/if}
		</div>

		{#if data.notes.length === 0}
			<div class="rounded-xl border border-dashed border-[#2d2d2d] bg-[#181818] py-12 text-center">
				<div class="mb-2 text-3xl">📝</div>
				<p class="text-slate-500">No notes yet.</p>
				<button
					onclick={() => (showNewNoteForm = true)}
					class="mt-4 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
				>
					Create the first note →
				</button>
			</div>
		{:else if notesWithoutFolder.length === 0 && data.folders.length > 0}
			<p class="text-sm text-slate-600">All notes are organized in folders.</p>
		{:else}
			<div class="divide-y divide-gray-400 dark:divide-[#252525] rounded-xl border border-gray-400 dark:border-[#252525] bg-white dark:bg-[#181818]">
				{#each notesWithoutFolder as note}
					<div class="group flex items-center first:rounded-t-xl last:rounded-b-xl {selected.has(note.id) ? 'bg-orange-50 dark:bg-orange-500/5' : ''}">
						<label class="flex cursor-pointer items-center pl-4 pr-2 py-4">
							<input
								type="checkbox"
								checked={selected.has(note.id)}
								onchange={() => toggleNote(note.id)}
								class="h-4 w-4 rounded accent-orange-500"
							/>
						</label>
						<a
							href="/notes/{note.id}"
							class="flex flex-1 items-center justify-between py-4 pr-5 transition-all hover:text-orange-500 group-hover:bg-orange-50/50 dark:group-hover:bg-[#1e1e1e]/50"
						>
							<div class="flex items-center gap-3">
								<span class="text-slate-600">📄</span>
								<span class="font-medium text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-500 transition-colors">{note.title}</span>
								{#if note.isPinned}<span class="text-orange-400 text-xs">📌</span>{/if}
								{#if note.isFavorite}<span class="text-amber-400 text-sm">★</span>{/if}
							</div>
							<div class="flex items-center gap-3">
								<span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {statusColors[note.status]}">{note.status}</span>
								<span class="text-xs text-slate-600">{timeAgo(note.updatedAt)}</span>
							</div>
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Bulk action floating bar -->
	{#if selected.size > 0}
		<div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-gray-300 bg-white px-5 py-3 shadow-2xl dark:border-[#2d2d2d] dark:bg-[#1e1e1e]">
			<span class="text-sm font-medium text-slate-900 dark:text-white">
				{selected.size} note{selected.size > 1 ? 's' : ''} selected
			</span>
			<div class="h-4 w-px bg-gray-300 dark:bg-[#333]"></div>
			<button
				onclick={() => bulkAction('bulkArchive')}
				disabled={bulkLoading}
				class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-[#2d2d2d] dark:text-slate-300 dark:hover:bg-[#333]"
			>
				🗃️ Archive
			</button>
			<button
				onclick={() => bulkAction('bulkDelete')}
				disabled={bulkLoading}
				class="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
			>
				🗑️ Delete
			</button>
			<button
				onclick={() => (selected = new Set())}
				class="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
			>✕</button>
		</div>
	{/if}
</div>
