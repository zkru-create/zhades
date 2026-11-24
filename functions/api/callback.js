// GET /api/callback — GitHub sends the user back here; we swap the code for a token
// and hand it to the /admin window (Decap CMS) that opened the login popup.

function page(status, payload, origin) {
  const msg = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const safeMsg = JSON.stringify(msg).replace(/</g, "\\u003c");
  const safeOrigin = JSON.stringify(origin).replace(/</g, "\\u003c");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Signing in…</title></head>
<body style="font-family:system-ui;background:#111;color:#fff;padding:24px">
<p>${status === "success" ? "Signed in. You can close this window." : "Sign-in failed. Close this window and try again."}</p>
<script>
(function () {
  var origin = ${safeOrigin};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(${safeMsg}, origin);
    window.removeEventListener("message", receive, false);
  }
  window.addEventListener("message", receive, false);
  if (window.opener) window.opener.postMessage("authorizing:github", origin);
})();
</script></body></html>`;
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Set-Cookie": "zh_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    },
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("Cookie") || "";
  const saved = (cookie.match(/(?:^|;\s*)zh_oauth_state=([^;]+)/) || [])[1];

  if (!code || !state || !saved || state !== saved) {
    return page("error", { error: "Login check failed. Please try again." }, origin);
  }

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", "user-agent": "zhades-cms" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/callback`,
    }),
  });
  const data = await res.json().catch(() => ({}));

  if (!data.access_token) {
    return page("error", { error: data.error_description || "GitHub did not return a token." }, origin);
  }
  return page("success", { token: data.access_token, provider: "github" }, origin);
}
