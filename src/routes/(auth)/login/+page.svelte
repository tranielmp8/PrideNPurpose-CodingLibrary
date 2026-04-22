<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<h1 class="mb-2 text-2xl font-bold text-white">Welcome back</h1>
<p class="mb-8 text-slate-400">Sign in to your coding library.</p>

<form
	method="post"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
	class="space-y-5"
>
	<div>
		<label class="mb-1.5 block text-sm font-medium text-slate-300" for="email">Email</label>
		<input
			id="email"
			type="email"
			name="email"
			required
			placeholder="you@example.com"
			class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
		/>
	</div>

	<div>
		<label class="mb-1.5 block text-sm font-medium text-slate-300" for="password">Password</label>
		<input
			id="password"
			type="password"
			name="password"
			required
			placeholder="••••••••"
			class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
		/>
	</div>

	{#if form?.message}
		<div class="rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-400">
			{form.message}
		</div>
	{/if}

	<button
		type="submit"
		disabled={loading}
		class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
	>
		{loading ? 'Signing in…' : 'Sign in'}
	</button>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
	Don't have an account?
	<a href="/signup" class="font-medium text-orange-400 hover:text-orange-300 transition-colors">
		Create one
	</a>
</p>
