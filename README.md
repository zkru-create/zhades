# Zhades ✦

*style, stories & a splash of play.* Z's blog, built as a free static site on Cloudflare Pages.

- **Readers** see the blog, can like posts and share them. No sign-in needed.
- **Z** writes and publishes from **/admin** (the writing desk). Log in with GitHub, write, add photos and press Publish. The site rebuilds itself in about a minute.

---

## 1. Put it on GitHub

1. Create a new **empty** repo on GitHub called `zhades`. It can be private.
2. Upload everything in this folder to it. On github.com, use **Add file → Upload files**, drag the whole folder contents in, then **Commit**.
   - Don't upload `node_modules` or `_site` if they exist.
3. Open `src/admin/config.yml` and change `YOUR-GITHUB-USERNAME` to your GitHub username. Commit.

## 2. Connect Cloudflare Pages

1. Go to Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**, then pick the `zhades` repo.
2. Build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `_site`
3. **Save and Deploy.** The site will be live at `https://zhades.pages.dev`, or whatever name Cloudflare gives it.
   - If the address is different, update `url` in `src/_data/site.json` and `base_url` and `site_url` in `src/admin/config.yml`.

## 3. Turn on likes and the contact form (KV storage)

1. Go to Cloudflare → **Storage & Databases → KV → Create namespace** and name it `zhades`.
2. Open your Pages project → **Settings → Bindings → Add → KV namespace**.
   - Variable name: `ZHADES_KV`. Namespace: `zhades`.
3. Redeploy: **Deployments → … → Retry deployment**.

Contact messages are saved in that namespace with keys that start with `msg:`. Open the namespace in Cloudflare to read them.

## 4. Turn on the writing desk login (/admin)

1. Go to GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Application name: `Zhades writing desk`
   - Homepage URL: `https://zhades.pages.dev`
   - Authorization callback URL: `https://zhades.pages.dev/api/callback`
2. Create it, then click **Generate a new client secret**.
3. In your Cloudflare Pages project, go to **Settings → Variables and secrets** and add:
   - `GITHUB_CLIENT_ID`: the Client ID
   - `GITHUB_CLIENT_SECRET`: the secret (choose type **Secret**)
4. Redeploy. Then open `https://zhades.pages.dev/admin/` and click **Login with GitHub**.

Only GitHub accounts with write access to the repo can publish, so only you (or whoever you add) can post.

## Writing a post

1. Go to `/admin/` → **Posts → New Post**.
2. Fill in the title, date, category, short intro and cover image, then write the story. You can drag photos straight into the story.
3. Leave **Draft** off and press **Publish → Publish now**. The post goes live in about a minute.
4. Gallery pieces go under **Gallery → New Art piece**.

## Your own domain (later)

Open the Pages project → **Custom domains → Set up a domain**. Then change the URLs in `src/_data/site.json`, `src/admin/config.yml` and the GitHub OAuth app to the new domain.

## Social links

Add your profile links in `src/_data/site.json` under `social`. Empty links stay hidden.

## What's where

| Path | What it is |
| --- | --- |
| `src/posts/` | Blog posts (Markdown). The writing desk saves here. |
| `src/gallery/` | Art pieces for the gallery page |
| `src/assets/uploads/` | Photos you upload |
| `src/_data/site.json` | Name, tagline, bio, categories, social links |
| `src/assets/css/style.css` | The Midnight Lime theme |
| `functions/api/` | Likes, contact form and GitHub login (Cloudflare Functions) |
| `src/admin/` | The writing desk |

