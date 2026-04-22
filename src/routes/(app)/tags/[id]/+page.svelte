<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const statusColors: Record<string, string> = {
		learning: 'text-amber-400 bg-amber-400/10',
		reviewing: 'text-blue-400 bg-blue-400/10',
		mastered: 'text-emerald-400 bg-emerald-400/10'
	};
	const difficultyLabels: Record<string, string> = {
		beginner: '🟢', intermediate: '🟡', advanced: '🔴'
	};
	function timeAgo(date: Date | string) {
		const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
		if (diff < 60) return 'just now';
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
		return `${Math.floor(diff / 86400)}d ago`;
	}
</script>

<div class="mx-auto max-w-3xl px-8 py-10">
	<div class="mb-2 text-sm">
		<a href="/tags" class="text-slate-500 transition-colors hover:text-orange-400">← Tags</a>
	</div>

	<div class="mb-8 flex items-center gap-3">
		<span class="h-4 w-4 rounded-full" style="background-color: {data.tag.color ?? '#f97316'}"></span>
		<h1 class="text-3xl font-bold text-slate-900 dark:text-white">{data.tag.name}</h1>
		<span class="text-slate-500">{data.notes.length} {data.notes.length === 1 ? 'note' : 'notes'}</span>
	</div>

	{#if data.notes.length === 0}
		<div class="rounded-2xl border border-dashed border-gray-400 bg-gray-50 px-8 py-16 text-center dark:border-[#2d2d2d] dark:bg-[#181818]">
			<p class="text-slate-500">No notes with this tag yet.</p>
		</div>
	{:else}
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
						{#if note.categoryName}
							<p class="mt-0.5 text-sm text-slate-500">{note.categoryName}</p>
						{/if}
					</div>
					<div class="flex shrink-0 items-center gap-2">
						<span title={note.difficulty}>{difficultyLabels[note.difficulty]}</span>
						<span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {statusColors[note.status]}">{note.status}</span>
						<span class="w-14 text-right text-xs text-slate-500">{timeAgo(note.updatedAt)}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
