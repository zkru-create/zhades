// GET /api/auth  — starts "Login with GitHub" for the /admin writing desk.
// Needs env vars GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET (Cloudflare Pages → Settings → Variables and secrets).

export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response("GITHUB_CLIENT_ID is not set in Cloudflare Pages settings.", { status: 500 });
  }
  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const gh = new URL("https://github.com/login/oauth/authorize");
  gh.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  gh.searchParams.set("redirect_uri", `${url.origin}/api/callback`);
  gh.searchParams.set("scope", url.searchParams.get("scope") || "repo,user");
  gh.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: gh.toString(),
      "Set-Cookie": `zh_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
