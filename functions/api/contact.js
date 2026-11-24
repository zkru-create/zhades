// POST /api/contact  (form on /contact/)
// Saves each message in KV (ZHADES_KV) under keys starting with "msg:".
// Read them in Cloudflare → Workers & Pages → KV → your namespace.

export async function onRequestPost({ request, env }) {
  const back = (q) => Response.redirect(new URL(`/contact/?${q}`, request.url).toString(), 303);

  let form;
  try {
    form = await request.formData();
  } catch (_) {
    return back("error=1");
  }

  // Honeypot: real people never fill this hidden field
  if ((form.get("website") || "").toString().trim()) return back("sent=1");

  const clean = (v, max) => (v || "").toString().trim().slice(0, max);
  const name = clean(form.get("name"), 100);
  const email = clean(form.get("email"), 200);
  const topic = clean(form.get("topic"), 60);
  const message = clean(form.get("message"), 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return back("error=1");
  if (!env.ZHADES_KV) return back("error=1");

  const id = `msg:${new Date().toISOString()}:${crypto.randomUUID().slice(0, 8)}`;
  await env.ZHADES_KV.put(
    id,
    JSON.stringify({ name, email, topic, message, at: new Date().toISOString() })
  );
  return back("sent=1");
}
