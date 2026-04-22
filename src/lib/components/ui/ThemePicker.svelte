<script lang="ts">
	import { onMount } from 'svelte';
	import { themes, applyTheme, getStoredTheme, type ThemeId } from '$lib/utils/themes';

	let current = $state<ThemeId>('dark');

	onMount(() => {
		current = getStoredTheme();
	});

	function select(id: ThemeId) {
		current = id;
		applyTheme(id);
	}
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
	{#each themes as theme}
		<button
			type="button"
			onclick={() => select(theme.id)}
			class="group relative overflow-hidden rounded-xl border-2 text-left transition-all {current === theme.id
				? 'border-orange-500 ring-2 ring-orange-500/30'
				: 'border-gray-400 hover:border-slate-400 dark:border-[#2d2d2d] dark:hover:border-[#444444]'}"
		>
			<!-- Mini UI preview -->
			<div class="flex h-28 overflow-hidden rounded-t-[10px]" style="background:{theme.preview.bg}">
				<!-- Sidebar strip -->
				<div
					class="flex w-10 shrink-0 flex-col gap-1.5 px-2 py-2.5"
					style="background:{theme.preview.sidebar}; border-right:1px solid {theme.preview.border}"
				>
					<div class="h-1.5 w-6 rounded-full" style="background:{theme.preview.accent}"></div>
					{#each [5, 4, 5] as w}
						<div class="h-1 w-{w} rounded-full opacity-40" style="background:{theme.preview.subtext}"></div>
					{/each}
					<div class="mt-auto h-1.5 w-5 rounded-full opacity-30" style="background:{theme.preview.subtext}"></div>
				</div>

				<!-- Content area -->
				<div class="flex-1 px-3 py-2.5 space-y-2">
					<!-- Title bar -->
					<div class="h-2 w-20 rounded-full" style="background:{theme.preview.text}; opacity:0.8"></div>
					<!-- Surface card -->
					<div
						class="rounded-lg p-2 space-y-1.5"
						style="background:{theme.preview.surface}; border:1px solid {theme.preview.border}"
					>
						<div class="h-1.5 w-16 rounded-full" style="background:{theme.preview.text}; opacity:0.7"></div>
						<div class="h-1 w-24 rounded-full" style="background:{theme.preview.subtext}; opacity:0.6"></div>
						<div class="h-1 w-20 rounded-full" style="background:{theme.preview.subtext}; opacity:0.4"></div>
					</div>
					<!-- Accent button -->
					<div class="flex gap-1.5">
						<div class="h-4 w-12 rounded-md" style="background:{theme.preview.accent}"></div>
						<div class="h-4 w-8 rounded-md opacity-30" style="background:{theme.preview.subtext}"></div>
					</div>
				</div>
			</div>

			<!-- Label -->
			<div
				class="flex items-center justify-between px-4 py-3"
				style="background:{theme.preview.surface}; border-top:1px solid {theme.preview.border}"
			>
				<div>
					<p
						class="text-sm font-semibold leading-tight"
						style="color:{theme.preview.text}"
					>{theme.name}</p>
					<p class="mt-0.5 text-xs leading-tight" style="color:{theme.preview.subtext}">
						{theme.description}
					</p>
				</div>
				{#if current === theme.id}
					<div class="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500">
						<svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
					</div>
				{/if}
			</div>
		</button>
	{/each}
</div>
