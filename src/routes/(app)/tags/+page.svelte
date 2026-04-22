<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-3xl px-8 py-10">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Tags</h1>
		<p class="mt-1 text-slate-500 dark:text-slate-400">Browse notes by tag. Create tags from within any note.</p>
	</div>

	{#if data.tags.length === 0}
		<div class="rounded-2xl border border-dashed border-gray-400 bg-gray-50 px-8 py-20 text-center dark:border-[#2d2d2d] dark:bg-[#181818]">
			<div class="mb-3 text-5xl">🏷️</div>
			<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-white">No tags yet</h3>
			<p class="text-slate-500">Open any note and type in the Tags field to create your first tag.</p>
		</div>
	{:else}
		<div class="flex flex-wrap gap-3">
			{#each data.tags as tag}
				<div class="group flex items-center gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#252525] dark:bg-[#181818]">
					<a
						href="/tags/{tag.id}"
						class="flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-[#1e1e1e]"
					>
						<span class="h-3 w-3 rounded-full shrink-0" style="background-color: {tag.color ?? '#f97316'}"></span>
						<span class="font-medium text-slate-900 dark:text-white">{tag.name}</span>
						<span class="text-sm text-slate-500">{tag.count}</span>
					</a>
					<form method="post" action="?/deleteTag" use:enhance class="pr-3">
						<input type="hidden" name="tagId" value={tag.id} />
						<button
							type="submit"
							title="Delete tag"
							onclick={(e) => { if (!confirm(`Delete tag "${tag.name}"?`)) e.preventDefault(); }}
							class="rounded p-1 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
						>✕</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>
