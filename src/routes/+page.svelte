<script lang="ts">
  // Replace this with your app's landing page
</script>

<div class="hero">
  <h1>cf-pwa-template</h1>
  <p>SvelteKit + Bun + TypeScript + Cloudflare Alchemy</p>
  <div class="tiers">
    <a href="https://alchemy.run" class="tier">Alchemy IaC</a>
    <span class="sep">·</span>
    <a href="https://svelte.dev" class="tier">SvelteKit</a>
    <span class="sep">·</span>
    <a href="https://bun.sh" class="tier">Bun</a>
  </div>
</div>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    text-align: center;
  }
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--accent);
  }
  p {
    color: var(--text-dim);
    margin-top: 8px;
  }
  .tiers {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .tier {
    color: var(--accent);
    text-decoration: none;
    font-size: 13px;
    border-bottom: 1px dashed var(--accent-dim);
  }
  .tier:hover {
    color: var(--text);
  }
  .sep {
    color: var(--border);
  }
</style>
