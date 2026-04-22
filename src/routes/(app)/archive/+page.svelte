<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function timeAgo(date: Date | string) {
		const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
		if (diff < 60) return 'just now';
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
		return `${Math.floor(diff / 86400)}d ago`;
	}

	const statusColors: Record<string, string> = {
		learning: 'text-amber-400 bg-amber-400/10',
		reviewing: 'text-blue-400 bg-blue-400/10',
		mastered: 'text-emerald-400 bg-emerald-400/10'
	};
</script>

<div class="mx-auto max-w-3xl px-8 py-10">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Archive</h1>
		<p class="mt-1 text-slate-500 dark:text-slate-400">Notes you've archived. Restore or permanently delete them.</p>
	</div>

	{#if data.notes.length === 0}
		<div class="rounded-2xl border border-dashed border-gray-400 bg-gray-50 px-8 py-20 text-center dark:border-[#2d2d2d] dark:bg-[#181818]">
			<div class="mb-3 text-5xl">🗃️</div>
			<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Archive is empty</h3>
			<p class="text-slate-500">Archive notes from within the note editor to move them here.</p>
		</div>
	{:else}
		<div class="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-300 bg-white dark:divide-[#252525] dark:border-[#252525] dark:bg-[#181818]">
			{#each data.notes as note}
				<div class="flex items-center gap-4 px-5 py-4 first:rounded-t-xl last:rounded-b-xl">
					<span class="shrink-0 text-xl opacity-50">{note.categoryIcon ?? '📄'}</span>
					<div class="min-w-0 flex-1">
						<p class="truncate font-medium text-slate-500 dark:text-slate-400">{note.title}</p>
						{#if note.categoryName}
							<p class="text-xs text-slate-400">{note.categoryName} · archived {timeAgo(note.updatedAt)}</p>
						{/if}
					</div>
					<span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize opacity-60 {statusColors[note.status]}">{note.status}</span>
					<div class="flex shrink-0 items-center gap-2">
						<form method="post" action="?/restore" use:enhance>
							<input type="hidden" name="noteId" value={note.id} />
							<button type="submit" class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:text-slate-400 dark:hover:text-orange-400">
								Restore
							</button>
						</form>
						<form method="post" action="?/deletePermanently" use:enhance>
							<input type="hidden" name="noteId" value={note.id} />
							<button
								type="submit"
								onclick={(e) => { if (!confirm('Permanently delete this note? This cannot be undone.')) e.preventDefault(); }}
								class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-red-400"
							>Delete</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
		<p class="mt-3 text-right text-sm text-slate-500">{data.notes.length} archived {data.notes.length === 1 ? 'note' : 'notes'}</p>
	{/if}
</div>
