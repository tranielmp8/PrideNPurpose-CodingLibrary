<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const languages = [
		'plaintext', 'javascript', 'typescript', 'python', 'rust', 'go',
		'sql', 'bash', 'shell', 'html', 'css', 'json', 'yaml', 'java',
		'csharp', 'cpp', 'ruby', 'php', 'swift', 'kotlin', 'markdown'
	];

	let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl px-8 py-10">
	<div class="mb-8">
		<a href="/snippets" class="text-sm text-slate-500 hover:text-slate-300 transition-colors">
			← Back to snippets
		</a>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 dark:text-white">New Snippet</h1>
		<p class="mt-1 text-slate-500 dark:text-slate-400">Save a reusable piece of code.</p>
	</div>

	<form
		method="post"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => { loading = false; await update(); };
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
				placeholder="e.g. Rust read_line helper"
				class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
						<option value={lang} class="capitalize">{lang}</option>
					{/each}
				</select>
			</div>

			<div>
				<label class="mb-1.5 block text-sm font-medium text-slate-300" for="categoryId">
					Category <span class="text-slate-600">(optional)</span>
				</label>
				<select
					id="categoryId"
					name="categoryId"
					class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-slate-300 focus:border-orange-500 focus:outline-none"
				>
					<option value="">No category</option>
					{#each data.categories as cat}
						<option value={cat.id}>{cat.icon} {cat.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<div>
			<label class="mb-1.5 block text-sm font-medium text-slate-300" for="description">
				Description <span class="text-slate-600">(optional)</span>
			</label>
			<input
				id="description"
				type="text"
				name="description"
				placeholder="What does this snippet do?"
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
				placeholder="Paste your code here…"
				class="w-full resize-y rounded-lg border border-[#2d2d2d] bg-[#0d0d0d] px-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
			></textarea>
		</div>

		{#if form?.message}
			<div class="rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-400">
				{form.message}
			</div>
		{/if}

		<div class="flex gap-3 pt-2">
			<button
				type="submit"
				disabled={loading}
				class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:opacity-60"
			>
				{loading ? 'Saving…' : 'Save snippet'}
			</button>
			<a
				href="/snippets"
				class="rounded-lg border border-[#2d2d2d] px-6 py-2.5 font-medium text-slate-400 transition-colors hover:border-[#333333] hover:text-white"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
