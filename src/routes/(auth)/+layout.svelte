<script lang="ts">
	let { children } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-4">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<a href="/" class="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
				<span class="text-3xl">📚</span>
				<span class="font-mono text-2xl font-semibold">CodingLibrary</span>
			</a>
		</div>
		<div class="rounded-2xl border border-[#252525] bg-[#181818] p-8 shadow-2xl shadow-black/40">
			{@render children()}
		</div>
		<p class="mt-6 text-center text-sm text-slate-600">
			Build your developer brain, one note at a time.
		</p>
	</div>
</div>
