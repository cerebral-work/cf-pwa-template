import type { Env, AccessData } from "../lib/access";

/**
 * GET /api/me — returns the authenticated user's email.
 * Example API route showing the ctx.data.email pattern.
 */
export const onRequestGet: PagesFunction<Env, string, AccessData> = async (
  ctx
) => {
  return new Response(
    JSON.stringify({ email: ctx.data.email }),
    { headers: { "Content-Type": "application/json" } }
  );
};
