import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync("./src/_data/site.json", "utf8"));

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });

  // Published posts, newest first (drafts hidden)
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("src/posts/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  // Gallery pieces, newest first
  eleventyConfig.addCollection("gallery", (api) =>
    api.getFilteredByGlob("src/gallery/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("cat", (slug) =>
    site.categories.find((c) => c.slug === slug) || site.categories[0]
  );
  eleventyConfig.addFilter("byCategory", (posts, slug) =>
    (posts || []).filter((p) => p.data.category === slug)
  );
  eleventyConfig.addFilter("excludeUrl", (posts, url) =>
    (posts || []).filter((p) => p.url !== url)
  );
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("readableDate", (d) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(new Date(d))
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("readingTime", (html) => {
    const words = String(html || "")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });
  eleventyConfig.addFilter("absUrl", (path) => new URL(path || "/", site.url).toString());

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
