<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const langColors: Record<string, string> = {
		javascript: 'text-yellow-400 bg-yellow-400/10',
		typescript: 'text-blue-400 bg-blue-400/10',
		python: 'text-emerald-400 bg-emerald-400/10',
		rust: 'text-orange-400 bg-orange-400/10',
		go: 'text-cyan-400 bg-cyan-400/10',
		sql: 'text-violet-400 bg-violet-400/10',
		bash: 'text-slate-300 bg-[#282828]/60',
		shell: 'text-slate-300 bg-[#282828]/60',
		html: 'text-red-400 bg-red-400/10',
		css: 'text-pink-400 bg-pink-400/10',
		json: 'text-amber-400 bg-amber-400/10',
		yaml: 'text-teal-400 bg-teal-400/10'
	};

	function langColor(lang: string) {
		return langColors[lang] ?? 'text-slate-400 bg-[#282828]/60';
	}

	let filterLang = $state('all');

	const languages = $derived([
		'all',
		...new Set(data.snippets.map((s) => s.language).filter(Boolean))
	]);

	const filtered = $derived(
		filterLang === 'all' ? data.snippets : data.snippets.filter((s) => s.language === filterLang)
	);

	function previewCode(code: string) {
		return code.split('\n').slice(0, 5).join('\n');
	}

	async function copyCode(code: string) {
		await navigator.clipboard.writeText(code);
	}
</script>

<div class="mx-auto max-w-5xl px-8 py-10">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Snippets</h1>
			<p class="mt-1 text-slate-500 dark:text-slate-400">Your saved code snippets, ready to reuse.</p>
		</div>
		<a
			href="/snippets/new"
			class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
		>
			+ New Snippet
		</a>
	</div>

	<!-- Language filter -->
	{#if languages.length > 1}
		<div class="mb-6 flex flex-wrap gap-2">
			{#each languages as lang}
				<button
					onclick={() => (filterLang = lang)}
					class="rounded-full px-3 py-1 text-sm font-medium transition-colors capitalize {filterLang === lang
						? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
						: 'bg-[#1e1e1e] text-slate-400 hover:bg-[#282828] hover:text-white'}"
				>
					{lang}
				</button>
			{/each}
		</div>
	{/if}

	{#if data.snippets.length === 0}
		<div
			class="rounded-2xl border border-dashed border-gray-400 dark:border-[#2d2d2d] bg-gray-50 dark:bg-[#181818] px-8 py-20 text-center"
		>
			<div class="mb-4 text-6xl">💾</div>
			<h3 class="mb-2 text-xl font-semibold text-slate-900 dark:text-white">No snippets yet</h3>
			<p class="mb-8 text-slate-500">Save your first reusable code snippet.</p>
			<a
				href="/snippets/new"
				class="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600"
			>
				Create first snippet
			</a>
		</div>
	{:else if filtered.length === 0}
		<p class="py-16 text-center text-slate-500">No snippets for this language.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{#each filtered as snippet}
				<div
					class="group flex flex-col overflow-hidden rounded-xl border border-gray-400 dark:border-[#252525] bg-white dark:bg-[#181818] transition-colors hover:border-gray-500 dark:hover:border-[#2d2d2d]"
				>
					<!-- Card header -->
					<div class="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex items-center gap-2">
								<span
									class="rounded-full px-2 py-0.5 font-mono text-xs font-medium capitalize {langColor(snippet.language)}"
								>
									{snippet.language}
								</span>
								{#if snippet.categoryName}
									<a
										href="/categories/{snippet.categorySlug}"
										class="text-xs text-slate-600 hover:text-slate-400 transition-colors"
									>
										{snippet.categoryName}
									</a>
								{/if}
							</div>
							<a
								href="/snippets/{snippet.id}"
								class="font-semibold text-slate-900 dark:text-white transition-colors group-hover:text-orange-500 dark:group-hover:text-orange-400"
							>
								{snippet.title}
							</a>
							{#if snippet.description}
								<p class="mt-1 text-sm text-slate-500 line-clamp-1">{snippet.description}</p>
							{/if}
						</div>
						<button
							onclick={() => copyCode(snippet.code)}
							title="Copy code"
							class="shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-[#282828] hover:text-slate-300"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						</button>
					</div>

					<!-- Code preview -->
					<a href="/snippets/{snippet.id}" class="mx-4 mb-4">
						<pre
							class="overflow-hidden rounded-lg border border-[#2d2d2d] bg-[#0d0d0d] px-4 py-3 font-mono text-xs text-slate-400"
						>{previewCode(snippet.code)}{snippet.code.split('\n').length > 5
								? '\n…'
								: ''}</pre>
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>
