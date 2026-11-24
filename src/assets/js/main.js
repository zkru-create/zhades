// Zhades — small helpers: filters, likes, sharing, contact notices
(function () {
  // ---------- Filters (home + gallery) ----------
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var scope = group.closest("main") || document;
    var items = scope.querySelectorAll("[data-filter-item]");
    var empty = scope.querySelector("[data-filter-empty]");
    group.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      var value = btn.getAttribute("data-filter");
      group.querySelectorAll("[data-filter]").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var shown = 0;
      items.forEach(function (it) {
        var match = value === "all" || it.getAttribute("data-value") === value;
        it.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });

  // ---------- Likes ----------
  var likeBtn = document.querySelector("[data-like]");
  if (likeBtn) {
    var slug = likeBtn.getAttribute("data-like");
    var countEl = likeBtn.querySelector("[data-like-count]");
    var labelEl = likeBtn.querySelector(".like-label");
    var key = "zhades-liked:" + slug;
    var liked = false;
    try { liked = localStorage.getItem(key) === "1"; } catch (e) {}

    function paint(count) {
      if (typeof count === "number") countEl.textContent = String(count);
      likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
      labelEl.textContent = liked ? "Liked" : "Like";
    }
    paint();

    fetch("/api/likes/" + encodeURIComponent(slug))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && typeof d.count === "number") paint(d.count); })
      .catch(function () {});

    var busy = false;
    likeBtn.addEventListener("click", function () {
      if (busy) return;
      busy = true;
      liked = !liked;
      var current = parseInt(countEl.textContent, 10) || 0;
      paint(Math.max(0, current + (liked ? 1 : -1)));
      if (liked) { likeBtn.classList.remove("pop"); void likeBtn.offsetWidth; likeBtn.classList.add("pop"); }
      try { liked ? localStorage.setItem(key, "1") : localStorage.removeItem(key); } catch (e) {}
      fetch("/api/likes/" + encodeURIComponent(slug), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: liked ? "like" : "unlike" })
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && typeof d.count === "number") paint(d.count); })
        .catch(function () {})
        .finally(function () { busy = false; });
    });
  }

  // ---------- Share ----------
  var share = document.querySelector("[data-share]");
  if (share) {
    var url = share.getAttribute("data-url") || location.href;
    var title = share.getAttribute("data-title") || document.title;
    var text = title + " — on Zhades";
    var wa = share.querySelector("[data-share-whatsapp]");
    var x = share.querySelector("[data-share-x]");
    var native = share.querySelector("[data-share-native]");
    var copy = share.querySelector("[data-share-copy]");
    if (wa) wa.href = "https://wa.me/?text=" + encodeURIComponent(text + " " + url);
    if (x) x.href = "https://x.com/intent/post?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url);
    if (native && navigator.share) {
      native.hidden = false;
      native.addEventListener("click", function () {
        navigator.share({ title: title, text: text, url: url }).catch(function () {});
      });
    }
    if (copy) {
      copy.addEventListener("click", function () {
        var done = function () {
          copy.textContent = "Copied ✦";
          setTimeout(function () { copy.textContent = "Copy link"; }, 1800);
        };
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(done).catch(function () { prompt("Copy this link:", url); });
        } else {
          prompt("Copy this link:", url);
        }
      });
    }
  }

  // ---------- Contact notices ----------
  var params = new URLSearchParams(location.search);
  if (params.get("sent") === "1") {
    var ok = document.querySelector("[data-contact-sent]");
    if (ok) ok.hidden = false;
  }
  if (params.get("error") === "1") {
    var err = document.querySelector("[data-contact-error]");
    if (err) err.hidden = false;
  }
})();
