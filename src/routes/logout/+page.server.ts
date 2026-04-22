import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { auth } from '$lib/server/auth';

export const actions: Actions = {
	default: async (event) => {
		const session = event.locals.session;
		if (session) {
			await auth.api.signOut({ headers: event.request.headers });
		}
		redirect(302, '/login');
	}
};
