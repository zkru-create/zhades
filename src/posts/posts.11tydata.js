export default {
  layout: "layouts/post.njk",
  tags: [],
  eleventyComputed: {
    // Drafts are not published at all
    permalink: (data) => (data.draft ? false : `/posts/${data.page.fileSlug}/`),
  },
};
