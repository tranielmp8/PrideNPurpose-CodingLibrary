<script lang="ts">
	import { enhance } from '$app/forms';
	import HighlightedCode from '$lib/components/ui/HighlightedCode.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type RawNode = (typeof data.nodes)[0];
	type TreeNode = RawNode & { children: TreeNode[] };

	function buildTree(nodes: RawNode[]): TreeNode[] {
		const map = new Map<string, TreeNode>();
		for (const n of nodes) map.set(n.id, { ...n, children: [] });
		const roots: TreeNode[] = [];
		for (const n of map.values()) {
			if (n.parentId && map.has(n.parentId)) map.get(n.parentId)!.children.push(n);
			else roots.push(n);
		}
		const sort = (list: TreeNode[]) => {
			list.sort((a, b) => {
				if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
				return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
			});
			list.forEach((n) => sort(n.children));
		};
		sort(roots);
		return roots;
	}

	const nodeMap = $derived(new Map(data.nodes.map((n) => [n.id, n])));
	const tree = $derived(buildTree(data.nodes));

	let selectedNodeId = $state<string | null>(null);
	let expandedDirs = $state<Record<string, boolean>>(
		Object.fromEntries(data.nodes.filter((n) => n.type === 'directory').map((n) => [n.id, true]))
	);
	let editingNode = $state(false);
	let addingTo = $state<string | null | undefined>(undefined); // undefined = not adding, null = root
	let addingType = $state<'file' | 'directory'>('file');
	let editingGuideTitle = $state(false);
	let confirmDelete = $state<string | null>(null);

	const selectedNode = $derived(selectedNodeId ? nodeMap.get(selectedNodeId) ?? null : null);

	function getPath(nodeId: string): string {
		const parts: string[] = [];
		let cur = nodeMap.get(nodeId);
		while (cur) {
			parts.unshift(cur.name);
			cur = cur.parentId ? nodeMap.get(cur.parentId) : undefined;
		}
		return parts.join(' / ');
	}

	function fileIcon(name: string, type: string): string {
		if (type === 'directory') return '📁';
		const ext = name.split('.').pop()?.toLowerCase() ?? '';
		const icons: Record<string, string> = {
			rs: '🦀', toml: '⚙️', lock: '🔒', json: '📋', md: '📝', ts: '🔷',
			js: '🟨', html: '🌐', css: '🎨', sh: '💲', yaml: '⚙️', yml: '⚙️',
			py: '🐍', go: '🐹', sql: '🗄️', env: '🔐', gitignore: '🙈', dockerfile: '🐳'
		};
		const byName: Record<string, string> = {
			'.gitignore': '🙈', 'dockerfile': '🐳', 'makefile': '🔧', 'readme.md': '📖'
		};
		return byName[name.toLowerCase()] ?? icons[ext] ?? '📄';
	}

	const languages = [
		'plaintext','rust','typescript','javascript','python','go','sql',
		'bash','html','css','json','yaml','toml','markdown','cpp','java'
	];

	// After addNode action, select the newly created node
	$effect(() => {
		if (form && 'nodeId' in form && form.nodeId) {
			selectedNodeId = form.nodeId as string;
			editingNode = true;
			addingTo = undefined;
		}
	});
</script>

<!-- Full-height split layout -->
<div class="flex h-full overflow-hidden">

	<!-- ── File Tree Panel ──────────────────────────────────── -->
	<div class="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-[#1e1e1e] dark:bg-[#111111]">
		<!-- Tree header -->
		<div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-[#1e1e1e]">
			<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Files</span>
			<div class="flex gap-1">
				<button
					title="Add file at root"
					onclick={() => { addingTo = null; addingType = 'file'; }}
					class="rounded p-1 text-slate-400 transition-colors hover:text-orange-500"
				>📄+</button>
				<button
					title="Add directory at root"
					onclick={() => { addingTo = null; addingType = 'directory'; }}
					class="rounded p-1 text-slate-400 transition-colors hover:text-orange-500"
				>📁+</button>
			</div>
		</div>

		<!-- Tree -->
		<div class="flex-1 overflow-y-auto py-2">
			{#snippet treeNode(node: TreeNode, depth: number)}
				<div>
					<div
						class="group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors {selectedNodeId === node.id
							? 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400'
							: 'text-slate-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5'}"
						style="padding-left: {12 + depth * 16}px"
					>
						{#if node.type === 'directory'}
							<button
								onclick={() => expandedDirs[node.id] = !expandedDirs[node.id]}
								class="shrink-0 text-xs text-slate-400 transition-transform {expandedDirs[node.id] ? 'rotate-90' : ''}"
							>▶</button>
						{:else}
							<span class="w-3 shrink-0"></span>
						{/if}

						<button
							onclick={() => { selectedNodeId = node.id; editingNode = false; }}
							class="flex flex-1 items-center gap-1.5 overflow-hidden text-left"
						>
							<span class="shrink-0 text-sm leading-none">{fileIcon(node.name, node.type)}</span>
							<span class="truncate">{node.name}</span>
						</button>

						<!-- Hover actions -->
						{#if node.type === 'directory'}
							<button
								title="Add file here"
								onclick={(e) => { e.stopPropagation(); addingTo = node.id; addingType = 'file'; expandedDirs[node.id] = true; }}
								class="shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-orange-500"
							>📄+</button>
							<button
								title="Add directory here"
								onclick={(e) => { e.stopPropagation(); addingTo = node.id; addingType = 'directory'; expandedDirs[node.id] = true; }}
								class="shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-orange-500"
							>📁+</button>
						{/if}
						<button
							title="Delete"
							onclick={(e) => { e.stopPropagation(); confirmDelete = node.id; }}
							class="shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
						>✕</button>
					</div>

					<!-- Inline add form -->
					{#if addingTo === node.id}
						<form
							method="post"
							action="?/addNode"
							use:enhance={() => async ({ update }) => { await update({ reset: false }); addingTo = undefined; }}
							class="mx-2 mb-1 flex items-center gap-1 rounded-md border border-orange-400/40 bg-orange-50 px-2 py-1 dark:bg-orange-500/5"
							style="margin-left: {16 + depth * 16}px"
						>
							<input type="hidden" name="parentId" value={node.id} />
							<input type="hidden" name="type" value={addingType} />
							<span class="text-sm">{addingType === 'directory' ? '📁' : '📄'}</span>
							<input
								type="text"
								name="name"
								autofocus
								placeholder="{addingType === 'file' ? 'filename.ext' : 'dirname'}"
								class="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400 dark:text-white"
							/>
							<button type="submit" class="text-xs text-orange-500 hover:text-orange-400">Add</button>
							<button type="button" onclick={() => addingTo = undefined} class="text-xs text-slate-400 hover:text-slate-600">✕</button>
						</form>
					{/if}

					<!-- Children -->
					{#if node.type === 'directory' && expandedDirs[node.id]}
						{#each node.children as child}
							{@render treeNode(child, depth + 1)}
						{/each}
					{/if}
				</div>
			{/snippet}

			{#each tree as node}
				{@render treeNode(node, 0)}
			{/each}

			<!-- Root-level add form -->
			{#if addingTo === null}
				<form
					method="post"
					action="?/addNode"
					use:enhance={() => async ({ update }) => { await update({ reset: false }); addingTo = undefined; }}
					class="mx-2 mb-1 flex items-center gap-1 rounded-md border border-orange-400/40 bg-orange-50 px-2 py-1.5 dark:bg-orange-500/5"
				>
					<input type="hidden" name="type" value={addingType} />
					<span class="text-sm">{addingType === 'directory' ? '📁' : '📄'}</span>
					<input
						type="text"
						name="name"
						autofocus
						placeholder="{addingType === 'file' ? 'filename.ext' : 'dirname'}"
						class="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400 dark:text-white"
					/>
					<button type="submit" class="text-xs text-orange-500 hover:text-orange-400">Add</button>
					<button type="button" onclick={() => addingTo = undefined} class="text-xs text-slate-400 hover:text-slate-600">✕</button>
				</form>
			{/if}

			{#if tree.length === 0 && addingTo === undefined}
				<p class="px-4 py-6 text-center text-xs text-slate-500">No files yet.<br />Use the + buttons above.</p>
			{/if}
		</div>
	</div>

	<!-- ── Content Panel ─────────────────────────────────────── -->
	<div class="flex flex-1 flex-col overflow-hidden">

		<!-- Guide title bar -->
		<div class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-[#1e1e1e] dark:bg-[#0d0d0d]">
			<div class="flex items-center gap-3 min-w-0">
				<a href="/guides" class="shrink-0 text-sm text-slate-400 transition-colors hover:text-orange-400">← Guides</a>
				<span class="text-slate-300 dark:text-slate-600">/</span>
				{#if editingGuideTitle}
					<form
						method="post"
						action="?/updateGuide"
						use:enhance={() => async ({ update }) => { await update({ reset: false }); editingGuideTitle = false; }}
						class="flex items-center gap-2"
					>
						<input
							type="text"
							name="title"
							value={data.guide.title}
							autofocus
							class="rounded border border-orange-400 bg-transparent px-2 py-0.5 text-sm font-semibold text-slate-900 focus:outline-none dark:text-white"
						/>
						<input type="hidden" name="description" value={data.guide.description ?? ''} />
						<button type="submit" class="text-xs text-orange-400 hover:text-orange-300">Save</button>
						<button type="button" onclick={() => editingGuideTitle = false} class="text-xs text-slate-400">✕</button>
					</form>
				{:else}
					<button
						onclick={() => editingGuideTitle = true}
						class="truncate text-sm font-semibold text-slate-900 transition-colors hover:text-orange-500 dark:text-white dark:hover:text-orange-400"
					>{data.guide.title}</button>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				<a
					href="/guides/{data.guide.id}/export"
					class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:text-slate-400 dark:hover:text-orange-400"
					title="Download as Markdown"
				>↓ .md</a>
				<form method="post" action="?/deleteGuide"
					use:enhance={() => async ({ update }) => { await update(); }}
				>
					<button type="submit" class="text-xs text-slate-400 transition-colors hover:text-red-400"
						onclick={(e) => { if (!confirm('Delete this guide?')) e.preventDefault(); }}
					>Delete guide</button>
				</form>
			</div>
		</div>

		<!-- Main content area -->
		<div class="flex-1 overflow-y-auto">
			{#if !selectedNode}
				<!-- Empty state -->
				<div class="flex h-full flex-col items-center justify-center gap-4 text-center">
					<div class="text-6xl">📂</div>
					<div>
						<p class="font-semibold text-slate-900 dark:text-white">Select a file to view its content</p>
						<p class="mt-1 text-sm text-slate-500">Or use the + buttons in the file tree to add files and directories.</p>
					</div>
				</div>

			{:else}
				<div class="mx-auto max-w-3xl px-8 py-8">
					<!-- File path header -->
					<div class="mb-6 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="text-2xl">{fileIcon(selectedNode.name, selectedNode.type)}</span>
							<div>
								<p class="text-xs text-slate-500">{getPath(selectedNode.id)}</p>
								<h2 class="text-lg font-bold text-slate-900 dark:text-white">{selectedNode.name}</h2>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<button
								onclick={() => editingNode = !editingNode}
								class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:text-slate-400 dark:hover:text-orange-400"
							>{editingNode ? 'Cancel' : '✏️ Edit'}</button>
						</div>
					</div>

					{#if editingNode}
						<!-- ── Edit Form ── -->
						<form
							method="post"
							action="?/updateNode"
							use:enhance={() => async ({ update }) => { await update({ reset: false }); editingNode = false; }}
							class="space-y-5"
						>
							<input type="hidden" name="nodeId" value={selectedNode.id} />

							<div>
								<label class="mb-1 block text-xs font-medium text-slate-500" for="node-name">Name</label>
								<input
									id="node-name"
									type="text"
									name="name"
									value={selectedNode.name}
									class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-white"
								/>
							</div>

							<div>
								<label class="mb-1 block text-xs font-medium text-slate-500" for="node-explanation">Explanation</label>
								<textarea
									id="node-explanation"
									name="explanation"
									rows="6"
									placeholder="What is this file for? What does it contain? Why does it exist?"
									class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-white dark:placeholder-slate-500"
								>{selectedNode.explanation ?? ''}</textarea>
							</div>

							{#if selectedNode.type === 'file'}
								<div class="grid grid-cols-4 gap-3">
									<div class="col-span-1">
										<label class="mb-1 block text-xs font-medium text-slate-500" for="node-lang">Language</label>
										<select
											id="node-lang"
											name="codeLanguage"
											class="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-white"
										>
											{#each languages as lang}
												<option value={lang} selected={selectedNode.codeLanguage === lang}>{lang}</option>
											{/each}
										</select>
									</div>
									<div class="col-span-3">
										<label class="mb-1 block text-xs font-medium text-slate-500" for="node-code">Code example</label>
										<textarea
											id="node-code"
											name="codeContent"
											rows="12"
											placeholder="Paste example code for this file…"
											class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#181818] dark:text-slate-200 dark:placeholder-slate-500"
										>{selectedNode.codeContent ?? ''}</textarea>
									</div>
								</div>
							{/if}

							<div class="flex gap-3 pt-1">
								<button
									type="submit"
									class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-red-600"
								>Save</button>
								<button
									type="button"
									onclick={() => editingNode = false}
									class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-slate-600 hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:text-slate-400"
								>Cancel</button>
							</div>
						</form>

					{:else}
						<!-- ── View Mode ── -->
						{#if selectedNode.explanation}
							<div class="mb-8">
								<h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Explanation</h3>
								<div class="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-slate-700 dark:border-[#252525] dark:bg-[#181818] dark:text-slate-300 whitespace-pre-wrap">
									{selectedNode.explanation}
								</div>
							</div>
						{:else}
							<div class="mb-8 rounded-xl border border-dashed border-gray-300 p-5 text-center dark:border-[#2d2d2d]">
								<p class="text-sm text-slate-500">No explanation yet.</p>
								<button onclick={() => editingNode = true} class="mt-1 text-sm text-orange-400 hover:text-orange-300">Add one →</button>
							</div>
						{/if}

						{#if selectedNode.type === 'file'}
							{#if selectedNode.codeContent}
								<div>
									<div class="mb-3 flex items-center justify-between">
										<h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Code Example</h3>
										<span class="rounded-full px-2.5 py-0.5 text-xs font-medium text-orange-400 bg-orange-400/10">
											{selectedNode.codeLanguage ?? 'plaintext'}
										</span>
									</div>
									<div class="overflow-hidden rounded-xl border border-gray-200 dark:border-[#252525]">
										<HighlightedCode
											code={selectedNode.codeContent}
											language={selectedNode.codeLanguage ?? 'plaintext'}
										/>
									</div>
								</div>
							{:else}
								<div class="rounded-xl border border-dashed border-gray-300 p-5 text-center dark:border-[#2d2d2d]">
									<p class="text-sm text-slate-500">No code example yet.</p>
									<button onclick={() => editingNode = true} class="mt-1 text-sm text-orange-400 hover:text-orange-300">Add one →</button>
								</div>
							{/if}
						{:else}
							<!-- Directory: show children list -->
							{@const children = data.nodes.filter((n) => n.parentId === selectedNode.id)}
							{#if children.length > 0}
								<div>
									<h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Contents</h3>
									<div class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 dark:divide-[#252525] dark:border-[#252525]">
										{#each children.sort((a, b) => (a.type === b.type ? 0 : a.type === 'directory' ? -1 : 1)) as child}
											<button
												onclick={() => { selectedNodeId = child.id; editingNode = false; }}
												class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-orange-50 dark:hover:bg-[#1e1e1e] first:rounded-t-xl last:rounded-b-xl"
											>
												<span>{fileIcon(child.name, child.type)}</span>
												<span class="text-sm font-medium text-slate-900 dark:text-white">{child.name}</span>
												<span class="ml-auto text-xs text-slate-500">{child.type}</span>
											</button>
										{/each}
									</div>
								</div>
							{/if}
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Delete confirmation form (hidden, triggered programmatically) -->
{#if confirmDelete}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-[#252525] dark:bg-[#181818]">
			<h3 class="mb-2 font-semibold text-slate-900 dark:text-white">Delete this item?</h3>
			<p class="mb-5 text-sm text-slate-500">If it's a directory, all files inside will also be deleted.</p>
			<div class="flex gap-3">
				<form method="post" action="?/deleteNode"
					use:enhance={() => async ({ update }) => {
						confirmDelete = null;
						if (selectedNodeId === confirmDelete) selectedNodeId = null;
						await update({ reset: false });
					}}
				>
					<input type="hidden" name="nodeId" value={confirmDelete} />
					<button type="submit" class="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
				</form>
				<button onclick={() => confirmDelete = null} class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-slate-600 dark:border-[#2d2d2d] dark:text-slate-400">Cancel</button>
			</div>
		</div>
	</div>
{/if}
