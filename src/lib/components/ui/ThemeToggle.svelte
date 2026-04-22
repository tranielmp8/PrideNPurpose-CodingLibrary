<script lang="ts">
	import { onMount } from 'svelte';
	import { applyTheme, getStoredTheme, type ThemeId } from '$lib/utils/themes';

	let current = $state<ThemeId>('dark');

	onMount(() => {
		current = getStoredTheme();
	});

	function toggle() {
		const next: ThemeId = current === 'dark' ? 'light' : 'dark';
		current = next;
		applyTheme(next);
	}
</script>

<button
	onclick={toggle}
	title={current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#1e1e1e] dark:hover:text-slate-300"
>
	{#if current === 'dark'}
		<!-- Sun -->
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
		</svg>
	{:else}
		<!-- Moon -->
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
		</svg>
	{/if}
</button>
