<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte';

	let { data }: { data: PageData } = $props();

	let title = $state(data.note.title);
	let saveStatus = $state<'saved' | 'saving' | 'unsaved'>('saved');
	let status = $state(data.note.status);
	let difficulty = $state(data.note.difficulty);
	let isFavorite = $state(data.note.isFavorite);
	let isPinned = $state(data.note.isPinned);
	let currentJson = $state(data.note.contentJson ?? '');

	function extractText(node: Record<string, unknown>): string {
		if (node.type === 'text') return (node.text as string) ?? '';
		return ((node.content as Record<string, unknown>[]) ?? []).map(extractText).join(' ');
	}
	const wordCount = $derived.by(() => {
		try {
			const doc = JSON.parse(currentJson);
			const text = extractText(doc).replace(/\s+/g, ' ').trim();
			return text ? text.split(' ').length : 0;
		} catch { return 0; }
	});
	const charCount = $derived.by(() => {
		try {
			const doc = JSON.parse(currentJson);
			return extractText(doc).replace(/\s+/g, ' ').trim().length;
		} catch { return 0; }
	});

	// Tags state — optimistic, no full-page reload needed
	let allTags = $state([...data.allTags]);
	let tagIds = $state(new Set(data.noteTagIds));
	let tagInput = $state('');
	let showTagDropdown = $state(false);

	const currentTags = $derived(allTags.filter((t) => tagIds.has(t.id)));
	const filteredTags = $derived(
		allTags.filter(
			(t) => !tagIds.has(t.id) && t.name.toLowerCase().includes(tagInput.toLowerCase())
		)
	);
	const canCreate = $derived(
		tagInput.trim().length > 0 && !allTags.some((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase())
	);

	async function addExistingTag(tagId: string) {
		tagIds.add(tagId);
		tagIds = tagIds;
		tagInput = '';
		showTagDropdown = false;
		const body = new FormData();
		body.set('tagId', tagId);
		await fetch('?/addTag', { method: 'POST', body });
	}

	async function createAndAddTag(name: string) {
		tagInput = '';
		showTagDropdown = false;
		const body = new FormData();
		body.set('newTagName', name.trim());
		const res = await fetch('?/addTag', { method: 'POST', body });
		const json = await res.json().catch(() => null);
		const tagId = json?.data?.tagId;
		const created = json?.data?.createdTag;
		if (tagId) {
			if (created) allTags = [...allTags, created];
			tagIds.add(tagId);
			tagIds = tagIds;
		}
	}

	async function removeTag(tagId: string) {
		tagIds.delete(tagId);
		tagIds = tagIds;
		const body = new FormData();
		body.set('tagId', tagId);
		await fetch('?/removeTag', { method: 'POST', body });
	}

	let saveTimer: ReturnType<typeof setTimeout>;

	function scheduleSave(content?: string) {
		if (content !== undefined) currentJson = content;
		saveStatus = 'unsaved';
		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => saveContent(content), 1500);
	}

	async function saveContent(content?: string) {
		saveStatus = 'saving';
		const body = new FormData();
		body.set('title', title);
		if (content !== undefined) body.set('content', content);
		await fetch('?/save', { method: 'POST', body });
		saveStatus = 'saved';
	}

	async function saveMeta(field: string, value: string) {
		const body = new FormData();
		body.set(field, value);
		await fetch('?/updateMeta', { method: 'POST', body });
	}

	async function toggleFavorite() {
		isFavorite = !isFavorite;
		await saveMeta('isFavorite', String(isFavorite));
	}

	async function togglePin() {
		isPinned = !isPinned;
		const body = new FormData();
		body.set('pin', String(isPinned));
		await fetch('?/togglePin', { method: 'POST', body });
	}

	function handleStatusChange(e: Event) {
		status = (e.target as HTMLSelectElement).value as typeof status;
		saveMeta('status', status);
	}

	function handleDifficultyChange(e: Event) {
		difficulty = (e.target as HTMLSelectElement).value as typeof difficulty;
		saveMeta('difficulty', difficulty);
	}

	const statusColors: Record<string, string> = {
		learning: 'text-amber-400',
		reviewing: 'text-blue-400',
		mastered: 'text-emerald-400'
	};

	function formatDate(d: Date | string) {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<div class="flex h-full">
	<!-- Editor column -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Top bar -->
		<div class="flex items-center justify-between border-b border-[#252525] bg-[#111111] px-6 py-3">
			<div class="flex items-center gap-2 text-sm text-slate-500">
				<a href="/categories" class="hover:text-slate-300 transition-colors">Categories</a>
				<span>›</span>
				<a href="/categories/{data.category?.slug}" class="hover:text-slate-300 transition-colors">
					{data.category?.name}
				</a>
				<span>›</span>
				<span class="text-slate-300">{title}</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-xs {saveStatus === 'saving' ? 'text-amber-400' : saveStatus === 'unsaved' ? 'text-slate-500' : 'text-emerald-500'}">
					{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'unsaved' ? 'Unsaved' : '✓ Saved'}
				</span>
				<a
					href="/notes/{data.note.id}/export"
					title="Download as Markdown"
					class="rounded-lg bg-[#1e1e1e] px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-[#282828] hover:text-white"
				>
					↓ .md
				</a>
				<button
					onclick={() => saveContent()}
					class="rounded-lg bg-[#1e1e1e] px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-[#282828] hover:text-white"
				>
					Save
				</button>
			</div>
		</div>

		<!-- Title -->
		<div class="border-b border-[#252525] bg-[#111111] px-8 py-5">
			<input
				type="text"
				bind:value={title}
				oninput={() => scheduleSave()}
				placeholder="Untitled"
				class="w-full bg-transparent text-3xl font-bold text-white placeholder-slate-600 focus:outline-none"
			/>
		</div>

		<!-- TipTap editor -->
		<div class="flex-1 overflow-y-auto bg-[#0d0d0d]">
			<TipTapEditor
				content={data.note.contentJson ?? ''}
				onUpdate={(json) => scheduleSave(json)}
			/>
		</div>
	</div>

	<!-- Metadata panel -->
	<aside class="flex w-56 shrink-0 flex-col border-l border-[#252525] bg-[#111111] overflow-y-auto">
		<div class="border-b border-[#252525] px-4 py-3">
			<p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Note Info</p>
		</div>

		<div class="space-y-5 p-4">
			<!-- Favorite + Pin -->
			<div class="space-y-1">
				<button
					onclick={toggleFavorite}
					class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#1e1e1e] {isFavorite ? 'text-amber-400' : 'text-slate-500'}"
				>
					<span>{isFavorite ? '★' : '☆'}</span>
					{isFavorite ? 'Favorited' : 'Add to favorites'}
				</button>
				<button
					onclick={togglePin}
					class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#1e1e1e] {isPinned ? 'text-orange-400' : 'text-slate-500'}"
				>
					<span>📌</span>
					{isPinned ? 'Pinned to top' : 'Pin to top'}
				</button>
			</div>

			<!-- Status -->
			<div>
				<label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
					Status
				</label>
				<select
					value={status}
					onchange={handleStatusChange}
					class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-3 py-2 text-sm {statusColors[status]} focus:border-orange-500 focus:outline-none"
				>
					<option value="learning">Learning</option>
					<option value="reviewing">Reviewing</option>
					<option value="mastered">Mastered</option>
				</select>
			</div>

			<!-- Difficulty -->
			<div>
				<label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
					Difficulty
				</label>
				<select
					value={difficulty}
					onchange={handleDifficultyChange}
					class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-3 py-2 text-sm text-slate-300 focus:border-orange-500 focus:outline-none"
				>
					<option value="beginner">Beginner</option>
					<option value="intermediate">Intermediate</option>
					<option value="advanced">Advanced</option>
				</select>
			</div>

			<!-- Tags -->
			<div class="border-t border-[#252525] pt-4">
				<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tags</p>

				<!-- Current tags -->
				{#if currentTags.length > 0}
					<div class="mb-2 flex flex-wrap gap-1.5">
						{#each currentTags as tag}
							<span
								class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
								style="background-color: {tag.color}22; color: {tag.color}"
							>
								{tag.name}
								<button
									onclick={() => removeTag(tag.id)}
									class="opacity-60 transition-opacity hover:opacity-100"
								>×</button>
							</span>
						{/each}
					</div>
				{/if}

				<!-- Tag input -->
				<div class="relative">
					<input
						type="text"
						bind:value={tagInput}
						onfocus={() => (showTagDropdown = true)}
						onblur={() => setTimeout(() => (showTagDropdown = false), 150)}
						onkeydown={(e) => {
							if (e.key === 'Enter' && tagInput.trim()) {
								e.preventDefault();
								canCreate ? createAndAddTag(tagInput) : filteredTags[0] && addExistingTag(filteredTags[0].id);
							}
							if (e.key === 'Escape') showTagDropdown = false;
						}}
						placeholder="Add tag…"
						class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:border-orange-500 focus:outline-none"
					/>
					{#if showTagDropdown && (filteredTags.length > 0 || canCreate)}
						<div class="absolute bottom-full left-0 z-20 mb-1 w-full overflow-hidden rounded-lg border border-[#2d2d2d] bg-[#181818] shadow-lg">
							{#each filteredTags.slice(0, 6) as tag}
								<button
									onmousedown={() => addExistingTag(tag.id)}
									class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:bg-[#252525]"
								>
									<span class="h-2 w-2 rounded-full" style="background-color: {tag.color}"></span>
									{tag.name}
								</button>
							{/each}
							{#if canCreate}
								<button
									onmousedown={() => createAndAddTag(tagInput)}
									class="flex w-full items-center gap-2 border-t border-[#252525] px-3 py-2 text-left text-xs text-orange-400 transition-colors hover:bg-[#252525]"
								>
									+ Create "{tagInput.trim()}"
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Word count -->
			<div class="border-t border-[#252525] pt-4">
				<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Stats</p>
				<div class="grid grid-cols-2 gap-2">
					<div class="rounded-lg bg-[#1a1a1a] px-3 py-2 text-center">
						<p class="text-lg font-bold text-slate-200">{wordCount}</p>
						<p class="text-[10px] text-slate-500">words</p>
					</div>
					<div class="rounded-lg bg-[#1a1a1a] px-3 py-2 text-center">
						<p class="text-lg font-bold text-slate-200">{charCount}</p>
						<p class="text-[10px] text-slate-500">chars</p>
					</div>
				</div>
			</div>

			<!-- Dates -->
			<div class="space-y-2 border-t border-[#252525] pt-4">
				<div>
					<p class="text-xs text-slate-600">Created</p>
					<p class="text-xs text-slate-400">{formatDate(data.note.createdAt)}</p>
				</div>
				<div>
					<p class="text-xs text-slate-600">Updated</p>
					<p class="text-xs text-slate-400">{formatDate(data.note.updatedAt)}</p>
				</div>
			</div>

			<!-- Category link -->
			<div class="border-t border-[#252525] pt-4">
				<p class="mb-1 text-xs text-slate-600">Category</p>
				<a
					href="/categories/{data.category?.slug}"
					class="text-xs text-orange-400 hover:text-orange-300 transition-colors"
				>
					{data.category?.name} →
				</a>
			</div>

			<!-- Backlinks -->
			{#if data.backlinks.length > 0}
				<div class="border-t border-[#252525] pt-4">
					<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Linked from</p>
					<div class="space-y-1">
						{#each data.backlinks as link}
							<a
								href="/notes/{link.id}"
								class="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-400 transition-colors hover:bg-[#1e1e1e] hover:text-orange-400"
							>
								<span class="shrink-0">🔗</span>
								<span class="truncate">{link.title}</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Archive -->
			<div class="border-t border-[#252525] pt-4">
				<button
					onclick={async () => {
						if (!confirm('Archive this note?')) return;
						await fetch('?/archiveNote', { method: 'POST', body: new FormData() });
						window.location.href = `/categories/${data.category?.slug}`;
					}}
					class="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-500 transition-colors hover:bg-[#1e1e1e] hover:text-red-400"
				>
					🗃️ Archive note
				</button>
			</div>
		</div>
	</aside>
</div>
