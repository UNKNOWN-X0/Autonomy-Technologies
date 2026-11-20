/* Site-wide prefix search for authored study material. */
(function (root) {
  function words(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) || [];
  }
  function prefixMatch(query, text) {
    var q = words(query), t = words(text);
    return q.length > 0 && q.every(function (part) { return t.some(function (word) { return word.indexOf(part) === 0; }); });
  }
  function search(index, query, currentCourse) {
    if (!Array.isArray(index) || !Array.isArray(index[1]) || !Array.isArray(index[2])) return [];
    return index[2]
      .map(function (entry, order) {
        var section = index[1][entry[0]], title = entry[2], kind = entry[1];
        if (!section || !prefixMatch(query, title + " " + entry[3] + " " + section[3])) return null;
        var kindRank = { d: 0, s: 1, e: 2, f: 3, p: 4, x: 4, q: 4 }[kind];
        return { entry: entry, section: section, titleRank: prefixMatch(query, title) ? 0 : 1, kindRank: kindRank == null ? 5 : kindRank, courseRank: section[2] === currentCourse ? 0 : 1, order: order };
      })
      .filter(Boolean)
      .sort(function (a, b) { return a.titleRank - b.titleRank || a.kindRank - b.kindRank || a.courseRank - b.courseRank || a.order - b.order; });
  }
  if (typeof module === "object" && module.exports) module.exports = { words: words, prefixMatch: prefixMatch, search: search };
  if (!root.document) return;

  var doc = root.document,
    index = null,
    loading = null,
    dlg = doc.createElement("dialog"),
    input = doc.createElement("input"),
    list = doc.createElement("div"),
    status = doc.createElement("p"),
    active = -1;

  function icon() {
    var svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg"),
      circle = doc.createElementNS("http://www.w3.org/2000/svg", "circle"),
      line = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
    svg.setAttribute("aria-hidden", "true");
    circle.setAttribute("cx", "10.5"); circle.setAttribute("cy", "10.5"); circle.setAttribute("r", "6.5");
    line.setAttribute("d", "m15.5 15.5 5 5");
    [circle, line].forEach(function (el) { el.setAttribute("fill", "none"); el.setAttribute("stroke", "currentColor"); el.setAttribute("stroke-width", "2"); });
    svg.appendChild(circle); svg.appendChild(line);
    return svg;
  }
  function open() {
    if (!dlg.open && dlg.showModal) dlg.showModal();
    load();
    input.focus();
  }
  function load() {
    if (index) { render(); return; }
    if (loading) return;
    var script = doc.currentScript || doc.querySelector('script[src$="search.js"]'),
      url = new URL("../assets/search.json", script ? script.src : location.href);
    loading = root.fetch(url).then(function (response) {
      if (!response.ok) throw new Error("search index unavailable");
      return response.json();
    }).then(function (data) { index = data; render(); }).catch(function () { status.textContent = "Search index could not be loaded."; }).finally(function () { loading = null; });
  }
  function render() {
    list.textContent = "";
    active = -1;
    var q = input.value.trim();
    if (!q) { status.textContent = "Search guides, definitions, examples and exercises."; return; }
    var cls = (doc.body.className.match(/\bs-([a-z]+)-\d/) || [])[1] || "",
      results = search(index, q, cls.toUpperCase()).slice(0, 30),
      previous = "";
    status.textContent = results.length ? results.length + (results.length === 30 ? "+" : "") + " results" : "No results";
    results.forEach(function (result, i) {
      var section = result.section,
        entry = result.entry,
        group = doc.createElement("div"),
        a = doc.createElement("a"),
        kind = doc.createElement("span"),
        snippet = doc.createElement("span");
      if (section[2] !== previous) {
        var heading = doc.createElement("h3");
        heading.className = "search-course";
        heading.textContent = section[2];
        list.appendChild(heading);
        previous = section[2];
      }
      group.className = "search-result";
      a.href = new URL(index[0][section[0]] + "#" + section[1], new URL("../", (doc.querySelector('script[src$="search.js"]') || {}).src || location.href)).href;
      a.dataset.result = String(i);
      a.textContent = entry[2];
      snippet.className = "search-snippet";
      snippet.textContent = (entry[3] || section[3]).slice(0, 170) + ((entry[3] || section[3]).length > 170 ? "…" : "");
      kind.className = "search-kind";
      kind.textContent = { d: "definition", s: "section", e: "example", f: "formula", p: "practice problem", x: "exam problem", q: "exercise problem" }[entry[1]];
      group.appendChild(a); group.appendChild(kind); group.appendChild(snippet); list.appendChild(group);
    });
  }
  function buttons() {
    function createButton() {
      var button = doc.createElement("button"), label = "Search study material";
      button.type = "button";
      button.className = "settings-btn search-open";
      button.setAttribute("aria-label", label);
      button.dataset.tip = label + " (/)";
      button.appendChild(icon());
      button.addEventListener("click", open);
      return button;
    }
    var nav = doc.querySelector("nav.toc"),
      tools = doc.querySelector(".field-tools");
    if (nav) {
      var row = nav.querySelector(".home-row");
      if (row) row.appendChild(createButton());
      else nav.insertBefore(createButton(), nav.querySelector("ol"));
    }
    if (tools) tools.insertBefore(createButton(), tools.lastChild);
  }
  function init() {
    if (!root.HTMLDialogElement) return;
    dlg.className = "settings site-search";
    dlg.setAttribute("aria-labelledby", "site-search-title");
    var form = doc.createElement("form"), head = doc.createElement("div"), title = doc.createElement("h2"), close = doc.createElement("button"), label = doc.createElement("label");
    form.method = "dialog";
    head.className = "settings-head";
    title.id = "site-search-title"; title.textContent = "Search study material";
    close.type = "submit"; close.className = "settings-x"; close.setAttribute("aria-label", "Close search"); close.textContent = "×";
    head.appendChild(title); head.appendChild(close);
    label.className = "search-label"; label.appendChild(doc.createTextNode("Words or topic"));
    input.type = "search"; input.autocomplete = "off"; input.setAttribute("aria-controls", "search-results"); label.appendChild(input);
    status.className = "settings-now search-status"; status.setAttribute("aria-live", "polite");
    list.id = "search-results"; list.className = "search-results";
    form.appendChild(head); form.appendChild(label); form.appendChild(status); form.appendChild(list); dlg.appendChild(form); doc.body.appendChild(dlg);
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = list.querySelector("a[data-result]");
        if (first) { e.preventDefault(); first.click(); }
      }
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      var results = list.querySelectorAll("a[data-result]");
      if (!results.length) return;
      e.preventDefault();
      active = e.key === "ArrowDown" ? Math.min(active + 1, results.length - 1) : Math.max(active - 1, 0);
      results[active].focus();
    });
    buttons();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  doc.addEventListener("keydown", function (e) {
    if ((e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
      var target = e.target;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      e.preventDefault(); open();
    }
  });
  function highlightHash() {
    if (location.hash) {
      var target = doc.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        target.classList.add("search-hit");
        root.setTimeout(function () { target.classList.remove("search-hit"); }, 2200);
      }
    }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", highlightHash, { once: true }); else highlightHash();
})(typeof window !== "undefined" ? window : globalThis);
