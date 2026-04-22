<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const maxChartCount = $derived(Math.max(...data.chart.map((d) => d.count), 1));

	const statusColors: Record<string, string> = {
		learning: 'text-amber-400 bg-amber-400/10',
		reviewing: 'text-blue-400 bg-blue-400/10',
		mastered: 'text-emerald-400 bg-emerald-400/10'
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

<div class="mx-auto max-w-5xl px-8 py-10">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
			<p class="mt-1 text-slate-500 dark:text-slate-400">Your coding brain is growing.</p>
		</div>
		<a
			href="/categories/new"
			class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
		>
			+ New Category
		</a>
	</div>

	<!-- Streak + Chart row -->
	<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
		<!-- Streak -->
		<div class="flex items-center gap-4 rounded-xl border border-gray-300 bg-white px-6 py-5 dark:border-[#252525] dark:bg-[#181818]">
			<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-2xl shadow-sm">
				🔥
			</div>
			<div>
				<p class="text-3xl font-bold text-slate-900 dark:text-white">{data.streak}<span class="ml-1 text-lg font-normal text-slate-500"> day{data.streak === 1 ? '' : 's'}</span></p>
				<p class="text-sm text-slate-500">Review streak</p>
			</div>
		</div>

		<!-- 7-day activity chart -->
		<div class="rounded-xl border border-gray-300 bg-white px-6 py-5 dark:border-[#252525] dark:bg-[#181818]">
			<p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Last 7 days</p>
			<div class="flex h-16 items-end gap-1.5">
				{#each data.chart as day}
					<div class="flex flex-1 flex-col items-center gap-1">
						<div
							class="w-full rounded-t-sm transition-all {day.count > 0 ? 'bg-gradient-to-t from-orange-500 to-red-400' : 'bg-gray-100 dark:bg-[#252525]'}"
							style="height: {Math.max((day.count / maxChartCount) * 100, day.count > 0 ? 15 : 8)}%"
							title="{day.count} reviewed"
						></div>
						<span class="text-[10px] text-slate-400">{day.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Stats row -->
	<div class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
		<div class="rounded-xl border border-gray-300 bg-white px-5 py-4 dark:border-[#252525] dark:bg-[#181818]">
			<p class="text-2xl font-bold text-slate-900 dark:text-white">{data.stats.total}</p>
			<p class="mt-0.5 text-xs text-slate-500">Total notes</p>
		</div>
		<div class="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-400/20 dark:bg-amber-400/5">
			<p class="text-2xl font-bold text-amber-500">{data.stats.learning}</p>
			<p class="mt-0.5 text-xs text-amber-600 dark:text-amber-400/70">Learning</p>
		</div>
		<div class="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-400/20 dark:bg-blue-400/5">
			<p class="text-2xl font-bold text-blue-500">{data.stats.reviewing}</p>
			<p class="mt-0.5 text-xs text-blue-600 dark:text-blue-400/70">Reviewing</p>
		</div>
		<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-400/20 dark:bg-emerald-400/5">
			<p class="text-2xl font-bold text-emerald-500">{data.stats.mastered}</p>
			<p class="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400/70">Mastered</p>
		</div>
	</div>

	<!-- Review prompt -->
	{#if data.dueCount > 0}
		<a
			href="/review"
			class="mb-8 flex items-center justify-between rounded-xl border border-orange-300 bg-orange-50 px-5 py-4 transition-colors hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/5 dark:hover:bg-orange-500/10"
		>
			<div class="flex items-center gap-3">
				<span class="text-2xl">🧠</span>
				<div>
					<p class="font-semibold text-orange-700 dark:text-orange-400">
						{data.dueCount} note{data.dueCount === 1 ? '' : 's'} due for review
					</p>
					<p class="text-sm text-orange-600/70 dark:text-orange-400/60">Keep your streak going</p>
				</div>
			</div>
			<span class="text-sm font-medium text-orange-500 dark:text-orange-400">Start session →</span>
		</a>
	{/if}

	<!-- Categories -->
	<section class="mb-10">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-lg font-semibold text-slate-900 dark:text-white">Categories</h2>
			<a href="/categories" class="text-sm text-orange-400 transition-colors hover:text-orange-300">
				View all →
			</a>
		</div>

		{#if data.categories.length === 0}
			<div
				class="rounded-2xl border border-dashed border-gray-400 bg-gray-50 px-8 py-14 text-center dark:border-[#2d2d2d] dark:bg-[#181818]"
			>
				<div class="mb-3 text-5xl">📂</div>
				<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-white">No categories yet</h3>
				<p class="mb-6 text-slate-500">
					Create your first category to start organizing your notes.
				</p>
				<a
					href="/categories/new"
					class="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
				>
					Create first category
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{#each data.categories as cat}
					<a
						href="/categories/{cat.slug}"
						class="group rounded-xl border border-gray-400 bg-white p-5 transition-all hover:border-gray-500 hover:bg-gray-50 dark:border-[#252525] dark:bg-[#181818] dark:hover:border-[#2d2d2d] dark:hover:bg-[#1e1e1e]"
					>
						<div class="mb-3 text-3xl">{cat.icon}</div>
						<div
							class="font-semibold text-slate-900 transition-colors group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-400"
						>
							{cat.name}
						</div>
						<div class="mt-1 text-sm text-slate-500">
							{cat.noteCount}
							{cat.noteCount === 1 ? 'note' : 'notes'}
						</div>
					</a>
				{/each}

				<a
					href="/categories/new"
					class="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2d2d2d] bg-transparent p-5 text-slate-600 transition-colors hover:border-[#444444] hover:text-slate-400"
				>
					<span class="mb-2 text-3xl">+</span>
					<span class="text-sm font-medium">New category</span>
				</a>
			</div>
		{/if}
	</section>

	<!-- Recent Notes -->
	<section class="mb-10">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-lg font-semibold text-slate-900 dark:text-white">Recently Updated</h2>
		</div>

		{#if data.recentNotes.length === 0}
			<div class="rounded-xl border border-[#252525] bg-[#181818] px-6 py-10 text-center">
				<div class="mb-2 text-4xl">📝</div>
				<p class="text-slate-500">No notes yet. Create a category first to add notes.</p>
			</div>
		{:else}
			<div
				class="divide-y divide-gray-400 rounded-xl border border-gray-400 bg-white dark:divide-[#252525] dark:border-[#252525] dark:bg-[#181818]"
			>
				{#each data.recentNotes as note}
					<a
						href="/notes/{note.id}"
						class="group flex items-center justify-between px-5 py-4 transition-all first:rounded-t-xl last:rounded-b-xl hover:bg-orange-50 hover:ring-1 hover:ring-inset hover:ring-orange-400/50 dark:hover:bg-[#1e1e1e] dark:hover:ring-orange-500/40"
					>
						<div class="flex items-center gap-3">
							<span class="text-slate-500">📄</span>
							<span
								class="font-medium text-slate-900 transition-colors group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-500"
								>{note.title}</span
							>
						</div>
						<div class="flex items-center gap-3">
							<span
								class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {statusColors[
									note.status
								]}"
							>
								{note.status}
							</span>
							<span class="text-xs text-slate-600">{timeAgo(note.updatedAt)}</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Quick Actions -->
	<section>
		<h2 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
		<div class="flex flex-wrap gap-3">
			<a
				href="/categories/new"
				class="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-slate-300 dark:hover:border-[#333333] dark:hover:text-orange-400"
			>
				+ New Category
			</a>
			<a
				href="/snippets/new"
				class="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-slate-300 dark:hover:border-[#333333] dark:hover:text-orange-400"
			>
				+ New Snippet
			</a>
			<a
				href="/snippets"
				class="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-slate-300 dark:hover:border-[#333333] dark:hover:text-orange-400"
			>
				Browse Snippets
			</a>
		</div>
	</section>
</div>
