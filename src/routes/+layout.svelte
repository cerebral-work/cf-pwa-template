<script lang="ts">
  // Global styles: import from the script block (Vite applies them globally).
  // Do NOT move this into a <style> @import — Svelte scopes element selectors
  // to this component and child routes lose typography/colors (see styles.css).
  import "$lib/styles.css";
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
