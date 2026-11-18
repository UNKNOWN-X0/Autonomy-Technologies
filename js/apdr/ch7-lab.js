/* APDR Chapter 7 lab: predict what a program prints, then step through it the way Python runs it.
   One drawing for every experiment: the listing with the running line, the frames with their names, the lists and
   tuples those names point at (arrows for references, a marker for a for loop's hidden index), and the output. */
(function () {
  var P = window.APDR7, observer;

  // ---------- drawing ----------
  function colours(el) {
    var s = getComputedStyle(el), g = function (k) { return s.getPropertyValue(k).trim(); };
    return { paper: g("--paper"), panel: g("--paper-2"), ink: g("--ink"), muted: g("--muted"), line: g("--line"), fau: g("--fau-mark"), act: g("--act") || g("--fau-mark"), font: g("--f-display") || "sans-serif", mono: g("--f-mono") || "monospace" };
  }
  function paint(canvas, state) {
    if (canvas._paint) cancelAnimationFrame(canvas._paint);
    canvas._paint = requestAnimationFrame(function () {
      canvas._paint = 0;
      var r = canvas.parentElement.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var d = Math.min(devicePixelRatio || 1, 2), ctx = canvas.getContext("2d"), c = colours(canvas.parentElement);
      canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, r.width, r.height);
      ctx.textBaseline = "middle"; ctx.lineJoin = "round"; ctx.lineCap = "round";
      draw(ctx, r.width, r.height - 26, c, state); // the stage note sits in the bottom band
    });
  }
  function text(ctx, t, x, y, c, o) {
    o = o || {};
    ctx.fillStyle = o.color || c.ink;
    ctx.font = (o.weight || 600) + " " + (o.size || 14) + "px " + (o.mono ? c.mono : c.font);
    ctx.textAlign = o.align || "left";
    ctx.fillText(String(t), x, y);
  }
  function fitSize(ctx, t, w, c, mono, max, min) {
    var size = max || 15;
    for (; size > (min || 8); size--) { ctx.font = "600 " + size + "px " + (mono ? c.mono : c.font); if (ctx.measureText(t).width <= w) break; }
    return size;
  }
  function clip(ctx, t, w, c, size) {
    ctx.font = "600 " + size + "px " + c.mono;
    if (ctx.measureText(t).width <= w) return t;
    while (t.length > 1 && ctx.measureText(t + "…").width > w) t = t.slice(0, -1);
    return t + "…";
  }
  function shown(s, n) { return s.done ? n : s.revealing ? Math.min(n, Math.floor(s.progress * n + 0.0001)) : 0; }

  // the guess and the result, at the foot of the drawing; returns the height it used
  function foot(ctx, w, h, c, s) {
    var y = h - 8, used = 0;
    if (s.done && s.resultLabel) { var t = "Result: " + s.resultLabel; text(ctx, t, 14, y, c, { size: fitSize(ctx, t, w - 28, c, false, 14), color: c.fau }); y -= 22; used += 22; }
    if (s.guess) { var g = "Your prediction: " + s.guess; text(ctx, g, 14, y, c, { size: fitSize(ctx, g, w - 28, c, false, 14), color: c.muted }); used += 22; }
    return used;
  }
  function arrow(ctx, x1, y1, x2, y2, c) {
    ctx.strokeStyle = c.fau; ctx.fillStyle = c.fau; ctx.lineWidth = 1.6;
    var bend = Math.max(24, Math.abs(x2 - x1) * 0.4);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo(x1 + bend, y1, x2 - bend, y2, x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 8, y2 - 4); ctx.lineTo(x2 - 8, y2 + 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x1, y1, 3.2, 0, 7); ctx.fill();
  }

  function draw(ctx, w, h, c, s) {
    var code = s.code || [], steps = s.steps || [], n = steps.length, k = shown(s, n) - 1, st = k >= 0 ? steps[k] : null;
    var footH = (s.guess ? 22 : 0) + (s.done && s.resultLabel ? 22 : 0) + 6;
    var wide = w >= 600, codeW = wide ? Math.round(w * 0.47) : w - 20;
    var maxLen = Math.max.apply(null, code.map(function (l) { return l.length; }).concat([12]));
    var size = Math.max(9, Math.min(14, (codeW - 40) / (maxLen * 0.62)));
    var outs = st ? st.out.slice() : [], err = st && st.error ? st.error : "";
    var outLines = Math.min(4, outs.length + (err ? 1 : 0)), outH = 24 + Math.max(1, outLines) * 18;
    // the frames and objects need the same room for the whole run, so the layout does not jump during a reveal
    var memNeed = 60;
    steps.forEach(function (sp) {
      var rows = sp.frames.reduce(function (a, f) { return a + 34 + f.vars.length * 20; }, 0), objs = sp.heap.length * 62 + (sp.iters.length ? 14 : 0);
      memNeed = Math.max(memNeed, 30 + Math.max(rows, objs));
    });
    var codeRoom = wide ? h - footH - outH - 24 : Math.max(code.length * 13, h - footH - outH - memNeed - 20);
    var lh = Math.min(size + 7, codeRoom / Math.max(code.length, 1));
    size = Math.min(size, lh - 3);
    // the listing, with the running line
    for (var i = 0; i < code.length; i++) {
      var y = 14 + i * lh + lh / 2, now = st && st.line === i;
      if (now) { ctx.fillStyle = c.panel; ctx.fillRect(10, y - lh / 2, codeW, lh); ctx.fillStyle = st.error ? c.act : c.fau; ctx.fillRect(10, y - lh / 2, 3, lh); }
      text(ctx, String(i + 1), 30, y, c, { size: Math.max(8, size - 2), mono: true, color: c.muted, align: "right" });
      text(ctx, clip(ctx, code[i], codeW - 44, c, size), 38, y, c, { size: size, mono: true, weight: now ? 700 : 500, color: now ? c.ink : c.muted });
    }
    var codeBottom = 14 + code.length * lh;
    // output: under the listing when wide, at the bottom when narrow
    var ox = 14, oy = wide ? codeBottom + 14 : h - footH - outH + 6, ow = wide ? codeW - 8 : w - 28;
    text(ctx, "Output", ox, oy + 6, c, { size: 12, color: c.muted });
    var lines = outs.slice(-(err ? 3 : 4)), osize = Math.min.apply(null, lines.map(function (o) { return fitSize(ctx, o, ow, c, true, 13); }).concat([13]));
    lines.forEach(function (o, j) { text(ctx, o, ox, oy + 26 + j * 18, c, { size: osize, mono: true, color: c.fau }); });
    if (err) text(ctx, err, ox, oy + 26 + lines.length * 18, c, { size: fitSize(ctx, err, ow, c, true, 13), mono: true, color: c.act });
    // frames and objects
    var mx = wide ? codeW + 22 : 10, my = wide ? 14 : codeBottom + 12, mw = wide ? w - codeW - 32 : w - 20, mh = wide ? h - footH - 14 : oy - my - 8;
    if (st) memory(ctx, mx, my, mw, mh, c, st);
    else text(ctx, "Frames and objects appear as the program runs", mx, my + 10, c, { size: fitSize(ctx, "Frames and objects appear as the program runs", mw, c, false, 12), color: c.muted });
    foot(ctx, w, h, c, s);
  }

  function memory(ctx, x, y, w, h, c, st) {
    var fw = Math.min(170, Math.max(104, w * 0.34)), rh = 20, anchors = [], pos = {};
    text(ctx, "Frames", x, y + 6, c, { size: 12, color: c.muted });
    text(ctx, "Objects", x + fw + 18, y + 6, c, { size: 12, color: c.muted });
    // frames
    var fy = y + 22;
    // functions made by def are left out of the main program's frame to save room; a function passed in still shows
    var frames = st.frames.map(function (f, fi) { return fi ? f : { name: f.name, vars: f.vars.filter(function (v) { return !(v[1].p && v[1].p.indexOf("function ") === 0); }) }; });
    frames.forEach(function (f, fi) {
      var top = fy, last = fi === frames.length - 1;
      ctx.fillStyle = last ? c.panel : c.paper; ctx.fillRect(x, top, fw, 22 + f.vars.length * rh + 4);
      ctx.strokeStyle = last ? c.fau : c.line; ctx.lineWidth = last ? 2 : 1.2; ctx.strokeRect(x + 0.5, top + 0.5, fw - 1, 22 + f.vars.length * rh + 3);
      text(ctx, f.name === "Global frame" ? "main program" : "call " + f.name, x + 8, top + 12, c, { size: 11, weight: 700, color: last ? c.ink : c.muted });
      ctx.font = "600 12px " + c.mono;
      var longest = Math.max.apply(null, f.vars.map(function (v) { return ctx.measureText(v[0]).width; }).concat([20]));
      var vx = x + Math.min(fw * 0.6, longest + 22);
      f.vars.forEach(function (v, j) {
        var yy = top + 22 + j * rh + rh / 2, label = v[0], val = v[1];
        var nameSize = fitSize(ctx, label, vx - x - 16, c, true, 12, 8);
        text(ctx, label, vx - 8, yy, c, { size: nameSize, mono: true, color: label === "Return value" ? c.fau : c.muted, align: "right" });
        if (val.r != null) anchors.push({ x: vx + 6, y: yy, to: val.r });
        else text(ctx, clip(ctx, val.p, fw - (vx - x) - 6, c, 12), vx, yy, c, { size: 12, mono: true, weight: 700 });
      });
      fy = top + 22 + f.vars.length * rh + 12;
    });
    // objects, one row of boxes each
    var hx = x + fw + 26, hw = w - fw - 28, hy = y + 22, ch = 26;
    st.heap.forEach(function (o) {
      var texts = o.items.map(function (v) { return v.r != null ? "" : v.p; }), fs = 12, cws;
      var widths = function (sz) { ctx.font = "600 " + sz + "px " + c.mono; return texts.map(function (t) { return Math.max(22, Math.min(80, ctx.measureText(t).width + (sz > 10 ? 12 : 7))); }); };
      cws = widths(fs);
      while (fs > 7 && cws.reduce(function (a, b) { return a + b; }, 0) > hw - 4) { fs--; cws = widths(fs); }
      var total = cws.reduce(function (a, b) { return a + b; }, 0), scale = total > hw - 4 ? (hw - 4) / total : 1;
      cws = cws.map(function (cw) { return cw * scale; });
      text(ctx, o.t + (o.items.length ? "" : " (empty)"), hx, hy + 6, c, { size: 10, color: c.muted });
      var cx = hx, by = hy + 14;
      pos[o.id] = { x: hx, y: by + ch / 2, cells: [] };
      if (!o.items.length) { ctx.strokeStyle = c.line; ctx.lineWidth = 1.2; ctx.strokeRect(hx + 0.5, by + 0.5, 30, ch - 1); }
      o.items.forEach(function (v, j) {
        var cw = cws[j];
        ctx.fillStyle = o.t === "tuple" ? c.panel : c.paper; ctx.fillRect(cx, by, cw, ch);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 1.2; ctx.strokeRect(cx + 0.5, by + 0.5, cw - 1, ch - 1);
        text(ctx, String(j), cx + 2, by + 6, c, { size: 7, color: c.muted });
        if (v.r != null) anchors.push({ x: cx + cw / 2, y: by + ch / 2 + 2, to: v.r });
        else text(ctx, clip(ctx, v.p, cw - 6, c, fs), cx + cw / 2, by + ch / 2 + 2, c, { size: fs, mono: true, align: "center" });
        pos[o.id].cells.push({ x: cx, w: cw });
        cx += cw;
      });
      hy = by + ch + 22;
    });
    // a for loop's hidden index, under the list it walks
    st.iters.forEach(function (it) {
      var p = pos[it.r]; if (!p) return;
      var ended = st.note === "loop ends", at = ended ? it.idx : it.idx - 1, cell = p.cells[at], tx = cell ? cell.x + cell.w / 2 : (p.cells.length ? p.cells[p.cells.length - 1].x + p.cells[p.cells.length - 1].w + 12 : p.x + 12), ty = p.y + 15;
      ctx.fillStyle = c.act; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 5, ty + 7); ctx.lineTo(tx + 5, ty + 7); ctx.closePath(); ctx.fill();
      text(ctx, ended ? "loop index " + at + ": past the end" : "loop index " + at, tx + 8, ty + 6, c, { size: 10, color: c.act });
    });
    anchors.forEach(function (a) { var p = pos[a.to]; if (p) arrow(ctx, a.x, a.y, p.x - 2, p.y, c); });
  }

  // ---------- challenges ----------
  function rnd(n) { return Math.floor(Math.random() * n); }
  function mix(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // the right option plus up to two distinct wrong ones; null when they collide, so the generator re-draws
  function three(right, wrongs) {
    var opts = [[right, right]], seen = {};
    seen[right] = 1;
    wrongs.forEach(function (o) { if (opts.length < 3 && o && !seen[o]) { seen[o] = 1; opts.push([o, o]); } });
    return opts.length >= 2 ? mix(opts) : null;
  }
  function said(code) { return P.outcome(P.run(code)); }
  function make(show, state, spec) {
    var label = function (key) { var o = spec.options.filter(function (x) { return x[0] === key; })[0]; return o ? o[1] : key; };
    return {
      id: spec.id, short: spec.short, ref: spec.ref, prompt: spec.prompt, options: spec.options, answer: spec.answer, why: spec.why,
      stage: function () {
        Object.keys(state).forEach(function (k) { delete state[k]; });
        var r = P.run(spec.code);
        Object.assign(state, { code: r.code, steps: r.steps, challenge: true, progress: 0, revealing: false, done: false, guess: "", resultLabel: label(spec.answer) });
        show();
      },
      preview: function (key) { state.guess = label(key); show(); },
      reveal: function () {
        state.revealing = true;
        var n = state.steps.length;
        return Lab.tween(Math.max(1600, Math.min(4200, n * 170)), function (t) { state.progress = t; show(); }).then(function () { state.revealing = false; state.done = true; state.progress = 1; show(); });
      },
    };
  }
  function mount(id, title, specs, gen, sandbox) {
    var section = document.querySelector('[data-experiment="' + id + '"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"), msg = form.querySelector("[data-own-msg]");
    var state = {}, show = function () { paint(canvas, state); };
    var live = function () {
      if (state.challenge) return;
      Object.keys(state).forEach(function (k) { delete state[k]; });
      try {
        var code = sandbox(form), r = P.run(code);
        Object.assign(state, { code: r.code, steps: r.steps, done: true, progress: 1, resultLabel: r.error ? r.error : (r.output.length ? "prints " + r.output.join(" | ") : "prints nothing") });
        if (msg) msg.textContent = r.error && r.steps.length <= 1 ? r.error : "";
      } catch (e) { state.code = []; state.steps = []; state.done = true; state.resultLabel = e.message; if (msg) msg.textContent = e.message; }
      show();
    };
    Lab.experiment({
      id: id, title: title, card: section.querySelector(".challenge"),
      generate: gen ? function () { return make(show, state, gen()); } : null,
      lock: function (on) { form.querySelectorAll("input,select,textarea,button").forEach(function (el) { el.disabled = on; }); section.querySelector(".stage").classList.toggle("locked", on); },
      setup: function (c) { c.stage(); },
      sandbox: function () { state.challenge = false; live(); },
      challenges: specs.map(function (s) { return make(show, state, s); }),
    });
    form.addEventListener("input", live); form.addEventListener("change", live);
    if (typeof ResizeObserver !== "undefined") {
      observer = observer || new ResizeObserver(function (es) { es.forEach(function (e) { var cv = e.target.querySelector("canvas"); if (cv && cv._show) cv._show(); }); });
      canvas._show = show; observer.observe(canvas.parentElement);
    }
  }
  function field(form, name) { var el = form.querySelector('[data-f="' + name + '"]'); return el ? el.value : ""; }
  function intField(form, name, label, lo, hi) {
    var v = field(form, name).trim().replace("−", "-");
    if (!/^-?\d+$/.test(v)) throw Error(label + " must be a whole number.");
    var n = parseInt(v, 10);
    if (n < lo || n > hi) throw Error(label + " must be between " + lo + " and " + hi + ".");
    return n;
  }
  function listField(form, name, label) {
    var v = field(form, name).trim();
    if (!v) return [];
    var parts = v.split(",").map(function (x) { return x.trim().replace("−", "-"); });
    parts.forEach(function (x) { if (!/^-?\d+$/.test(x) || Math.abs(+x) > 999) throw Error(label + ": type whole numbers up to 999, separated by commas, such as 1, 2, 3."); });
    if (parts.length > 8) throw Error(label + ": keep it to 8 numbers so every box fits.");
    return parts.map(Number);
  }
  function program(form) {
    var lines = field(form, "code").replace(/\r/g, "").split("\n");
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    if (!lines.length) throw Error("Type a short program, one statement per line.");
    if (lines.length > 16) throw Error("Keep the program to 16 lines so the listing fits on the stage.");
    if (lines.some(function (l) { return l.length > 60; })) throw Error("Keep each line to 60 characters so it fits on the stage.");
    return lines;
  }

  // ---------- 7.3 return and print, 7.5 functions as arguments ----------
  var G = P.PROGRAMS;
  function genReturn() {
    for (;;) {
      var a = 2 + rnd(8), b = 2 + rnd(8), kinds = ["ret", "prt", "dead", "both"], kind = kinds[rnd(4)];
      if (a === b || a * b === a || a * b === b) continue;
      var code = G.retPrint(kind, a, b), right = said(code);
      var opts = three(right, mix(kinds.filter(function (x) { return x !== kind; })).map(function (x) { return said(G.retPrint(x, a, b)); }));
      if (!opts) continue;
      var why = {
        ret: "f returns " + a * b + " without printing anything, so r is " + a * b + " and print(r) shows it once.",
        prt: "f prints " + a * b + " itself but has no return, so r is None and print(r) shows None.",
        dead: "return a ends the call at once: print(b) never runs. r is " + a + ".",
        both: "f prints " + a + " first, then returns " + b + ", so r is " + b + " and print(r) shows it.",
      }[kind];
      return { id: "gen-return", short: "return or print", ref: "7.3", prompt: "What does this program print? (Lines are separated by |.)", options: opts, answer: right, why: why, code: code };
    }
  }

  // ---------- 7.4 scope ----------
  function genScope() {
    for (;;) {
      var x = 1 + rnd(9), d = 1 + rnd(4), kk = 1 + rnd(9), v = rnd(4), code, right, wrongs, why;
      if (v === 0) { code = G.scopeParam(x, d); right = x + " " + (x + d); wrongs = [(x + d) + " " + (x + d), x + " " + x]; why = "The parameter x is a name in f’s own frame. Rebinding it to " + (x + d) + " leaves the main program’s x at " + x + "; z gets the returned " + (x + d) + "."; }
      else if (v === 1) { if (kk + d === x) continue; code = G.scopeF(x, kk, d); right = (kk + d) + " | " + x; wrongs = [(kk + d) + " | " + (kk + d), (x + d) + " | " + x]; why = "f assigns x, so its x is local: it prints " + (kk + d) + ". The main program’s x is a different name and is still " + x + "."; }
      else if (v === 2) { code = G.scopeG(x, d); right = x + " | " + (x + d) + " | " + x; wrongs = ["NameError", x + " | " + (x + d) + " | " + (x + d)]; why = "g only reads x, so Python looks it up in the main program: " + x + " and " + (x + d) + ". Reading never changes it, so the last line prints " + x + "."; }
      else { code = G.scopeH(x, d); right = "UnboundLocalError"; wrongs = [String(x + d), String(x)]; why = "x += " + d + " assigns x, so x is local in h for the whole function, and the local x has no value when += reads it: UnboundLocalError."; }
      var prompt = v === 0 ? "What does the last line, print(x, z), show?" : "What does this program print? (Lines are separated by |.)";
      var opts = three(right, wrongs);
      if (!opts) continue;
      if (v !== 0 && said(code) !== right) continue; // the stage and the answer always agree
      return { id: "gen-scope", short: "Which x?", ref: "7.4", prompt: prompt, options: opts, answer: right, why: why, code: code };
    }
  }

  // ---------- 7.6 tuples ----------
  function genTuple() {
    for (;;) {
      if (rnd(2)) {
        var a = 5 + rnd(36), b = 2 + rnd(8);
        if (a % b === 0) continue;
        var q = Math.floor(a / b), r = a % b, code = G.quotRem(a, b), right = q + " " + r;
        var fl = String(Math.round((a / b) * 1e6) / 1e6) + " " + r;
        var opts = three(right, [r + " " + q, fl]);
        if (!opts || said(code) !== right) continue;
        return { id: "gen-tuple", short: "Unpack a returned tuple", ref: "7.6", prompt: "What does print(quot, rem) show?", options: opts, answer: right,
          why: a + " // " + b + " is " + q + " and " + a + " % " + b + " is " + r + ". The function returns the tuple (" + q + ", " + r + "), and unpacking binds quot to " + q + " and rem to " + r + ".", code: code };
      }
      var words = ["a", "b", "fau"], pairs = [], n = 3 + rnd(2);
      for (var i = 0; i < n; i++) pairs.push([1 + rnd(9), words[rnd(3)]]);
      var nums = pairs.map(function (p) { return p[0]; }), uniq = pairs.map(function (p) { return p[1]; }).filter(function (wd, j, all) { return all.indexOf(wd) === j; }).length;
      var mn = Math.min.apply(null, nums), mx = Math.max.apply(null, nums);
      if (uniq === n || mn === mx) continue; // a repeated word makes the "unique" count matter
      var code2 = G.getData(pairs), right2 = "(" + mn + ", " + mx + ", " + uniq + ")";
      var opts2 = three(right2, ["(" + mn + ", " + mx + ", " + n + ")", "(" + mx + ", " + mn + ", " + uniq + ")"]);
      if (!opts2 || said(code2) !== right2) continue;
      return { id: "gen-tuple", short: "get_data", ref: "7.6", prompt: "What does the lecture’s get_data return for these pairs?", options: opts2, answer: right2,
        why: "The numbers run from " + mn + " to " + mx + ". A word joins words only if it is not in it yet, so the repeated word counts once: " + uniq + " distinct words, not " + n + ".", code: code2 };
    }
  }

  // ---------- 7.8 list operations ----------
  function fmtList(L) { return "[" + L.map(String).join(", ") + "]"; }
  // the same operations with a common misreading: remove takes every copy, del takes a value, pop takes the front
  function applyOps(start, ops, mode) {
    var L = start.slice();
    ops.forEach(function (o) {
      if (o.k === "append") L.push(o.v);
      else if (o.k === "remove") { if (mode === "removeAll") L = L.filter(function (x) { return x !== o.v; }); else L.splice(L.indexOf(o.v), 1); }
      else if (o.k === "del") { if (mode === "delValue" && L.indexOf(o.v) >= 0) L.splice(L.indexOf(o.v), 1); else L.splice(o.v, 1); }
      else if (o.k === "pop") { if (mode === "popFirst") L.shift(); else L.pop(); }
      else if (o.k === "sort") { if (mode !== "sortCopy") L.sort(function (p, q) { return p - q; }); }
      else if (o.k === "reverse") L.reverse();
    });
    return L;
  }
  function genListOps() {
    for (;;) {
      var start = [], n = 5 + rnd(2);
      for (var i = 0; i < n; i++) start.push(rnd(7));
      var L = start.slice(), ops = [];
      for (var j = 0; j < 3; j++) {
        var t = ["remove", "del", "pop", "append", "sort"][rnd(5)], o;
        if (t === "remove") o = { k: t, v: L[rnd(L.length)] };
        else if (t === "del") o = { k: t, v: rnd(L.length) };
        else if (t === "append") o = { k: t, v: rnd(7) };
        else o = { k: t };
        if (ops.some(function (p) { return p.k === "sort"; }) && t === "sort") { j--; continue; }
        ops.push(o); L = applyOps(L, [o], "right");
      }
      var code = ["L = " + fmtList(start)].concat(ops.map(function (o) {
        return o.k === "remove" ? "L.remove(" + o.v + ")" : o.k === "del" ? "del(L[" + o.v + "])" : o.k === "pop" ? "L.pop()" : o.k === "append" ? "L.append(" + o.v + ")" : "L.sort()";
      }), ["print(L)"]);
      var right = said(code);
      if (right !== fmtList(L)) continue;
      var wrongs = mix(["removeAll", "delValue", "popFirst", "sortCopy"]).map(function (m) { return fmtList(applyOps(start, ops, m)); });
      var opts = three(right, wrongs);
      if (!opts) continue;
      var cur = start.slice(), trail = ops.map(function (o) { cur = applyOps(cur, [o], "right"); return code[ops.indexOf(o) + 1] + " → " + fmtList(cur); });
      return { id: "gen-listops", short: "A run of list operations", ref: "7.8", prompt: "What does print(L) show at the end?", options: opts, answer: right,
        why: "Each method changes L in place: " + trail.join("; ") + ". remove takes the first copy only, del takes an index, and pop takes the last element.", code: code };
    }
  }

  // ---------- 7.9 aliasing and cloning ----------
  function genAlias() {
    for (;;) {
      var x = 1 + rnd(9), y = 1 + rnd(9), z = 1 + rnd(9), t = rnd(6), A = "[" + x + ", " + y + "]", AZ = "[" + x + ", " + y + ", " + z + "]", code, right, wrongs, why;
      if (x === y || z === x || z === y) continue;
      if (t === 0) { code = ["a = " + A, "b = a", "b.append(" + z + ")", "print(a)"]; right = AZ; wrongs = [A, "[" + z + "]"]; why = "b = a makes b a second name for the same list, so b.append(" + z + ") changes the list a points at too."; }
      else if (t === 1) { code = ["a = " + A, "b = a[:]", "b.append(" + z + ")", "print(a)"]; right = A; wrongs = [AZ, "[" + z + "]"]; why = "a[:] builds a new list, a clone. Appending to b changes only the clone; a is still " + A + "."; }
      else if (t === 2) { code = ["a = " + A, "b = a", "a = a + [" + z + "]", "print(b)"]; right = A; wrongs = [AZ, "[" + z + "]"]; why = "a + [" + z + "] builds a new list and moves only the name a to it. b still points at the old list " + A + "."; }
      else if (t === 3) { code = ["a = " + A, "b = a", "a += [" + z + "]", "print(b)"]; right = AZ; wrongs = [A, "[" + z + "]"]; why = "On a list, += extends the list in place instead of building a new one, so the alias b sees " + AZ + "."; }
      else if (t === 4) { code = ["def add(L):", "    L.append(" + z + ")", "", "a = " + A, "add(a)", "print(a)"]; right = AZ; wrongs = [A, "None"]; why = "The parameter L points at the caller’s list, so L.append(" + z + ") inside add changes a."; }
      else { code = ["inner = [" + x + "]", "outer = [inner, inner]", "inner.append(" + z + ")", "print(outer)"]; right = "[[" + x + ", " + z + "], [" + x + ", " + z + "]]"; wrongs = ["[[" + x + "], [" + x + "]]", "[[" + x + ", " + z + "], [" + x + "]]"]; why = "Both elements of outer are the one list inner, not copies, so the appended " + z + " shows up twice."; }
      var opts = three(right, wrongs);
      if (!opts || said(code) !== right) continue;
      return { id: "gen-alias", short: "Alias or copy?", ref: "7.9", prompt: "What does the last line print?", options: opts, answer: right, why: why, code: code };
    }
  }

  // ---------- 7.10 mutation during iteration ----------
  function genMutate() {
    for (;;) {
      var pool = mix([1, 2, 3, 4, 5, 6, 7, 8]), L1 = pool.slice(0, 4 + rnd(2)), L2 = [];
      L1.forEach(function (v) { if (rnd(2)) L2.push(v); });
      if (L2.length < 2 || L2.length === L1.length) continue;
      L2.push(9);
      var copy = rnd(3) === 0, code = G.removeDups(L1, L2, copy), right = said(code), other = said(G.removeDups(L1, L2, !copy));
      var opts = three(right, [other, fmtList(L1)]);
      if (!opts) continue;
      var fixed = fmtList(L1.filter(function (v) { return L2.indexOf(v) < 0; }));
      return { id: "gen-mutate", short: "Remove while looping", ref: "7.10", prompt: "What does print(L1) show?", options: opts, answer: right,
        why: copy ? "The loop walks the clone L1_copy, which never shrinks, so every element is checked and the result is " + fixed + "."
          : right === fixed ? "Here no two neighbours both had to go, so the skipped elements happened not to matter: " + right + ". With neighbours in L2 the hidden index would skip one."
          : "Each removal shifts the next element into the current index, and the loop’s hidden index moves on past it, so it is never checked: " + right + " instead of " + fixed + ".", code: code };
    }
  }

  // ---------- the six experiments ----------
  var FUNCS = ["def func_a():", "    print('inside func_a')", "", "def func_b(y):", "    print('inside func_b')", "    return y", "", "def func_c(z):", "    print('inside func_c')", "    return z()", "", "print(func_a())", "print(5 + func_b(2))", "print(func_c(func_a))"];

  mount("py-return", "7.3 return and print", [
    { id: "returns-false", short: "print the returned value", ref: "7.3", prompt: "What does the program print? (Lines are separated by |.)", code: G.isEven(3),
      options: [["a", "False"], ["b", "inside is_even | False"], ["c", "inside is_even | None"]], answer: "b",
      why: "The call runs the body first, which prints inside is_even, then returns 3 % 2 == 0, which is False; the outer print shows that False." },
    { id: "no-return", short: "No return gives None", ref: "7.3", prompt: "This is_even has no return. What does print(r) show?", code: G.isEvenNoReturn(4),
      options: [["true", "True"], ["nothing", "Nothing at all"], ["none", "None"]], answer: "none",
      why: "i % 2 == 0 is worked out and thrown away. With no return the call’s value is None, so r is None and print(r) shows None." },
    { id: "print-a-call", short: "Printing a function that prints", ref: "7.3", prompt: "What does print(func_a()) show?", code: G.funcA(),
      options: [["a", "inside func_a | None"], ["b", "inside func_a"], ["c", "None"]], answer: "a",
      why: "func_a prints inside func_a during the call and returns None, because it has no return; the outer print then shows None." },
    { id: "pass-a-function", short: "A function as an argument", ref: "7.5", prompt: "What does print(func_c(func_a)) show?", code: G.funcC(),
      options: [["a", "inside func_a | inside func_c | None"], ["b", "inside func_c | None"], ["c", "inside func_c | inside func_a | None"]], answer: "c",
      why: "func_a is passed without brackets, so it is not called yet. func_c prints first, then z() calls func_a, which prints and returns None; func_c returns that None." },
  ], genReturn, function (form) {
    var prog = field(form, "prog"), n = intField(form, "n", "The number", -999, 999);
    if (prog === "funcs") return FUNCS;
    if (prog === "even") return G.isEven(n);
    if (prog === "even-none") return G.isEvenNoReturn(n);
    return G.retPrint(prog, n, 3);
  });

  mount("py-scope", "7.4 Scope", [
    { id: "param", short: "A parameter is local", ref: "7.4", prompt: "The lecture’s f(x) adds 1 to its parameter. What does the last line, print(x, z), show?", code: G.scopeParam(3, 1),
      options: [["a", "4 4"], ["b", "3 3"], ["c", "3 4"]], answer: "c",
      why: "The parameter x lives in f’s frame and is rebound there to 4. The main program’s x stays 3, and z gets the returned 4." },
    { id: "assign-local", short: "Assigning makes a local name", ref: "7.4", prompt: "f assigns x = 1 and x += 1, then prints x. What does the program print?", code: G.scopeF(5, 1, 1),
      options: [["a", "2 | 5"], ["b", "2 | 2"], ["c", "6 | 5"]], answer: "a",
      why: "f assigns x, so its x is local: 1, then 2, printed. The main program’s x is a different name and is still 5." },
    { id: "read-outer", short: "Reading uses the outer name", ref: "7.4", prompt: "g only reads x. What does the program print?", code: G.scopeG(5, 1),
      options: [["a", "NameError"], ["b", "5 | 6 | 5"], ["c", "5 | 6 | 6"]], answer: "b",
      why: "g never assigns x, so Python looks x up in the main program: 5 and 6. Reading does not change x, so the last line prints 5." },
    { id: "unbound", short: "x += 1 inside a function", ref: "7.4", prompt: "h runs x += 1 on the outer x. What happens?", code: G.scopeH(5, 1),
      options: [["a", "6"], ["b", "5"], ["c", "UnboundLocalError"]], answer: "c",
      why: "x += 1 assigns x, which makes x local in h for the whole function. The local x has no value when += reads it, so Python raises UnboundLocalError." },
  ], genScope, function (form) {
    var v = field(form, "variant"), x = intField(form, "x", "x", -999, 999);
    return v === "param" ? G.scopeParam(x, 1) : v === "f" ? G.scopeF(x, 1, 1) : v === "g" ? G.scopeG(x, 1) : G.scopeH(x, 1);
  });

  mount("py-tuple", "7.6 Tuples", [
    { id: "two-values", short: "Return two values", ref: "7.6", prompt: "What does print(quot, rem) show?", code: G.quotRem(4, 5),
      options: [["a", "0.8 4"], ["b", "1 4"], ["c", "0 4"]], answer: "c",
      why: "4 // 5 rounds 0.8 down to 0, and 4 % 5 is 4. The function returns the one tuple (0, 4), and unpacking binds quot and rem." },
    { id: "bad-swap", short: "A swap that loses a value", ref: "7.6", prompt: "x = y, then y = x. What does print(x, y) show?", code: G.swapWrong(1, 2),
      options: [["a", "2 2"], ["b", "2 1"], ["c", "1 1"]], answer: "a",
      why: "x = y overwrites the 1 before anything saved it, so y = x copies 2 back. Use a temporary name or (x, y) = (y, x)." },
    { id: "one-element", short: "A one-element slice", ref: "7.6", prompt: "What does print(t[1:2]) show for t = (2, 'fau', 3)?", code: ["t = (2, 'fau', 3)", "print(t[1:2])"],
      options: [["a", "fau"], ["b", "('fau',)"], ["c", "('fau')"]], answer: "b",
      why: "A slice of a tuple is a tuple, here with one element. Python prints it with a trailing comma, because ('fau') would be just a string in brackets." },
    { id: "immutable", short: "Tuples cannot change", ref: "7.6", prompt: "What happens on t[1] = 4?", code: ["t = (2, 'fau', 3)", "t[1] = 4", "print(t)"],
      options: [["a", "(2, 4, 3)"], ["b", "(4, 'fau', 3)"], ["c", "TypeError"]], answer: "c",
      why: "Tuples are immutable: TypeError, 'tuple' object does not support item assignment. Build a new tuple instead, such as t[:1] + (4,) + t[2:]." },
  ], genTuple, function (form) {
    var prog = field(form, "prog"), x = intField(form, "x", "x", -999, 999), y = intField(form, "y", "y", -999, 999);
    if (prog === "quotrem") return G.quotRem(x, y);
    if (prog === "swap-wrong") return G.swapWrong(x, y);
    if (prog === "swap-temp") return G.swapTemp(x, y);
    if (prog === "swap-tuple") return G.swapTuple(x, y);
    return G.getData([[x, "a"], [y, "b"], [x + y, "a"]]);
  });

  mount("py-listops", "7.8 List operations", [
    { id: "four-removals", short: "remove, del and pop", ref: "7.8", prompt: "The lecture’s four removals run on L = [2, 1, 3, 6, 3, 7, 0]. What does the last line print?",
      code: ["L = [2, 1, 3, 6, 3, 7, 0]", "L.remove(2)", "L.remove(3)", "del(L[1])", "print(L.pop())", "print(L)"],
      options: [["a", "[1, 7]"], ["b", "[1, 3, 7]"], ["c", "[1, 3, 7, 0]"]], answer: "b",
      why: "remove(3) takes only the first 3: [1, 6, 3, 7, 0]. del(L[1]) deletes the 6, and pop() returns the last element, 0, and removes it: [1, 3, 7]." },
    { id: "plus-extend", short: "+ makes a new list", ref: "7.8", prompt: "L3 = L1 + L2, then L1.extend([0, 6]). What does print(len(L1), len(L3)) show?",
      code: ["L1 = [2, 1, 3]", "L2 = [4, 5, 6]", "L3 = L1 + L2", "L1.extend([0, 6])", "print(len(L1), len(L3))"],
      options: [["a", "5 8"], ["b", "3 6"], ["c", "5 6"]], answer: "c",
      why: "+ builds a new list of 6 elements and leaves L1 alone. extend then mutates L1 to 5 elements; L3 was made earlier and is a separate list." },
    { id: "sort-none", short: "sort returns None", ref: "7.8", prompt: "sortedwarm = warm.sort(). What does print(sortedwarm) show?",
      code: ["warm = ['red', 'yellow', 'orange']", "sortedwarm = warm.sort()", "print(warm)", "print(sortedwarm)"],
      options: [["a", "None"], ["b", "['orange', 'red', 'yellow']"], ["c", "['red', 'yellow', 'orange']"]], answer: "a",
      why: "sort() sorts warm in place and returns None, so sortedwarm is None. Use sorted(warm) when you want a sorted copy." },
    { id: "split", short: "split at a character", ref: "7.8", prompt: "With s = 'I<3 cs', what does print(s.split('<')) show?",
      code: ["s = 'I<3 cs'", "print(list(s))", "print(s.split('<'))"],
      options: [["a", "['I', '<', '3 cs']"], ["b", "['I', '3 cs']"], ["c", "['I<3', 'cs']"]], answer: "b",
      why: "split cuts the string at every '<' and drops the separator itself: two pieces, 'I' and '3 cs'. With no argument it would split at the space." },
  ], genListOps, program);

  mount("py-alias", "7.9 Aliasing and cloning", [
    { id: "alias", short: "Two names, one list", ref: "7.9", prompt: "hot = warm, then hot.append('pink'). What does print(warm) show?",
      code: ["warm = ['red', 'yellow', 'orange']", "hot = warm", "hot.append('pink')", "print(warm)"],
      options: [["a", "['red', 'yellow', 'orange']"], ["b", "['red', 'yellow', 'orange', 'pink']"], ["c", "['pink']"]], answer: "b",
      why: "hot = warm copies the arrow, not the list: one list, two names. append mutates that list, so warm shows pink too." },
    { id: "clone", short: "A clone is separate", ref: "7.9", prompt: "chill = cool[:], then chill.append('black'). What does print(cool) show?",
      code: ["cool = ['blue', 'green', 'grey']", "chill = cool[:]", "chill.append('black')", "print(cool)"],
      options: [["a", "['blue', 'green', 'grey', 'black']"], ["b", "['black']"], ["c", "['blue', 'green', 'grey']"]], answer: "c",
      why: "cool[:] builds a new list with the same elements. Appending to chill changes only the clone." },
    { id: "nested", short: "Side effects through nesting", ref: "7.9", prompt: "brightcolors holds warm and hot. After hot.append('pink'), what does print(brightcolors) show?",
      code: ["warm = ['yellow', 'orange']", "hot = ['red']", "brightcolors = [warm]", "brightcolors.append(hot)", "hot.append('pink')", "print(brightcolors)"],
      options: [["a", "[['yellow', 'orange'], ['red', 'pink']]"], ["b", "[['yellow', 'orange'], ['red']]"], ["c", "[['yellow', 'orange'], 'red', 'pink']"]], answer: "a",
      why: "brightcolors holds the lists warm and hot themselves, not copies. Mutating hot is visible through brightcolors[1]." },
    { id: "rebind", short: "Rebinding is not mutating", ref: "7.9", prompt: "b = a, then a = a + [3]. What does print(b) show?",
      code: ["a = [1, 2]", "b = a", "a = a + [3]", "print(b)"],
      options: [["a", "[1, 2, 3]"], ["b", "[1, 2]"], ["c", "[3]"]], answer: "b",
      why: "a + [3] builds a new list, and only the name a moves to it. b still points at the old list [1, 2]. (a.append(3) or a += [3] would have changed it.)" },
  ], genAlias, program);

  mount("py-mutate", "7.10 Mutation during iteration", [
    { id: "skip", short: "The skipped element", ref: "7.10", prompt: "The lecture’s remove_dups removes from L1 while looping over L1. What does print(L1) show?", code: G.removeDups([1, 2, 3, 4], [1, 2, 5, 6], false),
      options: [["a", "[3, 4]"], ["b", "[2, 3, 4]"], ["c", "[1, 2, 3, 4]"]], answer: "b",
      why: "Removing 1 shifts 2 into index 0, but the loop’s hidden index moves on to 1 and finds 3. The 2 is never checked, so it stays." },
    { id: "rounds", short: "Count the rounds", ref: "7.10", prompt: "In the same program, how many times does the loop body run?", code: G.removeDups([1, 2, 3, 4], [1, 2, 5, 6], false),
      options: [["4", "4"], ["3", "3"], ["2", "2"]], answer: "3",
      why: "The hidden index takes 0, 1 and 2. After the removal the list has only 3 elements, so index 3 is already past the end: three rounds, for 1, 3 and 4." },
    { id: "copy", short: "Loop over a clone", ref: "7.10", prompt: "The fixed version loops over L1_copy = L1[:]. What does print(L1) show now?", code: G.removeDups([1, 2, 3, 4], [1, 2, 5, 6], true),
      options: [["a", "[2, 3, 4]"], ["b", "[]"], ["c", "[3, 4]"]], answer: "c",
      why: "The clone never shrinks, so the loop checks 1, 2, 3 and 4 in turn and removes 1 and 2 from the real L1: [3, 4]." },
    { id: "neighbours", short: "Two matches side by side", ref: "7.10", prompt: "Now L1 = [1, 1, 2] and L2 = [1], with the buggy loop. What does print(L1) show?", code: G.removeDups([1, 1, 2], [1], false),
      options: [["a", "[1, 2]"], ["b", "[2]"], ["c", "[1]"]], answer: "a",
      why: "Index 0 finds the first 1 and removes it; the second 1 slides into index 0. The loop moves on to index 1, finds 2, and stops: one 1 survives." },
  ], genMutate, function (form) {
    var L1 = listField(form, "l1", "L1"), L2 = listField(form, "l2", "L2");
    return G.removeDups(L1, L2, field(form, "fix") === "copy");
  });
})();
