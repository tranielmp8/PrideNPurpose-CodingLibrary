<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="mx-auto max-w-xl px-8 py-10">
	<div class="mb-8">
		<a href="/guides" class="text-sm text-slate-500 transition-colors hover:text-orange-400">← Back to guides</a>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 dark:text-white">New Build Guide</h1>
		<p class="mt-1 text-slate-500">Create a project structure guide with file-by-file explanations.</p>
	</div>

	<form
		method="post"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => { loading = false; await update(); };
		}}
		class="space-y-5"
	>
		<div>
			<label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" for="title">Guide title</label>
			<input
				id="title"
				type="text"
				name="title"
				required
				placeholder="e.g. Rust REST API with Axum"
				class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-white dark:placeholder-slate-500"
			/>
		</div>

		<div>
			<label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" for="description">Description <span class="text-slate-400">(optional)</span></label>
			<textarea
				id="description"
				name="description"
				rows="3"
				placeholder="What will someone learn from this guide?"
				class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-white dark:placeholder-slate-500"
			></textarea>
		</div>

		<div>
			<label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300" for="categoryId">Category <span class="text-slate-400">(optional)</span></label>
			<select
				id="categoryId"
				name="categoryId"
				class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-white"
			>
				<option value="">— No category —</option>
				{#each data.categories as cat}
					<option value={cat.id}>{cat.icon} {cat.name}</option>
				{/each}
			</select>
		</div>

		{#if form?.message}
			<p class="text-sm text-red-400">{form.message}</p>
		{/if}

		<div class="flex gap-3 pt-2">
			<button
				type="submit"
				disabled={loading}
				class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:opacity-60"
			>
				{loading ? 'Creating…' : 'Create Guide'}
			</button>
			<a href="/guides" class="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:text-slate-400 dark:hover:text-white">
				Cancel
			</a>
		</div>
	</form>
</div>
