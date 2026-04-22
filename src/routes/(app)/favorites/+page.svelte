<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

	function timeAgo(date: Date | string) {
		const d = new Date(date);
		const diff = Math.floor((Date.now() - d.getTime()) / 1000);
		if (diff < 60) return 'just now';
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
		return `${Math.floor(diff / 86400)}d ago`;
	}
</script>

<div class="mx-auto max-w-4xl px-8 py-10">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Favorites</h1>
		<p class="mt-1 text-slate-500 dark:text-slate-400">Notes you've starred for quick access.</p>
	</div>

	{#if data.notes.length === 0}
		<div
			class="rounded-2xl border border-dashed border-gray-400 bg-gray-50 px-8 py-20 text-center dark:border-[#2d2d2d] dark:bg-[#181818]"
		>
			<div class="mb-4 text-6xl">★</div>
			<h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">No favorites yet</h3>
			<p class="mb-6 text-slate-500">Open any note and click the star to add it here.</p>
			<a
				href="/categories"
				class="inline-block rounded-lg border border-[#2d2d2d] px-5 py-2.5 font-medium text-slate-600 transition-colors hover:border-orange-500 hover:text-orange-500"
			>
				Browse categories
			</a>
		</div>
	{:else}
		<div
			class="divide-y divide-gray-400 overflow-hidden rounded-xl border border-gray-400 bg-white dark:divide-[#252525] dark:border-[#252525] dark:bg-transparent"
		>
			{#each data.notes as note}
				<a
					href="/notes/{note.id}"
					class="group flex items-center gap-4 px-5 py-4 transition-all hover:bg-orange-50 hover:ring-1 hover:ring-inset hover:ring-orange-400/50 dark:hover:bg-[#1e1e1e] dark:hover:ring-orange-500/40"
				>
					<!-- Category icon -->
					<span class="shrink-0 text-2xl">{note.categoryIcon ?? '📁'}</span>

					<!-- Info -->
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span
								class="truncate font-semibold text-slate-900 transition-colors group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-500"
								>{note.title}</span
							>
							<span class="shrink-0 text-amber-400">★</span>
						</div>
						{#if note.categoryName}
							<p class="mt-0.5 text-sm text-slate-500">{note.categoryName}</p>
						{/if}
					</div>

					<!-- Meta -->
					<div class="flex shrink-0 items-center gap-3">
						<span title={note.difficulty} class="text-sm">{difficultyLabels[note.difficulty]}</span>
						<span
							class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {statusColors[
								note.status
							]}"
						>
							{note.status}
						</span>
						<span class="w-16 text-right text-xs text-slate-600">{timeAgo(note.updatedAt)}</span>
					</div>
				</a>
			{/each}
		</div>

		<p class="mt-4 text-right text-sm text-slate-600">
			{data.notes.length} favorite{data.notes.length === 1 ? '' : 's'}
		</p>
	{/if}
</div>
