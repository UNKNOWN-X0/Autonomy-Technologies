/* "Recently added": a small notice, on any page, naming the course pages that went online in the last 14 days and
   that this browser has not dismissed yet. The hub (index.html) is the one list of pages: every chapter row and every
   exercise, tutorial and appendix link carries data-added, the day it went online. Loaded by js/settings.js, like
   hud.js, so pages need no extra tag. Dismissed pages are remembered in localStorage (whats-new-seen); nothing is sent
   anywhere. The notice never takes focus and never blocks the page; Escape, the close button or "Got it" dismiss it. */
(function () {
  var KEY = "whats-new-seen",
    DAYS = 14,
    MAX = window.matchMedia && window.matchMedia("(max-width: 600px)").matches ? 3 : 5, // fewer on a phone, where it covers more
    script = document.currentScript,
    base = script && script.src ? new URL("../", script.src) : null;
  if (!base || !window.fetch || !document.querySelector) return;
  var hubURL = new URL("index.html", base);

  function seen() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function remember(list) {
    try {
      // keep the list short: only what is still inside the window can ever be shown again
      localStorage.setItem(KEY, JSON.stringify(list.slice(-80)));
    } catch (e) {}
  }
  // Whole days between a "YYYY-MM-DD" date and today, in local time.
  function age(iso) {
    var p = iso.split("-").map(Number),
      then = new Date(p[0], p[1] - 1, p[2]),
      now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((now - then) / 86400000);
  }
  function when(days) {
    return days <= 0 ? "added today" : days === 1 ? "added yesterday" : "added " + days + " days ago";
  }

  // Every dated page on the hub: subject, kind, title, link and date.
  function read(doc) {
    var out = [];
    doc.querySelectorAll("li.subject").forEach(function (sub) {
      var code = ((sub.querySelector(".code") || {}).textContent || "").trim(),
        course = (sub.className.match(/\bs-[a-z]+-\d\b/) || [""])[0];
      sub.querySelectorAll("li.chapter[data-added]").forEach(function (li) {
        var a = li.querySelector(".go a[href], a[href]"),
          no = (li.querySelector(".no") || {}).textContent || "",
          title = (li.querySelector(".title") || {}).textContent || "";
        if (a) out.push({ code: code, course: course, kind: "Lecture", title: "Chapter " + no.trim() + ": " + title.trim(), href: a.getAttribute("href"), date: li.dataset.added });
      });
      sub.querySelectorAll("a[data-added]").forEach(function (a) {
        var li = a.closest("li[data-tab]");
        out.push({ code: code, course: course, kind: li ? li.dataset.tab : "Page", title: a.textContent.replace(/:.*/, "").trim(), href: a.getAttribute("href"), date: a.dataset.added });
      });
    });
    return out;
  }

  function show(items) {
    var had = seen(),
      fresh = items
        .filter(function (it) {
          var d = age(it.date);
          return d >= 0 && d < DAYS && had.indexOf(it.href) < 0;
        })
        .sort(function (x, y) {
          return x.date < y.date ? 1 : x.date > y.date ? -1 : 0;
        });
    if (!fresh.length || document.querySelector(".whats-new")) return;
    var box = document.createElement("aside"),
      head = document.createElement("div"),
      h = document.createElement("p"),
      x = document.createElement("button"),
      ul = document.createElement("ul"),
      foot = document.createElement("div"),
      all = document.createElement("a"),
      ok = document.createElement("button");
    box.className = "whats-new";
    box.setAttribute("aria-labelledby", "wn-h");
    head.className = "wn-head";
    h.className = "wn-h";
    h.id = "wn-h";
    h.textContent = "Recently added";
    x.type = "button";
    x.className = "wn-x";
    x.setAttribute("aria-label", "Dismiss recently added");
    x.innerHTML = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M4 4 16 16M16 4 4 16" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    head.appendChild(h);
    head.appendChild(x);
    box.appendChild(head);
    fresh.slice(0, MAX).forEach(function (it) {
      var li = document.createElement("li"),
        a = document.createElement("a"),
        code = document.createElement("span"),
        text = document.createElement("span"),
        t = document.createElement("span"),
        meta = document.createElement("span");
      a.href = new URL(it.href, hubURL).href;
      code.className = "wn-code " + it.course;
      code.textContent = it.code;
      t.className = "wn-title";
      t.textContent = it.title;
      meta.className = "wn-meta";
      meta.textContent = it.kind + " · " + when(age(it.date));
      text.className = "wn-text";
      text.appendChild(t);
      text.appendChild(meta);
      a.appendChild(code);
      a.appendChild(text);
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    foot.className = "wn-foot";
    all.href = new URL("about/version-log.html", base).href;
    all.textContent = fresh.length > MAX ? fresh.length - MAX + " more in the version log" : "Version log";
    ok.type = "button";
    ok.className = "btn primary";
    ok.textContent = "Got it";
    foot.appendChild(all);
    foot.appendChild(ok);
    box.appendChild(foot);

    // Dismissing (or opening one of the pages) marks every page shown as seen, so the notice comes back only for new ones.
    function dismiss() {
      remember(had.concat(fresh.map(function (it) { return it.href; })));
      box.classList.add("out");
      document.removeEventListener("keydown", esc);
      setTimeout(function () { box.remove(); }, window.siteReduceMotion && window.siteReduceMotion() ? 0 : 220);
    }
    function esc(e) {
      if (e.key === "Escape") dismiss();
    }
    x.addEventListener("click", dismiss);
    ok.addEventListener("click", dismiss);
    ul.addEventListener("click", function (e) {
      if (e.target.closest("a")) remember(had.concat(fresh.map(function (it) { return it.href; })));
    });
    document.addEventListener("keydown", esc);
    document.body.appendChild(box);
  }

  function start() {
    // Wait for the page's own entrance (page sweep, hub sweep) before speaking up.
    setTimeout(function () {
      // always the hub file itself: on the hub, js/index.js has already rebuilt the exercise links into rows
      fetch(hubURL)
        .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
        .then(function (html) { show(read(new DOMParser().parseFromString(html, "text/html"))); })
        .catch(function () {});
    }, 900);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
