export type ThemeId = 'dark' | 'light';

export interface Theme {
	id: ThemeId;
	name: string;
	description: string;
	preview: {
		bg: string;
		sidebar: string;
		surface: string;
		accent: string;
		text: string;
		subtext: string;
		border: string;
	};
}

export const themes: Theme[] = [
	{
		id: 'dark',
		name: 'Dark',
		description: 'Rich dark background with glowing accents. Built for late-night coding.',
		preview: {
			bg: '#0f172a',
			sidebar: '#020617',
			surface: '#1e293b',
			accent: '#f97316',
			text: '#f1f5f9',
			subtext: '#64748b',
			border: '#1e293b'
		}
	},
	{
		id: 'light',
		name: 'Light',
		description: 'Clean white background, modern notebook feel. Great for daytime studying.',
		preview: {
			bg: '#f1f5f9',
			sidebar: '#ffffff',
			surface: '#ffffff',
			accent: '#f97316',
			text: '#0f172a',
			subtext: '#94a3b8',
			border: '#e2e8f0'
		}
	}
	// Language themes will be added here:
	// { id: 'rust', name: 'Rust', accent: '#f97316', ... },
	// { id: 'go',   name: 'Go',   accent: '#06b6d4', ... },
];

export function applyTheme(id: ThemeId): void {
	document.documentElement.classList.toggle('dark', id === 'dark');
	document.documentElement.setAttribute('data-theme', id);
	localStorage.setItem('cl-theme', id);
}

export function getStoredTheme(): ThemeId {
	if (typeof localStorage === 'undefined') return 'dark';
	return localStorage.getItem('cl-theme') === 'light' ? 'light' : 'dark';
}
