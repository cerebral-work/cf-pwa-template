import alchemy from "alchemy";
import { Website, R2Bucket, D1Database } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";

/**
 * Alchemy IaC — deploys the SvelteKit PWA to Cloudflare Workers.
 *
 * Tier 1 (Static SPA, the default): Website() serving the adapter-static
 *   build/ output. No server entrypoint, so wrangler.jsonc generation is off.
 * Tier 3 (Workers SSR): swap Website() for SvelteKit() (same props minus
 *   assets/spa/wrangler) and the adapter in svelte.config.js — SvelteKit()
 *   expects the adapter-cloudflare output at .svelte-kit/cloudflare.
 *
 * Usage:
 *   bun alchemy login          # one-time CF auth
 *   bun run deploy             # runs this file via tsx (see note below)
 *   bun run destroy            # same, with --destroy
 *
 * Notes:
 *   - `alchemy deploy` is not a CLI subcommand (alchemy 0.35) — deploying
 *     means executing this file. Bun 1.3.x segfaults running it, so the
 *     package scripts go through `bun x tsx` (node).
 *   - The app scope exposes `appName`, not `name`.
 *
 * Bindings (R2, D1) are typed — import from this file for runtime types:
 *   import type { website } from "../alchemy.run.ts";
 *   type Env = typeof website.Env;
 */

const app = await alchemy("cf-pwa-template");

// --- Optional resources (remove if Tier 1 static is all you need) ---

// R2 bucket for file storage
const bucket = await R2Bucket("bucket", {
  name: `${app.appName}-${app.stage}-storage`,
  allowPublicAccess: false,
  adopt: true,
});

// D1 database for structured data
const database = await D1Database("database", {
  name: `${app.appName}-${app.stage}-db`,
  adopt: true,
});

// --- Deploy the SvelteKit app ---

export const website = await Website("website", {
  name: `${app.appName}-${app.stage}`,
  command: "bun run build",
  assets: "build",
  spa: true,
  wrangler: false, // no server entrypoint — wrangler.jsonc generation requires one
  bindings: {
    BUCKET: bucket,
    DB: database,
    // ACCESS_TEAM_DOMAIN: alchemy.secret(process.env.ACCESS_TEAM_DOMAIN),
    // ACCESS_AUD: alchemy.secret(process.env.ACCESS_AUD),
  },
  url: true,
});

console.log(`Deployed to: ${website.url}`);

// PR preview comment (requires GitHub secrets in CI)
if (process.env.PULL_REQUEST) {
  await GitHubComment("preview-comment", {
    owner: process.env.GITHUB_REPOSITORY_OWNER!,
    repository: process.env.GITHUB_REPOSITORY!.split("/")[1],
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `## Preview Deployed\n\n**URL:** ${website.url}\n\nBuilt from commit ${process.env.GITHUB_SHA?.slice(0, 7)}`,
  });
}

await app.finalize();
