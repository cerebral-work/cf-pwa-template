import alchemy from "alchemy";
import { SvelteKit, R2Bucket, D1Database } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";

/**
 * Alchemy IaC — deploys the SvelteKit PWA to Cloudflare Workers.
 *
 * Tier 1 (Static SPA): SvelteKit() with adapter-static build output.
 * Tier 3 (Workers SSR): SvelteKit() with alchemy/cloudflare/sveltekit adapter.
 *
 * Usage:
 *   bun alchemy login          # one-time CF auth
 *   bun run deploy             = alchemy deploy
 *   bun run destroy            = alchemy destroy
 *
 * Bindings (R2, D1) are typed — import from this file for runtime types:
 *   import type { website } from "../alchemy.run.ts";
 *   type Env = typeof website.Env;
 */

const app = await alchemy("cf-pwa-template");

// --- Optional resources (uncomment for Tier 2/3) ---

// R2 bucket for file storage
const bucket = await R2Bucket("bucket", {
  name: `${app.name}-${app.stage}-storage`,
  allowPublicAccess: false,
  adopt: true,
});

// D1 database for structured data
const database = await D1Database("database", {
  name: `${app.name}-${app.stage}-db`,
  adopt: true,
});

// --- Deploy the SvelteKit app ---

export const website = await SvelteKit("website", {
  name: `${app.name}-${app.stage}`,
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
