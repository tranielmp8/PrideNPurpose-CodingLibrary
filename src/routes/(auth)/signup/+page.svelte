<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
	let password = $state('');
	let confirmPassword = $state('');

	const mismatch = $derived(confirmPassword.length > 0 && password !== confirmPassword);
</script>

<h1 class="mb-2 text-2xl font-bold text-white">Create your account</h1>
<p class="mb-8 text-slate-400">Start building your coding knowledge vault.</p>

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
		<label class="mb-1.5 block text-sm font-medium text-slate-300" for="name">Name</label>
		<input
			id="name"
			type="text"
			name="name"
			required
			placeholder="Your name"
			class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
		/>
	</div>

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
			minlength="8"
			placeholder="Min 8 characters"
			bind:value={password}
			class="w-full rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
		/>
	</div>

	<div>
		<label class="mb-1.5 block text-sm font-medium text-slate-300" for="confirm-password">
			Confirm password
		</label>
		<input
			id="confirm-password"
			type="password"
			name="confirm_password"
			required
			placeholder="Re-enter your password"
			bind:value={confirmPassword}
			class="w-full rounded-lg border px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 {mismatch
				? 'border-red-600 bg-red-950/20 focus:border-red-500 focus:ring-red-500'
				: 'border-[#2d2d2d] bg-[#1e1e1e] focus:border-orange-500 focus:ring-orange-500'}"
		/>
		{#if mismatch}
			<p class="mt-1.5 text-xs text-red-400">Passwords do not match.</p>
		{/if}
	</div>

	{#if form?.message}
		<div class="rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-400">
			{form.message}
		</div>
	{/if}

	<button
		type="submit"
		disabled={loading || mismatch}
		class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
	>
		{loading ? 'Creating account…' : 'Create account'}
	</button>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
	Already have an account?
	<a href="/login" class="font-medium text-orange-400 hover:text-orange-300 transition-colors">
		Sign in
	</a>
</p>
