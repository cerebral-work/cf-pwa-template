# Infrastructure — Tier Switching Guide

All three tiers share the same SvelteKit routes and components.
Only the adapter config and `+layout.ts` exports change.

## Tier 1 → Tier 3 (Static → SSR)

### 1. Swap the adapter in `svelte.config.js`

```js
// Before (Tier 1/2 — static)
import adapter from "@sveltejs/adapter-static";
adapter: adapter({ fallback: "index.html", strict: false })

// After (Tier 3 — SSR on Workers)
import alchemy from "alchemy/cloudflare/sveltekit";
adapter: alchemy()
```

### 2. Enable SSR in `src/routes/+layout.ts`

```ts
// Before
export const ssr = false;
export const prerender = true;

// After
export const ssr = true;
// Remove prerender — SSR handles rendering at request time
```

### 3. Access bindings in `+page.server.ts`

```ts
import { env } from "cloudflare:workers";

export async function load() {
  const value = await env.BUCKET?.get("key");
  const row = await env.DB?.prepare("SELECT * FROM items LIMIT 1").first();
  return { value, row };
}
```

Types come from `src/env.d.ts` which imports `website.Env` from `alchemy.run.ts`.

## Tier 1 → Tier 2 (Static → Functions)

No adapter change needed. Just add `functions/` directory.

1. Write `functions/_middleware.ts` (auth gate)
2. Write `functions/api/*.ts` (API routes)
3. Add bindings to `alchemy.run.ts` (R2, D1)
4. Set `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` as env vars

The SPA build stays the same — Functions are deployed alongside static assets.
