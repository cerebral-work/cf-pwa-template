import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Cloudflare Access JWT verification — defense-in-depth.
 *
 * Access gates at the edge (self-hosted app). This verifies the JWT
 * per-request in Functions/SSR as a second layer.
 *
 * Usage in +page.server.ts (SSR) or functions/_middleware.ts (Pages):
 *   const email = await verifiedEmail(request, platform.env);
 */

export interface Env {
  BUCKET?: R2Bucket;
  DB?: D1Database;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  DEV_EMAIL?: string;
}

export interface AccessData extends Record<string, unknown> {
  email: string;
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwksFor(teamDomain: string) {
  let cached = jwksCache.get(teamDomain);
  if (!cached) {
    cached = createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`)
    );
    jwksCache.set(teamDomain, cached);
  }
  return cached;
}

function extractToken(request: Request): string | null {
  const header = request.headers.get("Cf-Access-Jwt-Assertion");
  if (header) return header;
  const cookie = request.headers
    .get("Cookie")
    ?.match(/CF_Authorization=([^;]+)/)?.[1];
  return cookie ?? null;
}

export async function verifiedEmail(
  request: Request,
  env: Env
): Promise<string | null> {
  // DEV bypass — localhost only
  if (
    env.DEV_EMAIL &&
    (request.headers.get("Host")?.includes("localhost") ||
      request.headers.get("Host")?.includes("127.0.0.1"))
  ) {
    return env.DEV_EMAIL.toLowerCase();
  }

  if (!env.ACCESS_AUD) {
    console.error("ACCESS_AUD not set — refusing to verify");
    return null;
  }

  const token = extractToken(request);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwksFor(env.ACCESS_TEAM_DOMAIN), {
      issuer: `https://${env.ACCESS_TEAM_DOMAIN}`,
      audience: env.ACCESS_AUD,
    });
    if (typeof payload.email === "string") {
      return payload.email.trim().toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}
