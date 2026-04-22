<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const difficultyLabels: Record<string, string> = {
		beginner: '🟢 Beginner',
		intermediate: '🟡 Intermediate',
		advanced: '🔴 Advanced'
	};

	const statusColors: Record<string, string> = {
		learning: 'text-amber-400 bg-amber-400/10',
		reviewing: 'text-blue-400 bg-blue-400/10',
		mastered: 'text-emerald-400 bg-emerald-400/10'
	};

	let queue = $state([...data.due]);
	let current = $derived(queue[0] ?? null);
	let revealed = $state(false);
	let done = $state(false);
	let reviewed = $state(0);

	function nextCard() {
		queue = queue.slice(1);
		revealed = false;
		reviewed += 1;
		if (queue.length === 0) done = true;
	}

	function formatNextReview(days: number): string {
		if (days === 1) return 'tomorrow';
		if (days < 7) return `in ${days} days`;
		if (days < 14) return 'in 1 week';
		if (days < 30) return `in ${Math.round(days / 7)} weeks`;
		return 'in 1 month+';
	}
</script>

<div class="mx-auto max-w-2xl px-8 py-10">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Review</h1>
			<p class="mt-1 text-slate-500 dark:text-slate-400">
				{#if done}
					Session complete!
				{:else}
					{queue.length} note{queue.length === 1 ? '' : 's'} due for review
				{/if}
			</p>
		</div>
		<div class="flex items-center gap-3">
			{#if reviewed > 0}
				<span class="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-400">
					✓ {reviewed} reviewed
				</span>
			{/if}
			<a href="/review/history" class="text-sm text-slate-400 transition-colors hover:text-orange-400">
				History →
			</a>
		</div>
	</div>

	<!-- Done state -->
	{#if done}
		<div class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-8 py-20 text-center dark:border-[#2d2d2d] dark:bg-[#181818]">
			<div class="mb-4 text-6xl">🎉</div>
			<h2 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">All caught up!</h2>
			<p class="mb-6 text-slate-500">You reviewed {reviewed} note{reviewed === 1 ? '' : 's'}. Come back tomorrow for more.</p>
			<a
				href="/dashboard"
				class="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
			>
				Back to Dashboard
			</a>
		</div>

	<!-- Empty queue -->
	{:else if queue.length === 0 && reviewed === 0}
		<div class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-8 py-20 text-center dark:border-[#2d2d2d] dark:bg-[#181818]">
			<div class="mb-4 text-6xl">✅</div>
			<h2 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Nothing due today</h2>
			<p class="mb-6 text-slate-500">All your notes are up to date. Add more notes or check back later.</p>
			<a
				href="/categories"
				class="inline-block rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-slate-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:text-slate-300 dark:hover:border-[#333333] dark:hover:text-orange-400"
			>
				Browse Categories
			</a>
		</div>

	<!-- Flashcard -->
	{:else if current}
		<!-- Progress bar -->
		<div class="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-[#252525]">
			<div
				class="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
				style="width: {(reviewed / (reviewed + queue.length)) * 100}%"
			></div>
		</div>

		<div class="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm dark:border-[#252525] dark:bg-[#181818]">
			<!-- Card front -->
			<div class="px-8 py-8">
				<!-- Meta -->
				<div class="mb-5 flex items-center gap-3">
					<span class="text-2xl">{current.categoryIcon ?? '📁'}</span>
					<span class="text-sm text-slate-500">{current.categoryName ?? 'Uncategorized'}</span>
					<span class="ml-auto text-sm text-slate-500">{difficultyLabels[current.difficulty]}</span>
					<span class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {statusColors[current.status]}">
						{current.status}
					</span>
				</div>

				<!-- Title -->
				<h2 class="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{current.title}</h2>

				{#if !revealed}
					<p class="mt-6 text-sm text-slate-500">Think about this note, then reveal to check yourself.</p>
				{/if}
			</div>

			<!-- Reveal toggle -->
			{#if !revealed}
				<div class="border-t border-gray-200 px-8 py-5 dark:border-[#252525]">
					<button
						onclick={() => (revealed = true)}
						class="w-full rounded-xl border-2 border-dashed border-orange-300 py-3 text-sm font-medium text-orange-500 transition-colors hover:border-orange-400 hover:bg-orange-50 dark:border-orange-500/30 dark:text-orange-400 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/5"
					>
						Show content ↓
					</button>
				</div>

			{:else}
				<!-- Content -->
				<div class="border-t border-gray-200 px-8 py-6 dark:border-[#252525]">
					{#if current.excerpt}
						<p class="text-slate-700 dark:text-slate-300">{current.excerpt}</p>
					{:else}
						<p class="text-sm italic text-slate-500">No excerpt — open the note for full content.</p>
					{/if}
					<a
						href="/notes/{current.id}"
						target="_blank"
						class="mt-4 inline-block text-sm text-orange-400 transition-colors hover:text-orange-300"
					>
						Open full note ↗
					</a>
				</div>

				<!-- Rating buttons -->
				<div class="flex gap-3 border-t border-gray-200 px-8 py-5 dark:border-[#252525]">
					<form
						method="post"
						action="?/markReviewed"
						use:enhance={() => async ({ update }) => { await update({ reset: false }); nextCard(); }}
						class="flex-1"
					>
						<input type="hidden" name="noteId" value={current.id} />
						<input type="hidden" name="result" value="needs_work" />
						<button
							type="submit"
							class="w-full rounded-xl border border-gray-300 bg-white py-3 text-sm font-medium text-slate-600 transition-colors hover:border-red-400 hover:text-red-500 dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-slate-300 dark:hover:border-red-500/50 dark:hover:text-red-400"
						>
							↩ Needs more practice
						</button>
					</form>
					<form
						method="post"
						action="?/markReviewed"
						use:enhance={() => async ({ update }) => { await update({ reset: false }); nextCard(); }}
						class="flex-1"
					>
						<input type="hidden" name="noteId" value={current.id} />
						<input type="hidden" name="result" value="got_it" />
						<button
							type="submit"
							class="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
						>
							Got it ✓ <span class="ml-1 text-xs font-normal opacity-80">next {formatNextReview(Math.min(current.reviewInterval * 2, 60))}</span>
						</button>
					</form>
				</div>
			{/if}
		</div>

		<!-- Queue preview -->
		{#if queue.length > 1}
			<p class="mt-4 text-center text-xs text-slate-500">
				{queue.length - 1} more after this
			</p>
		{/if}
	{/if}
</div>
