# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.1 create --template minimal --types ts --add prettier tailwindcss="plugins:typography" drizzle="database:postgresql+postgresql:postgres.js+docker:no" better-auth="demo:password" --install npm coding-library
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

Icons:
Both the new category and edit category pages now have the expanded icon set. Here's the mapping for the popular ones:

┌────────────┬──────┬─────┬────────────┬──────┐  
 │ Tech │ Icon │ │ Tech │ Icon │
├────────────┼──────┼─────┼────────────┼──────┤  
 │ React │ ⚛️ │ │ Svelte │ 🔸 │  
 ├────────────┼──────┼─────┼────────────┼──────┤
│ Vue / Nuxt │ 💚 │ │ Next.js │ ▲ │
├────────────┼──────┼─────┼────────────┼──────┤
│ Astro │ 🚀 │ │ Angular │ 🅰️ │
├────────────┼──────┼─────┼────────────┼──────┤
│ Remix │ 💿 │ │ SvelteKit │ 🌀 │
├────────────┼──────┼─────┼────────────┼──────┤
│ Rust │ 🦀 │ │ Go │ 🐹 │
├────────────┼──────┼─────┼────────────┼──────┤
│ Python │ 🐍 │ │ TypeScript │ 🔷 │
├────────────┼──────┼─────┼────────────┼──────┤
│ Java │ ☕ │ │ Ruby │ 💎 │
├────────────┼──────┼─────┼────────────┼──────┤
│ PHP │ 🐘 │ │ Swift │ 🦅 │
├────────────┼──────┼─────┼────────────┼──────┤
│ Elixir │ 💧 │ │ Lua │ 🌙 │
├────────────┼──────┼─────┼────────────┼──────┤
│ Perl │ 🐪 │ │ Docker │ 🐳 │
├────────────┼──────┼─────┼────────────┼──────┤
│ Linux │ 🐧 │ │ AI/ML │ 🤖 │
├────────────┼──────┼─────┼────────────┼──────┤
│ Tailwind │ 💨 │ │ GraphQL │ 🔌 │

Note2Note:
How it works:

1. Type [[ anywhere in the editor — a floating dropdown appears showing matching notes (fetched from /api/notes/search)
2. Keep typing to filter by title (120ms debounce)
3. Navigate with ↑ ↓, select with Enter or Tab, dismiss with Escape (or click a result directly)
4. The selected note becomes an inline orange chip styled as [[Note Title]] that links to /notes/[id]
5. Clicking the chip navigates to that note
6. When exported to Markdown, note links render as [[Note Title]] in the frontmatter body
