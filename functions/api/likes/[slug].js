// GET  /api/likes/:slug          -> { count }
// POST /api/likes/:slug {action}  -> { count }   action = "like" | "unlike"
// Needs a KV namespace bound as ZHADES_KV (Cloudflare Pages → Settings → Bindings).

const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function readCount(env, slug) {
  const raw = await env.ZHADES_KV.get(`like:${slug}`);
  const n = parseInt(raw || "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function onRequestGet({ params, env }) {
  const slug = String(params.slug || "");
  if (!SLUG.test(slug)) return json({ error: "Bad post id" }, 400);
  if (!env.ZHADES_KV) return json({ count: 0, note: "KV not bound yet" });
  return json({ count: await readCount(env, slug) });
}

export async function onRequestPost({ params, env, request }) {
  const slug = String(params.slug || "");
  if (!SLUG.test(slug)) return json({ error: "Bad post id" }, 400);
  if (!env.ZHADES_KV) return json({ error: "KV not bound yet" }, 503);

  let action = "like";
  try {
    const body = await request.json();
    if (body && body.action === "unlike") action = "unlike";
  } catch (_) {
    /* default to like */
  }

  const current = await readCount(env, slug);
  const next = action === "unlike" ? Math.max(0, current - 1) : current + 1;
  await env.ZHADES_KV.put(`like:${slug}`, String(next));
  return json({ count: next });
}
