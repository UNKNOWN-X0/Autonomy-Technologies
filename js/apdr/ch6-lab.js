/* APDR Chapter 6 lab: predict what Python does, then watch it happen one step at a time.
   Three drawings share one canvas renderer: an expression reduced operation by operation, a string with its two
   rows of indices, and a program listing with the running line, its variables and its output. */
(function () {
  var P = window.APDR6, observer;

  // ---------- drawing ----------
  function colours(el) {
    var s = getComputedStyle(el), g = function (k) { return s.getPropertyValue(k).trim(); };
    return { paper: g("--paper"), panel: g("--paper-2"), ink: g("--ink"), muted: g("--muted"), line: g("--line"), fau: g("--fau-mark"), course: g("--course"), act: g("--act") || g("--fau-mark"), font: g("--f-display") || "sans-serif", mono: g("--f-mono") || "monospace" };
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
      ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      var h = r.height - 26; // the stage note sits in the bottom band
      if (state.kind === "expr") drawExpr(ctx, r.width, h, c, state);
      else if (state.kind === "slice") drawSlice(ctx, r.width, h, c, state);
      else drawTrace(ctx, r.width, h, c, state);
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
    for (; size > (min || 9); size--) { ctx.font = "600 " + size + "px " + (mono ? c.mono : c.font); if (ctx.measureText(t).width <= w) break; }
    return size;
  }
  // the guess and the result, at the foot of every drawing
  function foot(ctx, w, h, c, s) {
    var y = h - 8;
    if (s.done && s.resultLabel) { var t = "Result: " + s.resultLabel; text(ctx, t, 14, y, c, { size: fitSize(ctx, t, w - 28, c, false, 14), color: c.fau }); y -= 22; }
    if (s.guess) { var g = "Your prediction: " + s.guess; text(ctx, g, 14, y, c, { size: fitSize(ctx, g, w - 28, c, false, 14), color: c.muted }); }
  }
  function shown(s, n) { return s.done ? n : s.revealing ? Math.min(n, Math.floor(s.progress * n + 0.0001)) : 0; }

  function drawExpr(ctx, w, h, c, s) {
    text(ctx, "Python evaluates one operation at a time", 14, 20, c, { size: 13, color: c.muted });
    if (s.error && !s.steps) { text(ctx, s.error, 14, 60, c, { size: fitSize(ctx, s.error, w - 28, c, false, 14), color: c.act }); foot(ctx, w, h, c, s); return; }
    var steps = s.steps || [], n = steps.length, k = shown(s, n - 1), lh = Math.min(34, (h - 110) / Math.max(n, 1));
    var size = Math.min.apply(null, steps.map(function (t) { return fitSize(ctx, t, w - 80, c, true, 20, 10); }).concat([20]));
    for (var i = 0; i <= k && i < n; i++) {
      var y = 52 + i * lh, now = i === k;
      if (i > 0) text(ctx, "→", 18, y, c, { size: 14, color: c.muted });
      if (now) { ctx.fillStyle = c.panel; ctx.fillRect(40, y - lh / 2 + 2, w - 54, lh - 4); ctx.fillStyle = c.fau; ctx.fillRect(40, y - lh / 2 + 2, 3, lh - 4); }
      text(ctx, steps[i], 52, y, c, { size: size, mono: true, color: now ? c.ink : c.muted });
      if (i > 0 && s.ops && s.ops[i - 1]) text(ctx, s.ops[i - 1], w - 18, y, c, { size: 11, color: c.muted, align: "right" });
    }
    if (s.done) {
      var y2 = 52 + n * lh + 6, msg = s.error ? s.error : "type: " + s.type;
      text(ctx, msg, 52, Math.min(y2, h - 60), c, { size: 14, color: s.error ? c.act : c.fau });
    }
    foot(ctx, w, h, c, s);
  }

  function drawSlice(ctx, w, h, c, s) {
    if (!s.str) { text(ctx, s.error || "", 14, 40, c, { size: fitSize(ctx, s.error || "", w - 28, c, false, 14), color: c.act }); foot(ctx, w, h, c, s); return; }
    var str = s.str, n = str.length, label = s.label;
    text(ctx, label, 14, 20, c, { size: fitSize(ctx, label, w - 28, c, true, 16), mono: true });
    var cell = Math.max(22, Math.min(46, (w - 40) / Math.max(n + (s.outside ? 1 : 0), 1))), x0 = (w - cell * (n + (s.outside ? 1 : 0))) / 2, y0 = 78;
    var sel = s.sel || [], k = shown(s, sel.length), on = {};
    sel.slice(0, k).forEach(function (i, j) { on[i] = j + 1; });
    for (var i = 0; i < n; i++) {
      var x = x0 + i * cell, hot = on[i];
      ctx.fillStyle = hot ? c.panel : c.paper; ctx.fillRect(x, y0, cell, cell);
      ctx.strokeStyle = hot ? c.fau : c.line; ctx.lineWidth = hot ? 2.5 : 1.5; ctx.strokeRect(x + 0.5, y0 + 0.5, cell - 1, cell - 1);
      text(ctx, str.charAt(i) === " " ? "␣" : str.charAt(i), x + cell / 2, y0 + cell / 2, c, { size: Math.min(20, cell * 0.5), mono: true, align: "center" });
      text(ctx, String(i - n).replace("-", "−"), x + cell / 2, y0 - 12, c, { size: 11, color: c.muted, align: "center" });
      text(ctx, String(i), x + cell / 2, y0 + cell + 14, c, { size: 11, color: c.muted, align: "center" });
      if (hot && sel.length > 1) text(ctx, String(hot), x + cell - 4, y0 + 8, c, { size: Math.min(10, cell * 0.28), color: c.fau, align: "right" }); // the order it was taken in
    }
    if (s.outside && s.done) {
      var xo = x0 + n * cell;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = s.done ? c.act : c.line; ctx.lineWidth = 1.5; ctx.strokeRect(xo + 0.5, y0 + 0.5, cell - 1, cell - 1); ctx.setLineDash([]);
      text(ctx, String(n), xo + cell / 2, y0 + cell + 14, c, { size: 11, color: c.muted, align: "center" });
    }
    text(ctx, "index from the right", 14, y0 - 30, c, { size: 11, color: c.muted });
    text(ctx, "index from the left", 14, y0 + cell + 34, c, { size: 11, color: c.muted });
    if (k > 0 || s.done) {
      var got = s.error && s.done ? s.error : "\"" + sel.slice(0, k).map(function (i) { return str.charAt(i); }).join("") + "\"";
      text(ctx, got, 14, y0 + cell + 66, c, { size: fitSize(ctx, got, w - 28, c, true, 18), mono: true, color: s.error ? c.act : c.fau });
    }
    foot(ctx, w, h, c, s);
  }

  function drawTrace(ctx, w, h, c, s) {
    var code = s.code || [], steps = s.steps || [], n = steps.length, k = shown(s, n) - 1, st = k >= 0 ? steps[k] : null;
    var wide = w >= 560, codeW = wide ? w * 0.6 : w - 20, maxLen = Math.max.apply(null, code.map(function (l) { return l.length; }).concat([10]));
    var size = Math.max(9, Math.min(15, (codeW - 44) / (maxLen * 0.62))), lh = Math.min(size + 8, (wide ? h - 70 : h * 0.55) / Math.max(code.length, 1));
    for (var i = 0; i < code.length; i++) {
      var y = 18 + i * lh + lh / 2, now = st && st.line === i;
      if (now) { ctx.fillStyle = c.panel; ctx.fillRect(10, y - lh / 2, codeW, lh); ctx.fillStyle = c.fau; ctx.fillRect(10, y - lh / 2, 3, lh); }
      text(ctx, String(i + 1), 30, y, c, { size: size - 2, mono: true, color: c.muted, align: "right" });
      text(ctx, code[i], 38, y, c, { size: size, mono: true, weight: now ? 700 : 500, color: now ? c.ink : c.muted });
    }
    var px = wide ? codeW + 24 : 14, py = wide ? 18 : 18 + code.length * lh + 14, pw = wide ? w - codeW - 34 : (w - 40) / 2;
    text(ctx, "Variables", px, py + 8, c, { size: 12, color: c.muted });
    var names = st ? Object.keys(st.vars) : [];
    names.forEach(function (nm, j) {
      var yy = py + 30 + j * 22;
      text(ctx, nm, px, yy, c, { size: 13, mono: true, color: c.muted });
      var vx = px + Math.min(70, pw * 0.5), vv = String(st.vars[nm]);
      text(ctx, vv, vx, yy, c, { size: fitSize(ctx, vv, (wide ? w - 10 : px + pw) - vx, c, true, 13), mono: true, weight: 700 });
    });
    var ox = wide ? px : px + pw + 12, oy = wide ? py + 40 + Math.max(names.length, 2) * 22 : py;
    text(ctx, "Output", ox, oy + 8, c, { size: 12, color: c.muted });
    var outs = st ? st.out : [], room = wide ? w - ox - 10 : pw;
    var last = outs.slice(-5), osize = Math.min.apply(null, last.map(function (o) { return fitSize(ctx, o, room, c, true, 13); }).concat([13])); // one size for every line
    last.forEach(function (o, j) { text(ctx, o, ox, oy + 30 + j * 20, c, { size: osize, mono: true, color: c.fau }); });
    foot(ctx, w, h, c, s);
  }

  // ---------- challenges ----------
  function rnd(n) { return Math.floor(Math.random() * n); }
  function mix(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // the right option plus up to two distinct wrong ones; returns null when they collide, so the generator re-draws
  function three(right, wrongs) {
    var opts = [right], seen = {};
    seen[right[1]] = 1;
    wrongs.forEach(function (o) { if (opts.length < 3 && o && o[0] !== "" && !seen[o[1]]) { seen[o[1]] = 1; opts.push(o); } });
    return opts.length >= 2 ? mix(opts) : null;
  }
  function q(t) { return "\"" + t + "\"" + (t === "" ? " (empty)" : ""); }
  function make(show, state, spec) {
    var label = function (key) { var o = spec.options.filter(function (x) { return x[0] === key; })[0]; return o ? o[1] : key; };
    return {
      id: spec.id, short: spec.short, ref: spec.ref, prompt: spec.prompt, options: spec.options, answer: spec.answer, why: spec.why,
      stage: function () {
        Object.keys(state).forEach(function (k) { if (k !== "kind") delete state[k]; });
        Object.assign(state, spec.set(), { challenge: true, progress: 0, revealing: false, done: false, guess: "", resultLabel: label(spec.answer) });
        show();
      },
      preview: function (key) { state.guess = label(key); show(); },
      reveal: function () {
        state.revealing = true;
        var n = (state.steps || state.sel || [1]).length;
        return Lab.tween(Math.max(1200, Math.min(2000, n * 110)), function (t) { state.progress = t; show(); }).then(function () { state.revealing = false; state.done = true; state.progress = 1; show(); });
      },
    };
  }

  function mount(id, title, kind, specs, gen, sandbox) {
    var section = document.querySelector('[data-experiment="' + id + '"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"), msg = form.querySelector("[data-own-msg]");
    var state = { kind: kind }, show = function () { paint(canvas, state); };
    var live = function () {
      if (state.challenge) return;
      Object.keys(state).forEach(function (k) { if (k !== "kind") delete state[k]; });
      try { Object.assign(state, sandbox(form), { done: true, progress: 1 }); if (msg) msg.textContent = ""; }
      catch (e) { state.error = e.message; if (msg) msg.textContent = e.message; }
      show();
    };
    Lab.experiment({
      id: id, title: title, card: section.querySelector(".challenge"),
      generate: gen ? function () { return make(show, state, gen()); } : null,
      lock: function (on) { form.querySelectorAll("input,select,button").forEach(function (el) { el.disabled = on; }); section.querySelector(".stage").classList.toggle("locked", on); },
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
  function field(form, name) { var el = form.querySelector('[data-f="' + name + '"]'); return el ? el.value.trim() : ""; }
  function intField(form, name, label, allowBlank) {
    var v = field(form, name).replace("−", "-");
    if (v === "" && allowBlank) return null;
    if (!/^-?\d+$/.test(v)) throw Error(label + " must be a whole number" + (allowBlank ? " or left empty" : "") + ".");
    var n = parseInt(v, 10);
    if (Math.abs(n) > 1000000) throw Error(label + " must be between −1 000 000 and 1 000 000.");
    return n;
  }

  // ---------- 6.2 operators ----------
  function exprState(e) { var r = P.evaluate(e); return { steps: r.steps, ops: r.ops, type: r.type, text: r.text }; }
  function exprSpec(id, short, e, opts, answer, why) {
    return { id: id, short: short, ref: "6.2", prompt: "What does Python give for " + e + "? Mind the type.", options: opts, answer: answer, why: why, set: function () { return exprState(e); } };
  }
  function show2(text, type) { return text + " (" + type + ")"; }
  function genOps() {
    for (;;) {
      var t = rnd(4), a, b, c3, e, right, wrongs = [];
      if (t === 0) { a = -(3 + rnd(15)); b = 2 + rnd(4); if (a % b === 0) continue; e = a + " // " + b; wrongs = [String(Math.trunc(a / b)), P.fmtFloat(a / b)]; }
      else if (t === 1) { b = 2 + rnd(6); a = b * (2 + rnd(8)); e = a + " / " + b; wrongs = [String(a / b)]; }
      else if (t === 2) { a = 1 + rnd(9); b = 2 + rnd(8); c3 = 2 + rnd(8); e = a + " + " + b + " * " + c3; wrongs = [String((a + b) * c3), P.fmtFloat(a + b * c3)]; }
      else { a = -(3 + rnd(15)); b = 3 + rnd(5); if (a % b === 0) continue; e = a + " % " + b; wrongs = [String(a % b), String(-a % b)]; }
      var r = P.evaluate(e), opts = three([r.text, r.text], wrongs.map(function (x) { return [x, x]; }));
      if (!opts) continue;
      var why = ["// rounds the quotient down, towards minus infinity, not towards zero: " + e + " is " + r.text + ".",
        "/ always returns a float, even when the division is exact: " + e + " is " + r.text + ", not " + (a / b) + ".",
        "* binds tighter than +, so the product is worked out first: " + e + " is " + r.text + ".",
        "% takes the sign of the divisor, so that a == b * (a // b) + a % b still holds: " + e + " is " + r.text + "."][t];
      return { id: "gen-ops", short: "Value and type", ref: "6.2", prompt: "What does Python give for " + e + "?", options: opts, answer: r.text, why: why, set: function () { return exprState(e); } };
    }
  }

  // ---------- 6.4 slicing ----------
  function sliceState(str, a, b, st, single) {
    if (single !== undefined) {
      var n = str.length, j = single < 0 ? single + n : single, err = j < 0 || j >= n;
      return { str: str, label: "s = \"" + str + "\"    s[" + single + "]", sel: err ? [] : [j], outside: err && j === n, error: err ? "IndexError: string index out of range" : "" };
    }
    return { str: str, label: "s = \"" + str + "\"    s" + P.sliceText(a, b, st), sel: P.sliceIndices(str.length, a, b, st) };
  }
  function sliceSpec(id, short, str, args, opts, answer, why, single) {
    var e = single !== undefined ? "s[" + single + "]" : "s" + P.sliceText(args[0], args[1], args[2]);
    return { id: id, short: short, ref: "6.4", prompt: "With s = \"" + str + "\", what is " + e + "?", options: opts, answer: answer, why: why, set: function () { return sliceState(str, args && args[0], args && args[1], args && args[2], single); } };
  }
  var WORDS = ["abcdefgh", "python", "loops", "branching", "string", "keyboard"];
  function genSlice() {
    for (;;) {
      var str = WORDS[rnd(WORDS.length)], n = str.length, st = [null, 1, 2, -1, -2][rnd(5)], a, b;
      if (st === null || st > 0) { a = rnd(n - 2); b = a + 2 + rnd(n - a - 1); } else { a = 2 + rnd(n - 2); b = rnd(a - 1); }
      if (rnd(3) === 0) a = a - n; // a negative start now and then
      var right = P.pySlice(str, a, b, st), inclusive = P.sliceIndices(n, a, st !== null && st < 0 ? b - 1 : b + 1, st).map(function (i) { return str.charAt(i); }).join(""), noStep = P.pySlice(str, a, b);
      if (right.length < 1) continue;
      var opts = three([right, q(right)], [[inclusive, q(inclusive)], [noStep, q(noStep)], [right.split("").reverse().join(""), q(right.split("").reverse().join(""))]]);
      if (!opts) continue;
      var e = "s" + P.sliceText(a, b, st), idx = P.sliceIndices(n, a, b, st);
      return { id: "gen-slice", short: "Slice", ref: "6.4", prompt: "With s = \"" + str + "\", what is " + e + "?", options: opts, answer: right,
        why: "Start at index " + (a < 0 ? a + " (" + a + " + " + n + " = " + idx[0] + ")" : idx[0]) + ", step " + (st === null ? 1 : st) + ", and stop before index " + (b < 0 ? b + n : b) + ": indices " + idx.join(", ") + " give " + q(right) + ". The stop index is never included.",
        set: function () { return sliceState(str, a, b, st); } };
    }
  }

  // ---------- traces (6.7, 6.8, 6.9) ----------
  function traceSpec(id, short, ref, prompt, opts, answer, why, run) {
    return { id: id, short: short, ref: ref, prompt: prompt, options: opts, answer: answer, why: why, set: function () { var r = run(); return { code: r.code, steps: r.steps }; } };
  }
  function outText(r) { return r.output.join(" | "); }
  function genBranch() {
    var pairs = [[3, 3], [0, 0], [2, 5], [5, 2]];
    for (;;) {
      var x = rnd(7) - 2, y = rnd(4) === 0 ? x : rnd(7) - 2, r = P.traceXY(x, y), right = outText(r);
      var opts = three([right, right], pairs.map(function (p) { var t = outText(P.traceXY(p[0], p[1])); return [t, t]; }));
      if (!opts) continue;
      return { id: "gen-branch", short: "Which lines run", ref: "6.7", prompt: "The program reads x = " + x + " and y = " + y + ". What does it print? (Lines are separated by |.)", options: opts, answer: right,
        why: (x === y ? "x == y holds, so the first block runs; " + (y !== 0 ? "y != 0, so the ratio is printed too." : "y is 0, so the inner if skips the division.") : "x == y fails, so the elif test x < y decides: " + (x < y ? "it holds." : "it fails and else runs.")) + " The unindented last line always prints thanks!",
        set: function () { return { code: r.code, steps: r.steps }; } };
    }
  }
  function genLoop() {
    for (;;) {
      var a = rnd(8), st = 1 + rnd(3), b = a + 3 + rnd(9), r = P.traceSumLoop(a, b, st, "none"), vals = P.range(a, b, st);
      var withStop = r.result + b, noStep = P.range(a, b).reduce(function (x, y) { return x + y; }, 0);
      var opts = three([String(r.result), String(r.result)], [[String(withStop), String(withStop)], [String(noStep), String(noStep)], [String(r.result - vals[vals.length - 1]), String(r.result - vals[vals.length - 1])]]);
      if (!opts) continue;
      return { id: "gen-loop", short: "Sum over a range", ref: "6.8", prompt: "mysum starts at 0 and adds every i in range(" + a + ", " + b + (st === 1 ? "" : ", " + st) + "). What is printed?", options: opts, answer: String(r.result),
        why: "range(" + a + ", " + b + (st === 1 ? "" : ", " + st) + ") gives " + vals.join(", ") + " and stops before " + b + ", so mysum is " + r.result + ".",
        set: function () { return { code: r.code, steps: r.steps }; } };
    }
  }
  function genJump() {
    for (;;) {
      var a = 1 + rnd(6), st = 1 + rnd(3), b = a + 4 * st + rnd(4), jump = rnd(2) ? "break" : "continue", vals = P.range(a, b, st);
      // aim the test at a running total the loop really reaches, so the jump fires
      var run = 0, totals = vals.map(function (i) { run += i; var t = run; run += 1; return t; }), target = totals[rnd(Math.min(3, totals.length))];
      var r = P.traceSumLoop(a, b, st, jump, target), other = P.traceSumLoop(a, b, st, jump === "break" ? "continue" : "break", target), none = vals.reduce(function (x, y) { return x + y + 1; }, 0);
      var opts = three([String(r.result), String(r.result)], [[String(other.result), String(other.result)], [String(none), String(none)]]);
      if (!opts) continue;
      return { id: "gen-jump", short: "break or continue", ref: "6.9", prompt: "The lecture’s loop over range(" + a + ", " + b + (st === 1 ? "" : ", " + st) + ") uses " + jump + " when mysum == " + target + ". What is printed?", options: opts, answer: String(r.result),
        why: jump === "break" ? "When mysum reaches " + target + ", break leaves the loop at once, before the += 1, so " + r.result + " is printed." : "When mysum reaches " + target + ", continue skips that round’s += 1 only; the loop carries on and prints " + r.result + ".",
        set: function () { return { code: r.code, steps: r.steps }; } };
    }
  }

  // ---------- the five experiments ----------
  mount("py-ops", "6.2 Operators", "expr", [
    exprSpec("divide", "/ gives a float", "7 / 7", [["1", "1 (int)"], ["7", "7 (int)"], ["1.0", "1.0 (float)"]], "1.0",
      "The / operator always returns a float, even when the division is exact: 7 / 7 is 1.0. Use // for a whole-number quotient."),
    exprSpec("floor", "// rounds down", "-7 // 2", [["-3", "-3"], ["-4", "-4"], ["-3.5", "-3.5"]], "-4",
      "// rounds the quotient down, towards minus infinity: −3.5 becomes −4, not −3. Casting with int() is the one that cuts towards zero."),
    exprSpec("same-row", "* and / share a row", "8 / 2 * 4", [["16.0", "16.0"], ["1.0", "1.0"], ["16", "16"]], "16.0",
      "* and / have the same precedence and go left to right: 8 / 2 is 4.0, then 4.0 * 4 is 16.0. The slide lists them on separate rows, but Python does not."),
    exprSpec("chain", "Full precedence", "2 + 3 * 4 ** 2 // 5", [["16", "16"], ["11.0", "11.0"], ["11", "11"]], "11",
      "** first (16), then * and // left to right (48, then 9), then + (11). Every operand is an int and there is no /, so the answer is the int 11."),
  ], genOps, function (form) {
    return exprState(field(form, "expr"));
  });

  mount("py-slice", "6.4 Strings", "slice", [
    sliceSpec("stop-out", "The stop is excluded", "abcdefgh", [3, 6, null], [["defg", "\"defg\""], ["def", "\"def\""], ["cde", "\"cde\""]], "def",
      "A slice starts at index 3 and stops before index 6, so it takes indices 3, 4, 5: \"def\". Its length is 6 − 3 = 3."),
    sliceSpec("past-end", "Past the last index", "abcdefgh", null, [["h", "\"h\""], ["empty", "\"\" (empty)"], ["error", "IndexError"]], "error",
      "Indices run from 0 to len(s) − 1 = 7, so s[8] does not exist and Python raises an IndexError. The last character is s[7] or s[-1].", 8),
    sliceSpec("reverse", "Reverse with step −1", "abcdefgh", [null, null, -1], [["hgfedcba", "\"hgfedcba\""], ["hgfedbca", "\"hgfedbca\""], ["abcdefgh", "\"abcdefgh\""]], "hgfedcba",
      "With a negative step and no start or stop, the slice walks from the last character to the first: \"hgfedcba\". The lecture slide prints “hgfedbca”, a typo."),
    sliceSpec("back-two", "Backwards in steps of 2", "abcdefgh", [4, 1, -2], [["eca", "\"eca\""], ["empty", "\"\" (empty)"], ["ec", "\"ec\""]], "ec",
      "Start at index 4 (e), step −2 to index 2 (c); index 0 would pass the stop at 1, so the slice ends: \"ec\". A negative step reads right to left."),
  ], genSlice, function (form) {
    var str = form.querySelector('[data-f="text"]').value, a = intField(form, "start", "Start", true), b = intField(form, "stop", "Stop", true), st = intField(form, "step", "Step", true);
    if (/[\uD800-\uDFFF]/.test(str)) throw Error("Use letters, digits and symbols from the keyboard; emoji take two boxes here.");
    if (str.length > 14) throw Error("Keep the string to 14 characters so every box fits.");
    if (!str.length) throw Error("Type a string to slice.");
    if (st === 0) throw Error("ValueError: slice step cannot be zero.");
    return sliceState(str, a, b, st);
  });

  mount("py-branch", "6.7 Branching", "trace", [
    traceSpec("smaller", "elif after a failed if", "6.7", "The lecture’s program reads x = 2 and y = 5. What does it print? (Lines are separated by |.)",
      [["a", "x is smaller | thanks!"], ["b", "x is smaller | y is smaller | thanks!"], ["c", "x is smaller"]], "a",
      "x == y fails, so Python tries elif x < y, which holds: one block runs. The else is skipped, and the unindented print(\"thanks!\") always runs.", function () { return P.traceXY(2, 5); }),
    traceSpec("zero", "The guarded division", "6.7", "The program reads x = 0 and y = 0. What does it print?",
      [["a", "x and y are equal | therefore, x / y is 1.0 | thanks!"], ["b", "x and y are equal | thanks!"], ["c", "A ZeroDivisionError"]], "b",
      "x == y holds, so the first block prints the equality. Inside it, y != 0 is false, so the division line never runs: no error. Then thanks! prints.", function () { return P.traceXY(0, 0); }),
    traceSpec("equal", "Nested block runs", "6.7", "The program reads x = 3 and y = 3. How many lines does it print?",
      [["2", "2"], ["4", "4"], ["3", "3"]], "3",
      "The equality line, then the inner if (y != 0 holds) prints “therefore, x / y is 1.0”, then thanks!: three lines. Inputs arrive as floats, so 3 / 3 prints as 1.0.", function () { return P.traceXY(3, 3); }),
    traceSpec("first-true", "Only the first true branch", "6.7", "In the chain on the stage, x = 7. Both x > 5 and x > 3 are true. What is printed?",
      [["both", "big | mid"], ["big", "big"], ["mid", "mid"]], "big",
      "An if/elif/else chain runs only the first block whose condition is true. x > 5 holds, so big prints and the rest of the chain is skipped.", function () { return P.traceChain(7, 5, 3); }),
  ], genBranch, function (form) {
    var x = intField(form, "x", "x"), y = intField(form, "y", "y"), r = P.traceXY(x, y);
    return { code: r.code, steps: r.steps, resultLabel: outText(r) };
  });

  mount("py-loop", "6.8 Loops", "trace", [
    traceSpec("step-two", "range stops before stop", "6.8", "mysum adds every i in range(5, 11, 2). What is printed?",
      [["32", "32"], ["45", "45"], ["21", "21"]], "21",
      "range(5, 11, 2) gives 5, 7, 9 and stops before 11, so mysum = 21. 32 would add 11 as well; 45 would ignore the step.", function () { return P.traceSumLoop(5, 11, 2, "none"); }),
    traceSpec("plain", "Three values, not four", "6.8", "mysum adds every i in range(7, 10). What is printed?",
      [["24", "24"], ["34", "34"], ["9", "9"]], "24",
      "range(7, 10) gives 7, 8, 9: that is 10 − 7 = 3 values, summing to 24. 34 would wrongly include 10.", function () { return P.traceSumLoop(7, 10, 1, "none"); }),
    traceSpec("halve", "Count the rounds", "6.8", "n starts at 10 and the loop runs n = n // 2 while n > 1. How many rounds?",
      [["5", "5"], ["3", "3"], ["4", "4"]], "3",
      "10 → 5 → 2 → 1: three rounds. Then 1 > 1 is false, the loop ends, and n is 1.", function () { return P.traceHalving(10); }),
    traceSpec("never", "A loop that never runs", "6.8", "The same halving loop starts with n = 1. How many rounds does it make?",
      [["1", "1"], ["0", "0"]], "0",
      "A while loop tests its condition before the first round. 1 > 1 is false, so the body never runs: rounds stays 0.", function () { return P.traceHalving(1); }),
  ], genLoop, function (form) {
    var prog = form.querySelector('[data-f="prog"]').value, r;
    if (prog === "halve") { var n = intField(form, "n", "n"); if (n < 0 || n > 100000) throw Error("Choose n between 0 and 100 000."); r = P.traceHalving(n); return { code: r.code, steps: r.steps, resultLabel: r.output[0] }; }
    var a = intField(form, "start", "Start"), b = intField(form, "stop", "Stop"), st = intField(form, "step", "Step");
    if (st === 0) throw Error("ValueError: the step of range cannot be zero.");
    if (Math.abs(b - a) / Math.abs(st) > 40) throw Error("Keep it to 40 rounds or fewer so the trace stays readable.");
    r = P.traceSumLoop(a, b, st, "none");
    return { code: r.code, steps: r.steps, resultLabel: "mysum = " + r.result + " after " + r.rounds + " round" + (r.rounds === 1 ? "" : "s") };
  });

  mount("py-jump", "6.9 break and continue", "trace", [
    traceSpec("break", "break leaves the loop", "6.9", "The lecture’s loop over range(5, 11, 2) uses break when mysum == 5. What is printed?",
      [["23", "23"], ["21", "21"], ["5", "5"]], "5",
      "In the first round mysum becomes 5, the test holds, and break leaves the loop before mysum += 1. The loop never reaches 7 or 9: 5 is printed.", function () { return P.traceSumLoop(5, 11, 2, "break", 5); }),
    traceSpec("continue", "continue skips one round", "6.9", "The same loop uses continue instead. What is printed?",
      [["5", "5"], ["23", "23"], ["24", "24"]], "23",
      "continue skips only the rest of the first round, so that round misses its += 1. The rounds for 7 and 9 run fully: 5 + 7 + 1 + 9 + 1 = 23.", function () { return P.traceSumLoop(5, 11, 2, "continue", 5); }),
    traceSpec("nested", "Only the inner loop", "6.9", "On the stage, break sits in the inner of two loops (3 outer rounds, 4 inner). What is count at the end?",
      [["2", "2"], ["12", "12"], ["6", "6"]], "6",
      "break leaves only the inner loop, at j == 2, after two counts. The outer loop goes on, so each of its 3 rounds adds 2: count is 6.", function () { return P.traceNested(3, 4, 2); }),
    traceSpec("square", "The loop variable after break", "6.9", "The loop breaks at the first i with i * i > 20. Which i is printed?",
      [["4", "4"], ["5", "5"], ["9", "9"]], "5",
      "4 · 4 = 16 is not above 20, but 5 · 5 = 25 is, so break leaves the loop with i still 5. A loop variable keeps its last value after the loop.", function () { return P.traceFirstSquare(10, 20); }),
  ], genJump, function (form) {
    var jump = form.querySelector('[data-f="jump"]').value, a = intField(form, "start", "Start"), b = intField(form, "stop", "Stop"), st = intField(form, "step", "Step"), t = intField(form, "target", "Target");
    if (st === 0) throw Error("ValueError: the step of range cannot be zero.");
    if (Math.abs(b - a) / Math.abs(st) > 40) throw Error("Keep it to 40 rounds or fewer so the trace stays readable.");
    var r = P.traceSumLoop(a, b, st, jump, t);
    return { code: r.code, steps: r.steps, resultLabel: "prints " + r.result };
  });
})();
