<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { User } from 'better-auth/minimal';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	let { user, dueCount = 0 }: { user: User; dueCount?: number } = $props();

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: '⊞' },
		{ href: '/categories', label: 'Categories', icon: '📂' },
		{ href: '/snippets', label: 'Snippets', icon: '💾' },
		{ href: '/guides', label: 'Guides', icon: '🗺️' },
		{ href: '/favorites', label: 'Favorites', icon: '★' },
		{ href: '/tags', label: 'Tags', icon: '🏷️' },
		{ href: '/review', label: 'Review', icon: '🧠' },
		{ href: '/archive', label: 'Archive', icon: '🗃️' },
		{ href: '/settings', label: 'Settings', icon: '⚙' }
	];

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}

	let searchQuery = $state('');
	let searchInput: HTMLInputElement | undefined = $state();

	function handleSearch(e: Event) {
		e.preventDefault();
		const q = searchQuery.trim();
		if (q) goto(`/search?q=${encodeURIComponent(q)}`);
	}

	function onKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			searchInput?.focus();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<aside
	class="flex h-screen w-60 shrink-0 flex-col border-r border-gray-400 bg-white dark:border-[#252525] dark:bg-[#111111]"
>
	<!-- Logo -->
	<div class="flex items-center gap-2.5 border-b border-gray-400 px-5 py-5 dark:border-[#252525]">
		<span class="text-2xl">📚</span>
		<span class="font-mono text-lg font-semibold text-slate-900 dark:text-white">CodingLibrary</span>
	</div>

	<!-- Search -->
	<div class="border-b border-gray-200 px-3 py-3 dark:border-[#1e1e1e]">
		<form onsubmit={handleSearch}>
			<div class="relative">
				<span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">🔍</span>
				<input
					bind:this={searchInput}
					bind:value={searchQuery}
					type="text"
					placeholder="Search…"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-10 text-sm text-slate-700 placeholder-slate-400 transition-colors focus:border-orange-400 focus:bg-white focus:outline-none dark:border-[#2d2d2d] dark:bg-[#1a1a1a] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-orange-500 dark:focus:bg-[#1e1e1e]"
				/>
				<span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-600">⌘K</span>
			</div>
		</form>
	</div>

	<!-- Nav -->
	<nav class="flex-1 overflow-y-auto px-3 py-4">
		<ul class="space-y-0.5">
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors {isActive(item.href)
							? 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400'
							: 'text-slate-500 hover:bg-gray-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'}"
					>
						<span class="text-base leading-none">{item.icon}</span>
						<span class="flex-1">{item.label}</span>
						{#if item.href === '/review' && dueCount > 0}
							<span class="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
								{dueCount > 99 ? '99+' : dueCount}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- User -->
	<div class="border-t border-gray-400 px-4 py-4 dark:border-[#252525]">
		<div class="mb-3 flex items-center justify-between px-1">
			<span class="text-xs text-slate-400 dark:text-slate-500">Theme</span>
			<ThemeToggle />
		</div>
		<div class="flex items-center gap-3">
			<div
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-sm font-semibold text-white"
			>
				{user.name?.[0]?.toUpperCase() ?? '?'}
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
				<p class="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
			</div>
			<form method="post" action="/logout">
				<button
					type="submit"
					title="Sign out"
					class="rounded p-1 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
				</button>
			</form>
		</div>
	</div>
</aside>
