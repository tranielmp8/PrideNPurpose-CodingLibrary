<script lang="ts">
	import { goto } from '$app/navigation';

	let open = $state(false);
	let title = $state('');
	let categoryId = $state('');
	let template = $state('blank');
	let loading = $state(false);
	let categories = $state<{ id: string; name: string; icon: string }[]>([]);
	let titleInput: HTMLInputElement | undefined = $state();

	const templateOptions = [
		{ id: 'blank', icon: '📄', label: 'Blank' },
		{ id: 'concept', icon: '💡', label: 'Concept' },
		{ id: 'codePattern', icon: '🔧', label: 'Code Pattern' },
		{ id: 'debugLog', icon: '🐛', label: 'Debug Log' },
		{ id: 'commandRef', icon: '💲', label: 'Command Ref' }
	];

	async function openModal() {
		open = true;
		title = '';
		template = 'blank';
		if (categories.length === 0) {
			const res = await fetch('/api/notes');
			categories = await res.json();
			if (categories.length > 0 && !categoryId) categoryId = categories[0].id;
		}
		setTimeout(() => titleInput?.focus(), 50);
	}

	function close() {
		open = false;
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!categoryId || loading) return;
		loading = true;
		try {
			const res = await fetch('/api/notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title, categoryId, template })
			});
			const { id } = await res.json();
			close();
			goto(`/notes/${id}`);
		} finally {
			loading = false;
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
			e.preventDefault();
			open ? close() : openModal();
		}
		if (e.key === 'Escape' && open) close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Trigger button (shown in layout) -->
<button
	onclick={openModal}
	title="Quick capture (⌘⇧N)"
	class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-[#2d2d2d] dark:bg-[#1a1a1a] dark:text-slate-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
>
	<span class="text-base leading-none">+</span>
	<span>Capture</span>
	<span class="hidden text-xs text-slate-400 dark:text-slate-600 sm:inline">⌘⇧N</span>
</button>

<!-- Modal -->
{#if open}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/50"
			onclick={close}
			aria-label="Close"
		></button>

		<!-- Panel -->
		<div class="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-[#252525] dark:bg-[#181818]">
			<form onsubmit={submit} class="p-5 space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="font-semibold text-slate-900 dark:text-white">Quick Capture</h2>
					<button type="button" onclick={close} class="text-slate-400 hover:text-slate-600">✕</button>
				</div>

				<!-- Title -->
				<input
					bind:this={titleInput}
					bind:value={title}
					type="text"
					placeholder="Note title…"
					class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-lg font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-white dark:placeholder-slate-500 dark:focus:bg-[#252525]"
				/>

				<!-- Category -->
				{#if categories.length > 0}
					<select
						bind:value={categoryId}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-500 focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1e1e1e] dark:text-white"
					>
						{#each categories as cat}
							<option value={cat.id}>{cat.icon} {cat.name}</option>
						{/each}
					</select>
				{:else}
					<p class="text-sm text-slate-500">Loading categories…</p>
				{/if}

				<!-- Template -->
				<div class="flex flex-wrap gap-1.5">
					{#each templateOptions as t}
						<button
							type="button"
							onclick={() => (template = t.id)}
							class="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors {template === t.id
								? 'bg-orange-500 text-white'
								: 'bg-gray-100 text-slate-500 hover:text-slate-800 dark:bg-[#252525] dark:text-slate-400 dark:hover:text-slate-200'}"
						>{t.icon} {t.label}</button>
					{/each}
				</div>

				<button
					type="submit"
					disabled={loading || !categoryId}
					class="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
				>
					{loading ? 'Creating…' : 'Create Note'}
				</button>
			</form>
		</div>
	</div>
{/if}
