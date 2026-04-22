<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import QuickCapture from '$lib/components/ui/QuickCapture.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-gray-100 text-slate-800 dark:bg-[#0d0d0d] dark:text-slate-100">
	<Sidebar user={data.user} dueCount={data.dueCount} />

	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Top bar with Quick Capture -->
		<div class="flex items-center justify-end border-b border-gray-200 bg-white px-5 py-2 dark:border-[#1a1a1a] dark:bg-[#0d0d0d]">
			<QuickCapture />
		</div>
		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>
