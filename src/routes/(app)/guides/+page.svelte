<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-5xl px-8 py-10">
	<div class="mb-10 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Build Guides</h1>
			<p class="mt-1 text-slate-500 dark:text-slate-400">Step-by-step project structures with explanations.</p>
		</div>
		<a
			href="/guides/new"
			class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
		>
			+ New Guide
		</a>
	</div>

	{#if data.guides.length === 0}
		<div class="rounded-2xl border border-dashed border-gray-400 bg-gray-50 px-8 py-20 text-center dark:border-[#2d2d2d] dark:bg-[#181818]">
			<div class="mb-4 text-6xl">🗺️</div>
			<h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">No guides yet</h3>
			<p class="mb-6 text-slate-500">Create your first build guide to document a project structure with explanations and code.</p>
			<a
				href="/guides/new"
				class="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
			>
				Create first guide
			</a>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.guides as guide}
				<a
					href="/guides/{guide.id}"
					class="group flex flex-col rounded-xl border border-gray-300 bg-white p-6 transition-all hover:border-orange-300 hover:shadow-sm dark:border-[#252525] dark:bg-[#181818] dark:hover:border-orange-500/40"
				>
					<div class="mb-3 flex items-center gap-2">
						<span class="text-2xl">{guide.categoryIcon ?? '🗺️'}</span>
						{#if guide.categoryName}
							<span class="text-xs text-slate-500">{guide.categoryName}</span>
						{/if}
					</div>
					<h2 class="mb-1 font-semibold text-slate-900 transition-colors group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-400">
						{guide.title}
					</h2>
					{#if guide.description}
						<p class="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">{guide.description}</p>
					{:else}
						<div class="flex-1"></div>
					{/if}
					<p class="mt-3 text-xs text-slate-500">
						{guide.nodeCount} {guide.nodeCount === 1 ? 'file' : 'files & folders'}
					</p>
				</a>
			{/each}

			<a
				href="/guides/new"
				class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-transparent p-6 text-slate-500 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:hover:border-orange-500/40 dark:hover:text-orange-400"
			>
				<span class="mb-2 text-3xl">+</span>
				<span class="text-sm font-medium">New guide</span>
			</a>
		</div>
	{/if}
</div>
