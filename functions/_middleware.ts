import type { Env, AccessData } from "./lib/access";
import { verifiedEmail } from "./lib/access";

/**
 * Pages Functions middleware — auth gate for /api/* routes.
 * Static assets pass through (Access gates them at the edge).
 *
 * Sets context.data.email for all downstream API handlers.
 */
export const onRequest: PagesFunction<Env, string, AccessData>[] = [
  async (ctx) => {
    // Only gate /api/* — static assets are edge-gated by Access
    if (!ctx.url.pathname.startsWith("/api/")) {
      return ctx.next();
    }

    const email = await verifiedEmail(ctx.request, ctx.env);
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    ctx.data.email = email;
    return ctx.next();
  },
];
