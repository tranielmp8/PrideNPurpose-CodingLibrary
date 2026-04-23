import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

const authBaseURL = getAuthBaseURL();

export const auth = betterAuth({
	baseURL: authBaseURL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

function getAuthBaseURL() {
	const origin = env.ORIGIN?.trim() || env.BETTER_AUTH_URL?.trim();

	if (!origin) return undefined;
	if (/^https?:\/\//i.test(origin)) return origin.replace(/\/+$/, '');

	return `https://${origin.replace(/\/+$/, '')}`;
}
