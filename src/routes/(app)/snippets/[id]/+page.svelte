<script lang="ts">
	import { enhance } from '$app/forms';
	import HighlightedCode from '$lib/components/ui/HighlightedCode.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const languages = [
		'plaintext', 'javascript', 'typescript', 'python', 'rust', 'go',
		'sql', 'bash', 'shell', 'html', 'css', 'json', 'yaml', 'java',
		'csharp', 'cpp', 'ruby', 'php', 'swift', 'kotlin', 'markdown'
	];

	let editing = $state(false);
	let saving = $state(false);
	let copied = $state(false);

	async function copyCode() {
		await navigator.clipboard.writeText(data.snippet.code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

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
		json: 'text-amber-400 bg-amber-400/10'
	};

	function langColor(lang: string) {
		return langColors[lang] ?? 'text-slate-400 bg-[#282828]/60';
	}
</script>

<div class="mx-auto max-w-4xl px-8 py-10">
	<!-- Breadcrumb -->
	<div class="mb-6 flex items-center gap-2 text-sm text-slate-500">
		<a href="/snippets" class="hover:text-slate-300 transition-colors">Snippets</a>
		<span>›</span>
		<span class="text-slate-300">{data.snippet.title}</span>
	</div>

	{#if !editing}
		<!-- View mode -->
		<div class="mb-6 flex items-start justify-between gap-4">
			<div>
				<div class="mb-2 flex items-center gap-2">
					<span
						class="rounded-full px-2.5 py-0.5 font-mono text-xs font-medium capitalize {langColor(data.snippet.language)}"
					>
						{data.snippet.language}
					</span>
					{#if data.snippet.categoryName}
						<a
							href="/categories/{data.snippet.categorySlug}"
							class="text-sm text-slate-500 hover:text-slate-300 transition-colors"
						>
							{data.snippet.categoryName}
						</a>
					{/if}
				</div>
				<h1 class="text-3xl font-bold text-slate-900 dark:text-white">{data.snippet.title}</h1>
				{#if data.snippet.description}
					<p class="mt-2 text-slate-400">{data.snippet.description}</p>
				{/if}
			</div>

			<div class="flex shrink-0 items-center gap-2">
				<button
					onclick={copyCode}
					class="flex items-center gap-2 rounded-lg border border-[#2d2d2d] px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-[#333333] hover:text-white"
				>
					{#if copied}
						<span class="text-emerald-400">✓ Copied</span>
					{:else}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						Copy
					{/if}
				</button>
				<button
					onclick={() => (editing = true)}
					class="rounded-lg border border-[#2d2d2d] px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-[#333333] hover:text-white"
				>
					Edit
				</button>
				<form method="post" action="?/delete" use:enhance>
					<button
						type="submit"
						onclick={(e) => { if (!confirm('Delete this snippet?')) e.preventDefault(); }}
						class="rounded-lg border border-red-900/50 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:border-red-700 hover:bg-red-950/30"
					>
						Delete
					</button>
				</form>
			</div>
		</div>

		<HighlightedCode code={data.snippet.code} language={data.snippet.language} />
	{:else}
		<!-- Edit mode -->
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold text-slate-900 dark:text-white">Edit Snippet</h1>
			<button
				onclick={() => (editing = false)}
				class="text-sm text-slate-500 hover:text-slate-300 transition-colors"
			>
				← Cancel
			</button>
		</div>

		<form
			method="post"
			action="?/save"
			use:enhance={() => {
				saving = true;
				return async ({ update, result }) => {
					saving = false;
					if (result.type === 'success') editing = false;
					await update({ reset: false });
				};
			}}
			class="space-y-6"
		>
			<div>
				<label class="mb-1.5 block text-sm font-medium text-slate-300" for="title">Title</label>
				<input
					id="title"
					type="text"
					name="title"
					required
					value={data.snippet.title}
					class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-1.5 block text-sm font-medium text-slate-300" for="language">Language</label>
					<select
						id="language"
						name="language"
						class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-slate-300 capitalize focus:border-orange-500 focus:outline-none"
					>
						{#each languages as lang}
							<option value={lang} selected={lang === data.snippet.language} class="capitalize">{lang}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="mb-1.5 block text-sm font-medium text-slate-300" for="categoryId">Category</label>
					<select
						id="categoryId"
						name="categoryId"
						class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-slate-300 focus:border-orange-500 focus:outline-none"
					>
						<option value="">No category</option>
						{#each data.categories as cat}
							<option value={cat.id} selected={cat.id === data.snippet.categoryId}>{cat.icon} {cat.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div>
				<label class="mb-1.5 block text-sm font-medium text-slate-300" for="description">Description</label>
				<input
					id="description"
					type="text"
					name="description"
					value={data.snippet.description ?? ''}
					class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
				/>
			</div>

			<div>
				<label class="mb-1.5 block text-sm font-medium text-slate-300" for="code">Code</label>
				<textarea
					id="code"
					name="code"
					required
					rows="14"
					class="w-full resize-y rounded-lg border border-[#2d2d2d] bg-[#0d0d0d] px-4 py-3 font-mono text-sm text-slate-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
				>{data.snippet.code}</textarea>
			</div>

			{#if form?.message}
				<div class="rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-400">
					{form.message}
				</div>
			{/if}

			<div class="flex gap-3">
				<button
					type="submit"
					disabled={saving}
					class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:opacity-60"
				>
					{saving ? 'Saving…' : 'Save changes'}
				</button>
				<button
					type="button"
					onclick={() => (editing = false)}
					class="rounded-lg border border-[#2d2d2d] px-6 py-2.5 font-medium text-slate-400 transition-colors hover:border-[#333333] hover:text-white"
				>
					Cancel
				</button>
			</div>
		</form>
	{/if}
</div>
