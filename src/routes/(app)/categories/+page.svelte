<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-5xl px-8 py-10">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-4xl font-bold text-slate-900 dark:text-orange-400">Categories</h1>
			<p class="mt-1 text-slate-500 italic dark:text-slate-400">
				Your programming knowledge organized by topic.
			</p>
		</div>
		<a
			href="/categories/new"
			class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
		>
			+ New Category
		</a>
	</div>

	{#if data.categories.length === 0}
		<div
			class="rounded-2xl border border-dashed border-gray-400 bg-gray-50 px-8 py-20 text-center dark:border-[#2d2d2d] dark:bg-[#181818]"
		>
			<div class="mb-4 text-6xl">📂</div>
			<h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">No categories yet</h3>
			<p class="mb-8 text-slate-500">Create your first category to start organizing your notes.</p>
			<a
				href="/categories/new"
				class="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
			>
				Create first category
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.categories as cat}
				<a
					href="/categories/{cat.slug}"
					class="group flex flex-col rounded-xl border border-gray-400 bg-white p-6 transition-all hover:border-gray-500 hover:bg-gray-50 dark:border-[#252525] dark:bg-[#181818] dark:hover:border-[#2d2d2d] dark:hover:bg-[#1e1e1e]"
				>
					<div class="mb-4 flex items-center gap-3">
						<span class="text-4xl">{cat.icon}</span>
						<div
							class="h-1 flex-1 rounded-full opacity-40"
							style="background-color: {cat.color}"
						></div>
					</div>
					<h2
						class="mb-1 text-lg font-semibold text-slate-900 transition-colors group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-400"
					>
						{cat.name}
					</h2>
					{#if cat.description}
						<p class="mb-3 line-clamp-2 flex-1 text-sm text-slate-500">{cat.description}</p>
					{:else}
						<div class="flex-1"></div>
					{/if}
					<div class="mt-2 text-sm text-slate-500">
						{cat.noteCount}
						{cat.noteCount === 1 ? 'note' : 'notes'}
					</div>
				</a>
			{/each}

			<a
				href="/categories/new"
				class="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2d2d2d] bg-transparent p-6 text-slate-600 transition-colors hover:border-[#444444] hover:text-slate-400"
			>
				<span class="mb-2 text-4xl">+</span>
				<span class="font-medium">New category</span>
			</a>
		</div>
	{/if}
</div>
