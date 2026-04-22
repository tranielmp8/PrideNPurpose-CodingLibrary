<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(d: string) {
		return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="mx-auto max-w-3xl px-8 py-10">
	<div class="mb-8 flex items-center gap-4">
		<a href="/review" class="text-sm text-slate-400 transition-colors hover:text-orange-400">← Review</a>
		<div>
			<h1 class="text-2xl font-bold text-slate-900 dark:text-white">Review History</h1>
			<p class="text-sm text-slate-500">Your past review sessions</p>
		</div>
	</div>

	{#if data.sessions.length === 0}
		<div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-[#2d2d2d] dark:bg-[#181818]">
			<div class="mb-3 text-5xl">🧠</div>
			<p class="font-semibold text-slate-900 dark:text-white">No reviews yet</p>
			<p class="mt-1 text-sm text-slate-500">Complete a review session to see your history.</p>
			<a href="/review" class="mt-4 inline-block text-sm font-medium text-orange-400 hover:text-orange-300">Start reviewing →</a>
		</div>
	{:else}
		<div class="space-y-6">
			{#each data.sessions as session}
				<div class="rounded-xl border border-gray-200 bg-white dark:border-[#252525] dark:bg-[#181818]">
					<!-- Session header -->
					<div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-[#252525]">
						<div>
							<p class="font-semibold text-slate-900 dark:text-white">{formatDate(session.date)}</p>
							<p class="text-sm text-slate-500">{session.total} notes reviewed</p>
						</div>
						<div class="flex items-center gap-3">
							<span class="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-500">
								✓ {session.gotIt} got it
							</span>
							{#if session.needsWork > 0}
								<span class="rounded-full bg-red-400/10 px-3 py-1 text-sm font-medium text-red-400">
									↺ {session.needsWork} needs work
								</span>
							{/if}
						</div>
					</div>

					<!-- Progress bar -->
					<div class="h-1.5 w-full bg-gray-100 dark:bg-[#252525]">
						<div
							class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
							style="width: {Math.round((session.gotIt / session.total) * 100)}%"
						></div>
					</div>

					<!-- Note list -->
					<div class="divide-y divide-gray-100 dark:divide-[#252525]">
						{#each session.entries as entry}
							<a
								href="/notes/{entry.noteId}"
								class="group flex items-center justify-between px-5 py-3 transition-colors hover:bg-orange-50 dark:hover:bg-[#1e1e1e]"
							>
								<span class="text-sm text-slate-700 transition-colors group-hover:text-orange-500 dark:text-slate-300 dark:group-hover:text-orange-400">
									{entry.noteTitle}
								</span>
								<span class="text-lg" title={entry.result === 'got_it' ? 'Got it' : 'Needs work'}>
									{entry.result === 'got_it' ? '✅' : '🔄'}
								</span>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
