// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface User {
			id: string;
			name?: string | null;
			email: string;
			emailVerified?: boolean;
			image?: string | null;
			createdAt: Date;
			updatedAt: Date;
		}

		interface Locals {
			user?: User;
			session?: unknown;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
