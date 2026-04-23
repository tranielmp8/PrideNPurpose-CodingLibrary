<script lang="ts">
	import { common, createLowlight } from 'lowlight';
	import { toHtml } from 'hast-util-to-html';

	let { code, language = 'plaintext' }: { code: string; language?: string } = $props();
	let html = $state('');
	let copied = $state(false);

	const lowlight = createLowlight(common);

	$effect(() => {
		try {
			const tree = lowlight.highlight(language, code);
			html = toHtml(tree as never);
		} catch {
			html = '';
		}
	});

	function copy() {
		navigator.clipboard.writeText(code).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}
</script>

<div class="code-block-wrap">
	<pre
		class="code-block overflow-x-auto"
	><code class="hljs language-{language} font-mono">{@html html || code}</code></pre>
	<button type="button" onclick={copy} class="code-copy-btn {copied ? 'copied' : ''}">
		{copied ? '✓ Copied' : 'Copy'}
	</button>
</div>
