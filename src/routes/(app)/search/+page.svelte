<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let query = $state(data.q);

	const statusColors: Record<string, string> = {
		learning: 'text-amber-400 bg-amber-400/10',
		reviewing: 'text-blue-400 bg-blue-400/10',
		mastered: 'text-emerald-400 bg-emerald-400/10'
	};

	const difficultyLabels: Record<string, string> = {
		beginner: '🟢',
		intermediate: '🟡',
		advanced: '🔴'
	};

	const langColors: Record<string, string> = {
		javascript: 'text-yellow-400 bg-yellow-400/10',
		typescript: 'text-blue-400 bg-blue-400/10',
		python: 'text-emerald-400 bg-emerald-400/10',
		rust: 'text-orange-400 bg-orange-400/10',
		go: 'text-cyan-400 bg-cyan-400/10',
		sql: 'text-violet-400 bg-violet-400/10',
		bash: 'text-slate-300 bg-[#282828]/60',
		html: 'text-red-400 bg-red-400/10',
		css: 'text-pink-400 bg-pink-400/10'
	};

	function langColor(lang: string) {
		return langColors[lang] ?? 'text-slate-400 bg-[#282828]/60';
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		const q = query.trim();
		if (q) goto(`/search?q=${encodeURIComponent(q)}`);
	}

	const totalResults = $derived(data.notes.length + data.snippets.length);
</script>

<div class="mx-auto max-w-3xl px-8 py-10">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="mb-5 text-3xl font-bold text-slate-900 dark:text-white">Search</h1>
		<form onsubmit={handleSearch} class="relative">
			<span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
			<input
				type="text"
				bind:value={query}
				placeholder="Search notes, snippets…"
				autofocus
				class="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#181818] dark:text-white dark:placeholder-slate-500 dark:focus:border-orange-500"
			/>
		</form>
	</div>

	<!-- No query state -->
	{#if !data.q}
		<div class="py-16 text-center">
			<div class="mb-3 text-5xl">🔍</div>
			<p class="text-slate-500">Type something to search across your notes and snippets.</p>
		</div>

	<!-- No results -->
	{:else if totalResults === 0}
		<div class="py-16 text-center">
			<div class="mb-3 text-5xl">😶</div>
			<h3 class="mb-1 text-lg font-semibold text-slate-900 dark:text-white">No results for "{data.q}"</h3>
			<p class="text-slate-500">Try a different keyword or check your spelling.</p>
		</div>

	{:else}
		<p class="mb-6 text-sm text-slate-500">
			{totalResults} result{totalResults === 1 ? '' : 's'} for "<span class="font-medium text-slate-700 dark:text-slate-300">{data.q}</span>"
		</p>

		<!-- Notes results -->
		{#if data.notes.length > 0}
			<section class="mb-8">
				<h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
					Notes <span class="ml-1 text-slate-600">({data.notes.length})</span>
				</h2>
				<div class="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-300 bg-white dark:divide-[#252525] dark:border-[#252525] dark:bg-[#181818]">
					{#each data.notes as note}
						<a
							href="/notes/{note.id}"
							class="group flex items-center gap-4 px-5 py-4 transition-all hover:bg-orange-50 hover:ring-1 hover:ring-inset hover:ring-orange-400/50 first:rounded-t-xl last:rounded-b-xl dark:hover:bg-[#1e1e1e] dark:hover:ring-orange-500/40"
						>
							<span class="shrink-0 text-xl">{note.categoryIcon ?? '📄'}</span>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium text-slate-900 transition-colors group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-500">
									{note.title}
								</p>
								{#if note.excerpt}
									<p class="mt-0.5 truncate text-sm text-slate-500">{note.excerpt}</p>
								{:else if note.categoryName}
									<p class="mt-0.5 text-sm text-slate-500">{note.categoryName}</p>
								{/if}
							</div>
							<div class="flex shrink-0 items-center gap-2">
								<span title={note.difficulty} class="text-sm">{difficultyLabels[note.difficulty]}</span>
								<span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {statusColors[note.status]}">
									{note.status}
								</span>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Snippets results -->
		{#if data.snippets.length > 0}
			<section>
				<h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
					Snippets <span class="ml-1 text-slate-600">({data.snippets.length})</span>
				</h2>
				<div class="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-300 bg-white dark:divide-[#252525] dark:border-[#252525] dark:bg-[#181818]">
					{#each data.snippets as snippet}
						<a
							href="/snippets/{snippet.id}"
							class="group flex items-center gap-4 px-5 py-4 transition-all hover:bg-orange-50 hover:ring-1 hover:ring-inset hover:ring-orange-400/50 first:rounded-t-xl last:rounded-b-xl dark:hover:bg-[#1e1e1e] dark:hover:ring-orange-500/40"
						>
							<span class="shrink-0 text-xl">💾</span>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium text-slate-900 transition-colors group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-500">
									{snippet.title}
								</p>
								{#if snippet.description}
									<p class="mt-0.5 truncate text-sm text-slate-500">{snippet.description}</p>
								{/if}
							</div>
							<span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {langColor(snippet.language)}">
								{snippet.language}
							</span>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>
