<script lang="ts">
  import { setContext } from "svelte";

  let { children } = $props();

  // Generic data-loading skeleton — replace with your domain fetch
  let data = $state<unknown>(null);
  let error = $state<string | null>(null);

  // Expose for child routes via context getter pattern (Svelte 5 idiomatic)
  setContext("data", () => data);
  setContext("error", () => error);

  // Register service worker
  $effect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  });
</script>

<svelte:head>
  <title>cf-pwa-template</title>
  <meta name="description" content="Cloudflare PWA template — SvelteKit + Bun + TypeScript + Alchemy" />
</svelte:head>

{@render children()}

<style>
  :root {
    --bg: #0a0a0a;
    --surface: #141414;
    --surface2: #1a1a1a;
    --border: #2a2a2a;
    --text: #e0e0e0;
    --text-dim: #888;
    --accent: #4dcc7a;
    --accent-dim: #2a6b42;
    --red: #e74c3c;
    --yellow: #f1c40f;
    --blue: #3498db;
  }
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  :global(html, body) {
    background: var(--bg);
    color: var(--text);
    font-family: "SF Mono", "JetBrains Mono", "Fira Code", monospace;
    font-size: 14px;
    line-height: 1.5;
  }
</style>
