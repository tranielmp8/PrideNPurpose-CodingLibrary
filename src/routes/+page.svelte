<script lang="ts">
	import codingLibraryImage from '$lib/assets/codingLibrary.png';

	const features = [
		{
			icon: '📂',
			name: 'Category System',
			desc: 'Organize by language or framework. Rust, Go, TypeScript, SQL — each with its own structured workspace.'
		},
		{
			icon: '✍️',
			name: 'Rich Note Editor',
			desc: 'Headers, bullets, code blocks, collapsible sections. A full writing experience designed for technical notes.'
		},
		{
			icon: '💾',
			name: 'Snippets Library',
			desc: 'Save reusable code snippets with syntax highlighting, language tags, and links to categories.'
		},
		{
			icon: '🌲',
			name: 'Deep Navigation',
			desc: 'Drill into topics with nested folders. Smooth breadcrumb navigation keeps you oriented.'
		},
		{
			icon: '🌗',
			name: 'Dark & Light Mode',
			desc: 'Glowing code blocks in dark mode. Clean notebook feel in light. Toggle anytime.'
		},
		{
			icon: '🔒',
			name: 'Private & Secure',
			desc: 'Your notes are yours. Production-grade auth, ready to grow into a public learning platform.'
		}
	];
</script>

<div class="min-h-screen bg-[#0d0d0d] text-white">
	<nav class="flex items-center justify-between border-b border-[#252525]/60 px-8 py-5">
		<div class="flex items-center gap-2">
			<span class="text-2xl">📚</span>
			<span class="font-mono text-xl font-semibold text-white">CodingLibrary</span>
		</div>
		<div class="flex items-center gap-3">
			<a href="/login" class="px-4 py-2 text-slate-400 transition-colors hover:text-white">
				Sign in
			</a>
			<a
				href="/signup"
				class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 font-medium text-white transition-colors hover:from-orange-600 hover:to-red-600"
			>
				Get started
			</a>
		</div>
	</nav>

	<main class="mx-auto max-w-6xl px-8 py-28 text-center">
		<div
			class="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-800/60 bg-orange-950/60 px-4 py-1.5 text-sm text-orange-300"
		>
			<span class="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
			Personal coding knowledge vault
		</div>

		<h1
			class="mb-6 bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-6xl font-bold leading-tight text-transparent"
		>
			Your personal coding<br />knowledge vault.
		</h1>

		<p class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-400">
			Learn languages, organize notes, store snippets, and build your developer brain — all in one
			beautiful place.
		</p>

		<div class="flex items-center justify-center gap-4">
			<a
				href="/signup"
				class="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3.5 text-lg font-semibold text-white transition-all hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-orange-500/25"
			>
				Get Started Free
			</a>
			<a
				href="#features"
				class="rounded-xl border border-[#2d2d2d] px-8 py-3.5 text-lg font-semibold text-slate-300 transition-colors hover:border-[#444444] hover:text-white"
			>
				See Features
			</a>
		</div>

		<div
			class="mx-auto mt-20 max-w-2xl overflow-hidden rounded-2xl border border-[#252525] shadow-2xl shadow-black/60"
		>
			<img
				src={codingLibraryImage}
				alt="CodingLibrary application preview"
				class="block w-full bg-[#181818] object-cover"
			/>
		</div>
	</main>

	<section id="features" class="mx-auto max-w-6xl px-8 py-24">
		<h2 class="mb-4 text-center text-4xl font-bold">Everything you need to learn deeply</h2>
		<p class="mb-16 text-center text-lg text-slate-400">
			Built for developers who take their learning seriously.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<div
					class="rounded-2xl border border-[#252525] bg-[#181818] p-6 transition-colors hover:border-[#2d2d2d]"
				>
					<div class="mb-4 text-3xl">{feature.icon}</div>
					<h3 class="mb-2 text-lg font-semibold text-white">{feature.name}</h3>
					<p class="text-sm leading-relaxed text-slate-400">{feature.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="border-t border-[#252525] py-24 text-center">
		<h2 class="mb-4 text-4xl font-bold">Start building your coding brain.</h2>
		<p class="mb-8 text-lg text-slate-400">
			Create your first category and begin your learning vault.
		</p>
		<a
			href="/signup"
			class="inline-block rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-10 py-4 text-lg font-semibold text-white transition-all hover:from-orange-600 hover:to-red-600 hover:shadow-xl hover:shadow-orange-500/25"
		>
			Get Started Free
		</a>
	</section>

	<footer class="border-t border-[#252525] py-8 text-center text-sm text-slate-600">
		<span class="font-mono">CodingLibrary</span> — Build your developer brain.
	</footer>
</div>
