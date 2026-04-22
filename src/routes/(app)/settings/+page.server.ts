import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = (event) => {
	return { user: event.locals.user! };
};

export const actions: Actions = {
	updateProfile: async (event) => {
		const userId = event.locals.user!.id;
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';

		if (!name) return fail(400, { section: 'profile', message: 'Name cannot be empty.' });

		await db.update(userTable).set({ name }).where(eq(userTable.id, userId));

		return { section: 'profile', success: true };
	},

	changePassword: async (event) => {
		const formData = await event.request.formData();
		const currentPassword = formData.get('currentPassword')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (newPassword !== confirmPassword) {
			return fail(400, { section: 'password', message: 'New passwords do not match.' });
		}
		if (newPassword.length < 8) {
			return fail(400, {
				section: 'password',
				message: 'Password must be at least 8 characters.'
			});
		}

		try {
			await auth.api.changePassword({
				body: { currentPassword, newPassword, revokeOtherSessions: false },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, {
					section: 'password',
					message: error.message || 'Could not change password. Check your current password.'
				});
			}
			return fail(500, { section: 'password', message: 'Something went wrong. Please try again.' });
		}

		return { section: 'password', success: true };
	}
};
