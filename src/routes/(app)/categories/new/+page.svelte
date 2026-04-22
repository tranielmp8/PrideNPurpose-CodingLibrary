<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const icons = [
		// Folders & general
		'📁','📂','📚','📝','📄','🗒️',
		// Web frameworks
		'⚛️','💚','🔸','▲','🌀','🚀','💿','🅰️',
		// Languages
		'🦀','🐹','🐍','📘','☕','💎','🐘','🦅','🔷','📜','💧','🌙','🐪','🔴',
		// Tools & infra
		'💻','🌐','🗄️','🐳','📦','🔧','☁️','🏗️','🔌','🔀','🖥️','🐧','🔐',
		// Concepts & data
		'⚡','🔥','🎯','🌿','🧪','🧮','📊','🤖','🔍','🔄','💡','🛠️','🗺️','🏆',
		// Misc tech
		'🕸️','💨','🍃','🔩','⚙️','🛡️','📡','🎨','🧩','🔑'
	];
	const colors = [
		{ label: 'Indigo', value: '#f97316' },
		{ label: 'Violet', value: '#8b5cf6' },
		{ label: 'Blue', value: '#3b82f6' },
		{ label: 'Cyan', value: '#06b6d4' },
		{ label: 'Emerald', value: '#10b981' },
		{ label: 'Teal', value: '#14b8a6' },
		{ label: 'Rose', value: '#f43f5e' },
		{ label: 'Orange', value: '#f97316' },
		{ label: 'Amber', value: '#f59e0b' }
	];

	let selectedIcon = $state('📁');
	let selectedColor = $state('#f97316');
	let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl px-8 py-10">
	<div class="mb-8">
		<a href="/categories" class="text-sm text-slate-500 hover:text-slate-300 transition-colors">
			← Back to categories
		</a>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 dark:text-white">New Category</h1>
		<p class="mt-1 text-slate-500 dark:text-slate-400">Create a space to organize your notes and snippets.</p>
	</div>

	<form
		method="post"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
		class="space-y-7"
	>
		<input type="hidden" name="icon" value={selectedIcon} />
		<input type="hidden" name="color" value={selectedColor} />

		<!-- Preview -->
		<div class="flex items-center gap-4 rounded-xl border border-[#2d2d2d] bg-[#1e1e1e] p-5">
			<span class="text-5xl">{selectedIcon}</span>
			<div>
				<div class="h-2 w-32 rounded-full mb-1.5" style="background-color: {selectedColor}"></div>
				<div class="h-2 w-20 rounded-full bg-[#282828]"></div>
			</div>
		</div>

		<!-- Name -->
		<div>
			<label class="mb-1.5 block text-sm font-medium text-slate-300" for="name">Name</label>
			<input
				id="name"
				type="text"
				name="name"
				required
				placeholder="e.g. Rust, TypeScript, Docker…"
				class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
			/>
		</div>

		<!-- Description -->
		<div>
			<label class="mb-1.5 block text-sm font-medium text-slate-300" for="description">
				Description <span class="text-slate-600">(optional)</span>
			</label>
			<textarea
				id="description"
				name="description"
				rows="2"
				placeholder="What will you learn here?"
				class="w-full resize-none rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
			></textarea>
		</div>

		<!-- Icon picker -->
		<div>
			<p class="mb-2 text-sm font-medium text-slate-300">Icon</p>
			<div class="flex flex-wrap gap-2">
				{#each icons as icon}
					<button
						type="button"
						onclick={() => (selectedIcon = icon)}
						class="rounded-lg px-3 py-2 text-xl transition-colors {selectedIcon === icon
							? 'bg-orange-500/20 ring-1 ring-orange-500'
							: 'bg-[#1e1e1e] hover:bg-[#282828]'}"
					>
						{icon}
					</button>
				{/each}
			</div>
		</div>

		<!-- Color picker -->
		<div>
			<p class="mb-2 text-sm font-medium text-slate-300">Color</p>
			<div class="flex flex-wrap gap-2.5">
				{#each colors as c}
					<button
						type="button"
						onclick={() => (selectedColor = c.value)}
						title={c.label}
						class="h-8 w-8 rounded-full transition-transform hover:scale-110 {selectedColor === c.value
							? 'ring-2 ring-white ring-offset-2 ring-offset-[#181818]'
							: ''}"
						style="background-color: {c.value}"
					></button>
				{/each}
			</div>
		</div>

		{#if form?.message}
			<div
				class="rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-400"
			>
				{form.message}
			</div>
		{/if}

		<div class="flex gap-3 pt-2">
			<button
				type="submit"
				disabled={loading}
				class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:opacity-60"
			>
				{loading ? 'Creating…' : 'Create category'}
			</button>
			<a
				href="/categories"
				class="rounded-lg border border-[#2d2d2d] px-6 py-2.5 font-medium text-slate-400 transition-colors hover:border-[#333333] hover:text-white"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
