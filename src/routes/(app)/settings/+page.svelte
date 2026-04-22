<script lang="ts">
	import { enhance } from '$app/forms';
	import ThemePicker from '$lib/components/ui/ThemePicker.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let profileLoading = $state(false);
	let passwordLoading = $state(false);
	let passwordKey = $state(0);
</script>

<div class="mx-auto max-w-2xl px-8 py-10">
	<div class="mb-10">
		<h1 class="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
		<p class="mt-1 text-slate-500 dark:text-slate-300">Manage your account and preferences.</p>
	</div>

	<div class="space-y-6">
		<!-- Profile -->
		<section class="rounded-2xl border border-gray-400 bg-white p-6 dark:border-[#252525] dark:bg-[#181818]">
			<h2 class="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Profile</h2>
			<p class="mb-6 text-sm text-slate-500 dark:text-slate-300">Update your display name.</p>

			<form
				method="post"
				action="?/updateProfile"
				use:enhance={() => {
					profileLoading = true;
					return async ({ update }) => { profileLoading = false; await update({ reset: false }); };
				}}
				class="space-y-4"
			>
				<div class="flex items-center gap-4">
					<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-xl font-bold text-white">
						{data.user.name?.[0]?.toUpperCase() ?? '?'}
					</div>
					<div class="flex-1">
						<p class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-300">Display name</p>
						<input
							type="text"
							name="name"
							required
							value={data.user.name}
							class="w-full rounded-lg border border-gray-400 bg-gray-50 px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-[#333333] dark:bg-[#282828] dark:text-white"
						/>
					</div>
				</div>

				<div>
					<label class="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300" for="email-display">
						Email address
					</label>
					<input
						id="email-display"
						type="email"
						value={data.user.email}
						disabled
						class="w-full cursor-not-allowed rounded-lg border border-gray-400 bg-gray-100 px-4 py-2.5 text-slate-400 dark:border-[#333333] dark:bg-[#282828]/50 dark:text-slate-400"
					/>
					<p class="mt-1.5 text-xs text-slate-400 dark:text-slate-400">Email cannot be changed.</p>
				</div>

				{#if form?.section === 'profile'}
					{#if form.success}
						<p class="text-sm text-emerald-500">✓ Profile updated successfully.</p>
					{:else if form.message}
						<p class="text-sm text-red-400">{form.message}</p>
					{/if}
				{/if}

				<button
					type="submit"
					disabled={profileLoading}
					class="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:from-orange-600 hover:to-red-600 disabled:opacity-60"
				>
					{profileLoading ? 'Saving…' : 'Save profile'}
				</button>
			</form>
		</section>

		<!-- Appearance -->
		<section class="rounded-2xl border border-gray-400 bg-white p-6 dark:border-[#252525] dark:bg-[#181818]">
			<h2 class="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
			<p class="mb-6 text-sm text-slate-500 dark:text-slate-300">
				Choose your theme. More themes — including language-specific ones — coming soon.
			</p>
			<ThemePicker />
		</section>

		<!-- Security -->
		<section class="rounded-2xl border border-gray-400 bg-white p-6 dark:border-[#252525] dark:bg-[#181818]">
			<h2 class="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
			<p class="mb-6 text-sm text-slate-500 dark:text-slate-300">Change your password.</p>

			{#key passwordKey}
				<form
					method="post"
					action="?/changePassword"
					use:enhance={() => {
						passwordLoading = true;
						return async ({ update, result }) => {
							passwordLoading = false;
							if (result.type === 'success') passwordKey++;
							await update({ reset: false });
						};
					}}
					class="space-y-4"
				>
					{#each [
						{ id: 'currentPassword', name: 'currentPassword', label: 'Current password', placeholder: '••••••••' },
						{ id: 'newPassword', name: 'newPassword', label: 'New password', placeholder: 'Min 8 characters' },
						{ id: 'confirmPassword', name: 'confirmPassword', label: 'Confirm new password', placeholder: 'Re-enter new password' }
					] as field}
						<div>
							<label class="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300" for={field.id}>
								{field.label}
							</label>
							<input
								id={field.id}
								type="password"
								name={field.name}
								required
								placeholder={field.placeholder}
								class="w-full rounded-lg border border-gray-400 bg-gray-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-[#333333] dark:bg-[#282828] dark:text-white dark:placeholder-slate-400"
							/>
						</div>
					{/each}

					{#if form?.section === 'password'}
						{#if form.success}
							<p class="text-sm text-emerald-500">✓ Password changed successfully.</p>
						{:else if form.message}
							<p class="text-sm text-red-400">{form.message}</p>
						{/if}
					{/if}

					<button
						type="submit"
						disabled={passwordLoading}
						class="rounded-lg bg-[#282828] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333333] disabled:opacity-60 dark:bg-[#252525] dark:hover:bg-[#333333]"
					>
						{passwordLoading ? 'Updating…' : 'Update password'}
					</button>
				</form>
			{/key}
		</section>

		<!-- Account -->
		<section class="rounded-2xl border border-gray-400 bg-white p-6 dark:border-[#252525] dark:bg-[#181818]">
			<h2 class="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Account</h2>
			<p class="mb-4 text-sm text-slate-500 dark:text-slate-300">Your account details.</p>

			<dl class="space-y-3 text-sm">
				<div class="flex justify-between">
					<dt class="text-slate-500 dark:text-slate-300">Member since</dt>
					<dd class="font-medium text-slate-900 dark:text-white">
						{new Date(data.user.createdAt).toLocaleDateString('en-US', {
							month: 'long', day: 'numeric', year: 'numeric'
						})}
					</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-slate-500 dark:text-slate-300">Email verified</dt>
					<dd class="font-medium">
						{#if data.user.emailVerified}
							<span class="text-emerald-500">✓ Verified</span>
						{:else}
							<span class="text-amber-500">Not verified</span>
						{/if}
					</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-slate-500 dark:text-slate-300">Email</dt>
					<dd class="font-medium text-slate-900 dark:text-white">{data.user.email}</dd>
				</div>
			</dl>
		</section>
	</div>
</div>
