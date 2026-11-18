/* EEI Chapter 3 experiments: real sources, Kirchhoff's laws, dividers, maximum power, superposition and node voltages. */
(function () {
  var P = window.EEI3, ns = "http://www.w3.org/2000/svg", fmt = P.fmt;
  function tok(name) { return getComputedStyle(document.body).getPropertyValue(name).trim(); }
  function node(tag, attrs, parent) {
    var el = document.createElementNS(ns, tag);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    parent.appendChild(el); return el;
  }
  function text(svg, words, x, y, size, color, anchor, weight) {
    var el = node("text", { x: x, y: y, fill: color || tok("--ink"), "font-size": size || 14, "font-family": "var(--f-display)", "text-anchor": anchor || "start" }, svg);
    if (weight) el.setAttribute("font-weight", weight);
    // "R_L" or "P_{L,max}" sets the part after _ as a subscript, as the guide figures do
    var bits = String(words).split(/_(\{[^}]+\}|[^\s_,=:)]+)/);
    if (bits.length === 1) { el.textContent = words; return el; }
    bits.forEach(function (b, i) {
      if (!b) return;
      var ts = node("tspan", {}, el);
      if (i % 2) { ts.setAttribute("baseline-shift", "sub"); ts.setAttribute("font-size", "0.75em"); b = b.replace(/^\{|\}$/g, ""); }
      ts.textContent = b;
    });
    return el;
  }
  function line(svg, x1, y1, x2, y2, color, width, dash) {
    return node("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || tok("--ink"), "stroke-width": width || 2, "stroke-dasharray": dash || "", "stroke-linecap": "round" }, svg);
  }
  function wire(svg, pts, color, dash) { return node("polyline", { points: pts.map(function (p) { return p.join(","); }).join(" "), fill: "none", stroke: color || tok("--ink"), "stroke-width": 2, "stroke-dasharray": dash || "", "stroke-linejoin": "round" }, svg); }
  function head(svg, x1, y1, x2, y2, color) {
    var a = Math.atan2(y2 - y1, x2 - x1), s = 8;
    node("polygon", { points: [[x2, y2], [x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)], [x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)]].map(function (p) { return p.join(","); }).join(" "), fill: color }, svg);
  }
  function arrow(svg, x1, y1, x2, y2, color, width) { line(svg, x1, y1, x2, y2, color, width || 2); head(svg, x1, y1, x2, y2, color); }
  function reset(svg, label) { svg.innerHTML = ""; svg.setAttribute("role", "img"); svg.setAttribute("aria-label", label); }
  function stage(id) { return document.querySelector("[data-visual='" + id + "']"); }

  // ---- circuit parts: a resistor box over the wire, sources as circles, a node dot
  function res(svg, x, y, o, label, side) {
    var w = o === "h" ? 46 : 18, h = o === "h" ? 18 : 46;
    node("rect", { x: x - w / 2, y: y - h / 2, width: w, height: h, fill: tok("--paper"), stroke: tok("--ink"), "stroke-width": 2 }, svg);
    if (label) {
      if (o === "h") text(svg, label, x, side === "s" ? y + 30 : y - 16, 13, tok("--ink"), "middle", 700);
      else text(svg, label, side === "w" ? x - 16 : x + 16, y + 5, 13, tok("--ink"), side === "w" ? "end" : "start", 700);
    }
  }
  function vsrc(svg, x, y, label) {
    node("circle", { cx: x, cy: y, r: 15, fill: tok("--paper"), stroke: tok("--ink"), "stroke-width": 2 }, svg);
    line(svg, x - 6, y - 3, x + 6, y - 3, tok("--ink"), 2); line(svg, x - 6, y + 3, x + 6, y + 3, tok("--ink"), 2);
    if (label) { arrow(svg, x - 28, y - 14, x - 28, y + 14, tok("--fau-mark")); text(svg, label, x - 36, y + 5, 13, tok("--fau-mark"), "end", 700); }
  }
  function isrc(svg, x, y, label) {
    node("circle", { cx: x, cy: y, r: 15, fill: tok("--paper"), stroke: tok("--ink"), "stroke-width": 2 }, svg);
    arrow(svg, x, y + 9, x, y - 9, tok("--ink"));
    if (label) text(svg, label, x + 22, y + 5, 13, tok("--fau-mark"), "start", 700);
  }
  function dot(svg, x, y) { node("circle", { cx: x, cy: y, r: 4, fill: tok("--ink") }, svg); }
  // charge flowing along a closed or open path: dots spaced 26 px apart, moving with the current (sign gives the direction)
  function flow(svg, pts, current, phase, scale) {
    if (!current || !isFinite(current)) return;
    var segs = [], total = 0;
    for (var i = 1; i < pts.length; i++) { var L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(L); total += L; }
    var shift = ((phase * 140 * Math.min(3, Math.abs(current) / (scale || 1))) % 26) * (current > 0 ? 1 : -1);
    for (var s = ((shift % 26) + 26) % 26; s < total; s += 26) {
      var d = s, k = 0;
      while (k < segs.length - 1 && d > segs[k]) { d -= segs[k]; k++; }
      var t = segs[k] ? d / segs[k] : 0, a = pts[k], b = pts[k + 1];
      node("circle", { cx: a[0] + (b[0] - a[0]) * t, cy: a[1] + (b[1] - a[1]) * t, r: 3, fill: tok("--act") }, svg);
    }
  }
  function said(svg, words) { if (words) text(svg, "Your prediction: " + words, 280, 350, 13, tok("--muted"), "middle"); }
  function noteText(svg, words, phase) { if (words && phase > 0.85) text(svg, words, 280, 326, 15, tok("--act"), "middle", 800); }

  // ---- 3.2 real source: circuit on the left, terminal line on the right
  function drawSource(svg, s, phase, guess) {
    reset(svg, "A real source with a load and its terminal line");
    var r = P.realSource(s.U0, s.Ri, s.RL), show = Math.min(1, phase * 1.3);
    var open = s.RL === Infinity, short = s.RL === 0;
    wire(svg, [[70, 60], [230, 60]]); wire(svg, [[70, 280], [230, 280]]); wire(svg, [[70, 60], [70, 280]]);
    if (s.model === "i") {
      wire(svg, [[150, 60], [150, 280]]); isrc(svg, 70, 170, fmt(r.Ishort, "A")); res(svg, 150, 170, "v", "Rᵢ = " + fmt(s.Ri, "Ω"), "e");
    } else { vsrc(svg, 70, 170, fmt(s.U0, "V")); res(svg, 140, 60, "h", "Rᵢ = " + fmt(s.Ri, "Ω")); }
    node("rect", { x: 34, y: 22, width: 166, height: 290, fill: "none", stroke: tok("--muted"), "stroke-width": 1.5, "stroke-dasharray": "5 5" }, svg);
    dot(svg, 230, 60); dot(svg, 230, 280);
    if (!open) {
      wire(svg, [[230, 60], [275, 60], [275, 280], [230, 280]]);
      if (!short) res(svg, 275, 170, "v", "R_L = " + fmt(s.RL, "Ω"), "e"); else text(svg, "short circuit", 283, 175, 13, tok("--muted"));
    } else text(svg, "open", 240, 175, 13, tok("--muted"));
    if (phase > 0) {
      // the load current runs round the outer loop; in the current-source model the rest of I₀ circulates through Rᵢ
      if (!open) flow(svg, [[70, 280], [70, 60], [275, 60], [275, 280], [70, 280]], r.I, phase, r.Ishort / 2);
      if (s.model === "i") flow(svg, [[70, 280], [70, 60], [150, 60], [150, 280], [70, 280]], r.Ishort - r.I, phase, r.Ishort / 2);
    }
    // terminal line
    var X0 = 360, X1 = 530, Y0 = 280, Y1 = 70, Imax = r.Ishort * 1.15, Umax = s.U0 * 1.15,
      X = function (i) { return X0 + (X1 - X0) * i / Imax; }, Y = function (u) { return Y0 - (Y0 - Y1) * u / Umax; };
    arrow(svg, X0, Y0, X1 + 10, Y0, tok("--muted")); arrow(svg, X0, Y0, X0, Y1 - 14, tok("--muted"));
    text(svg, "I", X1 + 6, Y0 + 18, 13, tok("--muted")); text(svg, "U", X0 - 8, Y1 - 10, 13, tok("--muted"), "end");
    line(svg, X(0), Y(s.U0), X(r.Ishort), Y(0), tok("--fau-mark"), 2.5);
    text(svg, fmt(s.U0, "V"), X0 - 6, Y(s.U0) + 4, 12, tok("--fau-mark"), "end"); text(svg, fmt(r.Ishort, "A"), X(r.Ishort), Y0 + 18, 12, tok("--fau-mark"), "middle");
    if (phase > 0) {
      var I = r.I * show, U = s.U0 - I * s.Ri;
      node("circle", { cx: X(I), cy: Y(U), r: 6.5, fill: tok("--act") }, svg);
      if (phase > 0.9) text(svg, "I = " + fmt(r.I, "A") + ", U = " + fmt(r.U, "V"), 445, 52, 13, tok("--act"), "middle", 700);
    }
    noteText(svg, s.note, phase); said(svg, guess);
  }

  // ---- 3.4 Kirchhoff: a node with wires, or a mesh of four parts
  function drawKirchhoff(svg, s, phase, guess) {
    if (s.type === "node") {
      reset(svg, "A node with currents on its wires");
      var cx = 280, cy = 170, n = s.wires.length;
      s.wires.forEach(function (w, i) {
        var a = -Math.PI / 2 + 2 * Math.PI * i / n, x = cx + 125 * Math.cos(a), y = cy + 108 * Math.sin(a),
          ax = cx + 92 * Math.cos(a), ay = cy + 80 * Math.sin(a), bx = cx + 45 * Math.cos(a), by = cy + 40 * Math.sin(a);
        line(svg, cx, cy, x, y, tok("--ink"), 2);
        var value = w.value === null ? (phase > 0.75 ? s.answerValue : null) : w.value, col = w.value === null ? tok("--act") : tok("--fau-mark");
        if (w.inward) arrow(svg, ax, ay, bx, by, col, 2.5); else arrow(svg, bx, by, ax, ay, col, 2.5);
        var lx = cx + 142 * Math.cos(a), ly = cy + 126 * Math.sin(a) + (Math.sin(a) > 0.5 ? 12 : 5);
        text(svg, w.label + " = " + (value === null ? "?" : fmt(value, "A")), lx, ly, 14, col, Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end", 700);
        if (value !== null && phase > 0) flow(svg, [[x, y], [cx, cy]], (w.inward ? 1 : -1) * value, phase, 2);
      });
      dot(svg, cx, cy);
      if (phase > 0.85) text(svg, s.sum, 280, 326, 15, tok("--act"), "middle", 800);
    } else {
      reset(svg, "A mesh of four parts with voltage arrows, travelled clockwise");
      var L = 150, R = 410, T = 70, B = 270, spots = { left: [L, 170], top: [280, T], right: [R, 170], bottom: [280, B] };
      wire(svg, [[L, T], [R, T], [R, B], [L, B], [L, T]]);
      s.items.forEach(function (it) {
        var p = spots[it.pos], v = it.pos === "left" || it.pos === "right";
        if (it.kind === "src") vsrc(svg, p[0], p[1], ""); else res(svg, p[0], p[1], v ? "v" : "h", "", "");
        // clockwise travel: up on the left, right along the top, down on the right, left along the bottom
        var dir = { left: [0, -1], top: [1, 0], right: [0, 1], bottom: [-1, 0] }[it.pos], sg = it.along ? 1 : -1, off = { left: [-40, 0], top: [0, -30], right: [40, 0], bottom: [0, 32] }[it.pos];
        var ax = p[0] + off[0], ay = p[1] + off[1], dx = dir[0] * sg * 22, dy = dir[1] * sg * 22;
        var value = it.value === null ? (phase > 0.75 ? s.answerValue : null) : it.value, col = it.value === null ? tok("--act") : tok("--fau-mark");
        arrow(svg, ax - dx, ay - dy, ax + dx, ay + dy, col, 2.5);
        var words = it.label + " = " + (value === null ? "?" : fmt(value, "V"));
        if (v) text(svg, words, ax + (it.pos === "left" ? -10 : 10), ay + 5, 14, col, it.pos === "left" ? "end" : "start", 700);
        else text(svg, words, ax, ay + (it.pos === "top" ? -12 : 22), 14, col, "middle", 700);
      });
      var cx2 = 280, cy2 = 170, rr = 34, pts = [];
      for (var k = 0; k <= 20; k++) { var t = (150 - 270 * k / 20) * Math.PI / 180; pts.push([cx2 + rr * Math.cos(t), cy2 - rr * Math.sin(t)]); }
      wire(svg, pts, tok("--muted")); head(svg, pts[19][0], pts[19][1], pts[20][0], pts[20][1], tok("--muted"));
      text(svg, "travel", cx2, cy2 + 5, 12, tok("--muted"), "middle");
      if (phase > 0.85) text(svg, s.sum, 280, 326, 15, tok("--act"), "middle", 800);
    }
    said(svg, guess);
  }

  // ---- 3.5 dividers: a voltage divider with an optional load, or a current divider
  function drawDivider(svg, s, phase, guess) {
    if (s.mode === "c") {
      reset(svg, "A current divider: two resistors in parallel fed by a current source");
      wire(svg, [[90, 70], [370, 70]]); wire(svg, [[90, 270], [370, 270]]); wire(svg, [[90, 70], [90, 270]]); wire(svg, [[250, 70], [250, 270]]); wire(svg, [[370, 70], [370, 270]]);
      isrc(svg, 90, 170, fmt(s.I, "A")); res(svg, 250, 170, "v", "R₁ = " + fmt(s.R1, "Ω"), "e"); res(svg, 370, 170, "v", "R₂ = " + fmt(s.R2, "Ω"), "e");
      dot(svg, 250, 70); dot(svg, 250, 270);
      var I1 = P.currentDivider(s.I, s.R1, s.R2), I2 = s.I - I1;
      if (phase > 0) { flow(svg, [[250, 70], [250, 270]], I1, phase, s.I / 2); flow(svg, [[370, 70], [370, 270]], I2, phase, s.I / 2); flow(svg, [[90, 270], [90, 70], [250, 70]], s.I, phase, s.I / 2); }
      if (phase > 0.9) { text(svg, "I₁ = " + fmt(I1, "A"), 262, 112, 13, tok("--act"), "start", 700); text(svg, "I₂ = " + fmt(I2, "A"), 382, 112, 13, tok("--act"), "start", 700); }
    } else {
      reset(svg, "A voltage divider with an optional load at the tap");
      var loaded = isFinite(s.RL);
      wire(svg, [[80, 50], [220, 50], [220, 290], [80, 290], [80, 50]]);
      vsrc(svg, 80, 170, fmt(s.U, "V")); res(svg, 220, 110, "v", "R₁ = " + fmt(s.R1, "Ω"), "w"); res(svg, 220, 230, "v", "R₂ = " + fmt(s.R2, "Ω"), "w");
      dot(svg, 220, 170); dot(svg, 220, 290);
      if (loaded) { wire(svg, [[220, 170], [310, 170], [310, 290], [220, 290]]); res(svg, 310, 230, "v", "R_L = " + fmt(s.RL, "Ω"), "e"); }
      else { wire(svg, [[220, 170], [290, 170]]); node("circle", { cx: 294, cy: 170, r: 4, fill: tok("--paper"), stroke: tok("--ink"), "stroke-width": 2 }, svg); text(svg, "no load", 302, 175, 13, tok("--muted")); }
      var U2 = P.divider(s.U, s.R1, s.R2, s.RL), Uun = P.divider(s.U, s.R1, s.R2, Infinity), I = s.U / (s.R1 + P.par(s.R2, s.RL));
      if (phase > 0) flow(svg, [[80, 290], [80, 50], [220, 50], [220, 170]], I, phase, s.U / (s.R1 + s.R2));
      // bars: unloaded tap voltage as an outline, this tap voltage filling up
      var bx = 430, by = 290, H = 220, Y = function (u) { return by - H * u / s.U; };
      line(svg, bx - 30, by, bx + 90, by, tok("--muted"), 1.5);
      node("rect", { x: bx, y: Y(Uun), width: 26, height: by - Y(Uun), fill: "none", stroke: tok("--fau-mark"), "stroke-width": 2, "stroke-dasharray": "5 4" }, svg);
      text(svg, "unloaded", bx + 13, by + 18, 12, tok("--fau-mark"), "middle"); text(svg, fmt(Uun, "V"), bx + 13, Y(Uun) - 8, 12, tok("--fau-mark"), "middle");
      var f = Math.min(1, phase * 1.3), u = U2 * f;
      if (phase > 0) node("rect", { x: bx + 44, y: Y(u), width: 26, height: by - Y(u), fill: tok("--act") }, svg);
      text(svg, "U₂", bx + 57, by + 18, 12, tok("--act"), "middle");
      if (phase > 0.9) text(svg, fmt(U2, "V"), bx + 57, Y(U2) - 8, 12, tok("--act"), "middle", 700);
    }
    noteText(svg, s.note, phase); said(svg, guess);
  }

  // ---- 3.5 maximum power: load power and efficiency against the load, on a log scale of R_L / R_i
  function drawPower(svg, s, phase, guess) {
    reset(svg, "Load power and efficiency against the load resistance");
    var X0 = 70, X1 = 520, Y0 = 280, Y1 = 60, lo = -1.3, hi = 1.3, pmax = P.maxPower(s.U0, s.Ri);
    function X(RL) { return X0 + (X1 - X0) * (Math.log10(RL / s.Ri) - lo) / (hi - lo); }
    function Y(f) { return Y0 - (Y0 - Y1) * f; }
    arrow(svg, X0, Y0, X1 + 10, Y0, tok("--muted")); arrow(svg, X0, Y0, X0, Y1 - 16, tok("--muted"));
    [0.1, 0.5, 1, 2, 10].forEach(function (m) { line(svg, X(m * s.Ri), Y0 - 4, X(m * s.Ri), Y0 + 4, tok("--muted"), 1.5); text(svg, fmt(m * s.Ri, "Ω"), X(m * s.Ri), Y0 + 18, 11, tok("--muted"), "middle"); });
    text(svg, "R_L", X1 + 6, Y0 - 8, 13, tok("--muted"), "end");
    text(svg, fmt(pmax, "W"), X0 - 6, Y(1) + 4, 11, tok("--fau-mark"), "end"); line(svg, X0 - 3, Y(1), X0 + 3, Y(1), tok("--muted"), 1.5);
    text(svg, "100 %", X0 - 6, Y(1) + 18, 11, tok("--muted"), "end");
    var pp = [], ee = [];
    for (var k = 0; k <= 60; k++) { var RL = s.Ri * Math.pow(10, lo + (hi - lo) * k / 60); pp.push([X(RL), Y(P.loadPower(s.U0, s.Ri, RL) / pmax)]); ee.push([X(RL), Y(P.efficiency(s.Ri, RL))]); }
    wire(svg, pp, tok("--fau-mark")); wire(svg, ee, tok("--muted"), "6 5");
    text(svg, "load power", X(0.07 * s.Ri), Y(0.6), 12, tok("--fau-mark")); text(svg, "efficiency η", X(6 * s.Ri), Y(0.9) - 10, 12, tok("--muted"), "middle");
    if (phase > 0) {
      var target = s.RL, start = s.from || s.Ri / 10, f = Math.min(1, phase * 1.25), RLn = start * Math.pow(target / start, f), pl = P.loadPower(s.U0, s.Ri, RLn), e = P.efficiency(s.Ri, RLn);
      line(svg, X(RLn), Y0, X(RLn), Y1, tok("--act"), 1.5, "3 4");
      node("circle", { cx: X(RLn), cy: Y(pl / pmax), r: 6.5, fill: tok("--act") }, svg);
      node("circle", { cx: X(RLn), cy: Y(e), r: 5, fill: tok("--paper"), stroke: tok("--act"), "stroke-width": 2 }, svg);
      if (phase > 0.9) text(svg, "R_L = " + fmt(target, "Ω") + ":  P_L = " + fmt(P.loadPower(s.U0, s.Ri, target), "W") + ",  η = " + Math.round(100 * P.efficiency(s.Ri, target)) + " %", 295, 40, 13, tok("--act"), "middle", 700);
    }
    noteText(svg, s.note, phase); said(svg, guess);
  }

  // ---- 3.6 superposition: U0 through R1 into a node, R2 to ground, I0 into the same node; either source can be off
  function drawSuper(svg, s, phase, guess) {
    reset(svg, "A node fed by a voltage source through R1 and by a current source, with R2 to ground");
    var r = P.superpose(s.U0, s.I0, s.R1, s.R2), uOn = s.on !== "i", iOn = s.on !== "u";
    wire(svg, [[70, 70], [330, 70]]); wire(svg, [[70, 270], [330, 270]]); wire(svg, [[220, 70], [220, 270]]);
    if (uOn) { wire(svg, [[70, 70], [70, 270]]); vsrc(svg, 70, 170, fmt(s.U0, "V")); }
    else { wire(svg, [[70, 70], [70, 270]], tok("--act")); text(svg, "off = short", 80, 175, 12, tok("--act")); }
    res(svg, 145, 70, "h", "R₁ = " + fmt(s.R1, "Ω")); res(svg, 220, 170, "v", "R₂ = " + fmt(s.R2, "Ω"), "e");
    if (iOn) { wire(svg, [[330, 70], [330, 270]]); isrc(svg, 330, 170, fmt(s.I0, "A")); }
    else { wire(svg, [[330, 70], [330, 145]], tok("--ink")); wire(svg, [[330, 195], [330, 270]], tok("--ink")); text(svg, "off = open", 340, 175, 12, tok("--act")); }
    dot(svg, 220, 70); dot(svg, 220, 270); text(svg, "n₂", 220, 56, 13, tok("--ink"), "middle", 700);
    var phi = s.on === "u" ? r.fromU : s.on === "i" ? r.fromI : r.phi;
    if (phase > 0) flow(svg, [[220, 70], [220, 270]], phi / s.R2, phase, 1);
    // stacked bars: the part from U0 and the part from I0 make up φ₂
    var bx = 440, by = 280, top = Math.max(r.phi, s.U0) * 1.1, Y = function (u) { return by - 210 * u / top; }, f = Math.min(1, phase * 1.3);
    line(svg, bx - 20, by, bx + 70, by, tok("--muted"), 1.5); text(svg, "φ₂", bx + 25, by + 18, 13, tok("--ink"), "middle", 700);
    if (phase > 0) {
      var a = uOn ? r.fromU * f : 0, b = iOn ? r.fromI * f : 0;
      if (a) node("rect", { x: bx, y: Y(a), width: 50, height: by - Y(a), fill: tok("--fau-mark") }, svg);
      if (b) node("rect", { x: bx, y: Y(a + b), width: 50, height: Y(a) - Y(a + b), fill: tok("--act") }, svg);
      if (phase > 0.9) {
        if (uOn) text(svg, "from U₀: " + fmt(r.fromU, "V"), bx - 8, Y(r.fromU / 2) + 4, 12, tok("--fau-mark"), "end", 700);
        if (iOn) text(svg, "from I₀: " + fmt(r.fromI, "V"), bx - 8, Y((uOn ? r.fromU : 0) + r.fromI / 2) + 4, 12, tok("--act"), "end", 700);
        text(svg, fmt(phi, "V"), bx + 25, Y(phi) - 8, 13, tok("--ink"), "middle", 800);
      }
    }
    noteText(svg, s.note, phase); said(svg, guess);
  }

  var DRAW = { sources: drawSource, kirchhoff: drawKirchhoff, dividers: drawDivider, power: drawPower, nodal: drawSuper };
  function option(key, label) { return [key, label]; }
  function ch(exp, id, ref, short, prompt, options, answer, why, spec, solve) {
    // the explanation is HTML: write R_L, P_L and P_L,max with real subscripts (the stage's text() does its own)
    why = why.replace(/P_\{?L,max\}?/g, "P<sub>L,max</sub>").replace(/([RP])_L/g, "$1<sub>L</sub>");
    return { id: id, ref: ref, short: short, prompt: prompt, options: options, answer: answer, why: why, solve: solve,
      draw: function (svg, phase, guess) { DRAW[exp](svg, typeof spec === "function" ? spec() : spec, phase, guess); } };
  }
  function near(a, b) { return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)); }

  // ---- fixed challenges; each solve() recomputes its answer from EEI3 (tests/eei-ch3-physics.test.js)
  var data = {
    sources: [
      ch("sources", "sources-terminal", "3.2", "Terminal voltage under load", "A source with U₀ = 12 V and Rᵢ = 2 Ω feeds a 4 Ω load. What voltage appears at the terminals?",
        [option("12", "12 V, a source keeps its voltage"), option("8", "8 V"), option("4", "4 V")], "8",
        "The current is 12 V ÷ (2 Ω + 4 Ω) = 2 A, and the internal resistance takes 2 A · 2 Ω = 4 V, so U = 12 V − 4 V = 8 V. Only an ideal source keeps 12 V; 4 V is the internal drop, not the terminal voltage.",
        { U0: 12, Ri: 2, RL: 4, model: "v", note: "U = U₀ − IRᵢ = 12 V − 4 V" },
        function () { return String(P.realSource(12, 2, 4).U); }),
      ch("sources", "sources-short", "3.2", "Short-circuit current", "The same 12 V, 2 Ω source is short-circuited. How much current flows?",
        [option("inf", "No limit: a short circuit has zero resistance"), option("12", "12 A"), option("6", "6 A")], "6",
        "Only the internal resistance is left in the loop, so I₀ = U₀ ÷ Rᵢ = 12 V ÷ 2 Ω = 6 A, and the terminal voltage drops to 0. An unlimited current would need an ideal source, which is why shorting an ideal voltage source is forbidden.",
        { U0: 12, Ri: 2, RL: 0, model: "v", note: "I₀ = U₀ ÷ Rᵢ: the line meets the I axis" },
        function () { return String(P.realSource(12, 2, 0).I); }),
      ch("sources", "sources-transform", "3.2", "Source transformation", "Which real current source behaves exactly like the 12 V, 2 Ω voltage source at its terminals?",
        [option("par", "6 A in parallel with 2 Ω"), option("ser", "6 A in series with 2 Ω"), option("24", "24 A in parallel with 2 Ω")], "par",
        "Both models need the same open-circuit voltage and short-circuit current, so I₀ = U₀ ÷ Rᵢ = 6 A with the same 2 Ω in parallel. A resistor in series with an ideal current source changes nothing at the terminals, and 24 A multiplies instead of dividing.",
        { U0: 12, Ri: 2, RL: 4, model: "i", note: "same terminal line, so the same 8 V across 4 Ω" },
        function () { var c = P.toCurrentSource(12, 2); return c.I0 === 6 && P.realSource(12, 2, 4).U === 8 ? "par" : "ser"; }),
      ch("sources", "sources-open-loss", "3.2", "Losses inside the models", "Both models of the 12 V, 2 Ω source are left with open terminals. Which one heats up inside?",
        [option("v", "The voltage-source model"), option("both", "Neither: no current leaves either source"), option("i", "The current-source model, 72 W")], "i",
        "In the voltage-source model no current flows, so nothing is lost. In the current-source model all 6 A circulate through the internal 2 Ω: 6 A · 6 A · 2 Ω = 72 W, which is U₀I₀. Equivalent at the terminals does not mean equivalent inside.",
        { U0: 12, Ri: 2, RL: Infinity, model: "i", note: "6 A circulates through Rᵢ: 72 W of heat" },
        function () { var l = P.openLoss(12, 2); return l.voltageModel === 0 && l.currentModel === 72 ? "i" : "v"; }),
    ],
    kirchhoff: [
      ch("kirchhoff", "kcl-out", "3.4", "Current at a node", "At a node, 5 A flows in on one wire and 2 A flows out on another. The third wire’s arrow points out. What does it carry?",
        [option("7", "7 A"), option("3", "3 A"), option("-3", "−3 A")], "3",
        "Kirchhoff’s current law: what flows in flows out, so 5 A = 2 A + I₃ and I₃ = 3 A, along its outward arrow. 7 A adds all the currents regardless of direction.",
        { type: "node", wires: [{ label: "I₁", value: 5, inward: true }, { label: "I₂", value: 2, inward: false }, { label: "I₃", value: null, inward: false }], answerValue: 3, sum: "in 5 A = out 2 A + 3 A" },
        function () { return String(P.kclOut([5], [2])); }),
      ch("kirchhoff", "kcl-sign", "3.4", "A negative current", "2 A flows in on I₁ and 3 A flows out on I₂. I₃’s arrow points in. What value does I₃ take?",
        [option("1", "1 A"), option("-1", "−1 A"), option("5", "5 A")], "1",
        "Count inward arrows positive: I₁ + I₃ − I₂ = 0, so I₃ = 3 A − 2 A = 1 A, flowing in as its arrow says. A negative value would only appear if the arrow pointed the wrong way.",
        { type: "node", wires: [{ label: "I₁", value: 2, inward: true }, { label: "I₂", value: 3, inward: false }, { label: "I₃", value: null, inward: true }], answerValue: 1, sum: "in 2 A + 1 A = out 3 A" },
        function () { return String(-P.kclOut([2], [3])); }),
      ch("kirchhoff", "kvl-close", "3.4", "Voltage round a mesh", "A 10 V source drives a mesh. Travelling clockwise, U₀ points against the travel; U₁ = 4 V and U₂ point along it, and U₃ = 0 V across a wire. What is U₂?",
        [option("14", "14 V"), option("6", "6 V"), option("-6", "−6 V")], "6",
        "Kirchhoff’s voltage law, clockwise: −U₀ + U₁ + U₂ + U₃ = 0, so U₂ = 10 V − 4 V = 6 V. The source voltage is shared out round the loop; adding it to U₁ gives 14 V, which breaks the law.",
        { type: "mesh", items: [{ pos: "left", kind: "src", label: "U₀", value: 10, along: false }, { pos: "top", kind: "res", label: "U₁", value: 4, along: true }, { pos: "right", kind: "res", label: "U₂", value: null, along: true }, { pos: "bottom", kind: "res", label: "U₃", value: 0, along: true }], answerValue: 6, sum: "−10 V + 4 V + 6 V + 0 V = 0" },
        function () { return String(P.kvlClose([[10, -1], [4, 1], [0, 1]], 1)); }),
      ch("kirchhoff", "kvl-against", "3.4", "An arrow against the travel", "The same mesh, but U₂’s arrow now points against the travel direction. What value does U₂ take?",
        [option("6", "6 V, the same as before"), option("14", "14 V"), option("-6", "−6 V")], "-6",
        "With the arrow reversed, U₂ enters the clockwise sum with a minus sign: −10 V + 4 V − U₂ + 0 = 0, so U₂ = −6 V. The physical voltage is unchanged; only the reference arrow flipped, so the sign flips.",
        { type: "mesh", items: [{ pos: "left", kind: "src", label: "U₀", value: 10, along: false }, { pos: "top", kind: "res", label: "U₁", value: 4, along: true }, { pos: "right", kind: "res", label: "U₂", value: null, along: false }, { pos: "bottom", kind: "res", label: "U₃", value: 0, along: true }], answerValue: -6, sum: "−10 V + 4 V − (−6 V) + 0 V = 0" },
        function () { return String(P.kvlClose([[10, -1], [4, 1], [0, 1]], -1)); }),
    ],
    dividers: [
      ch("dividers", "div-unloaded", "3.5", "Unloaded divider", "12 V across R₁ = 1 kΩ over R₂ = 2 kΩ, nothing at the tap. What is U₂ across R₂?",
        [option("4", "4 V"), option("8", "8 V"), option("6", "6 V")], "8",
        "One current flows through both resistors, so the voltage splits like the resistances: U₂ = 12 V · 2 kΩ ÷ 3 kΩ = 8 V. 4 V is the share of R₁; 6 V would need equal resistors.",
        { mode: "v", U: 12, R1: 1000, R2: 2000, RL: Infinity, note: "U₂ : U = R₂ : (R₁ + R₂) = 2 : 3" },
        function () { return String(P.divider(12, 1000, 2000)); }),
      ch("dividers", "div-loaded", "3.5", "A load at the tap", "A 2 kΩ load is now connected across R₂. What happens to U₂?",
        [option("8", "It stays 8 V: the divider fixes it"), option("6", "It drops to 6 V"), option("4", "It drops to 4 V")], "6",
        "The load sits in parallel with R₂: 2 kΩ ∥ 2 kΩ = 1 kΩ, so the divider is now 1 kΩ over 1 kΩ and U₂ = 12 V · 1 ÷ 2 = 6 V. The unloaded ratio only holds while nothing draws current from the tap.",
        { mode: "v", U: 12, R1: 1000, R2: 2000, RL: 2000, note: "R₂ ∥ R_L = 1 kΩ: the tap sags to 6 V" },
        function () { return String(P.divider(12, 1000, 2000, 2000)); }),
      ch("dividers", "div-big-load", "3.5", "A large load", "The load is changed to 200 kΩ. How close does U₂ come to the unloaded 8 V?",
        [option("same", "Almost exactly: about 7.97 V"), option("half", "It halves to 4 V"), option("6", "It stays at 6 V")], "same",
        "2 kΩ ∥ 200 kΩ ≈ 1.98 kΩ, so U₂ ≈ 12 V · 1.98 ÷ 2.98 ≈ 7.97 V. A load a hundred times R₂ barely changes the tap, which is why voltmeters need a large internal resistance.",
        { mode: "v", U: 12, R1: 1000, R2: 2000, RL: 200000, note: "R_L ≫ R₂: almost unloaded" },
        function () { var u = P.divider(12, 1000, 2000, 200000); return Math.abs(u - 7.97) < 0.01 ? "same" : "half"; }),
      ch("dividers", "div-current", "3.5", "Current divider", "30 mA flows into 1 kΩ in parallel with 2 kΩ. How much flows through the 1 kΩ resistor?",
        [option("10", "10 mA"), option("15", "15 mA, half each"), option("20", "20 mA")], "20",
        "Parallel branches share the voltage, so the current splits like the conductances: I₁ = 30 mA · 2 kΩ ÷ 3 kΩ = 20 mA. The smaller resistance takes the larger current, the opposite of the voltage divider.",
        { mode: "c", I: 0.03, R1: 1000, R2: 2000, note: "the smaller resistance takes the larger share" },
        function () { return String(Math.round(P.currentDivider(0.03, 1000, 2000) * 1e3)); }),
    ],
    power: [
      ch("power", "power-match", "3.5", "Best load", "A source has U₀ = 12 V and Rᵢ = 4 Ω. Which load resistance takes the most power?",
        [option("0", "As small as possible: the most current"), option("4", "4 Ω"), option("big", "As large as possible: the most voltage")], "4",
        "P_L = U₀²R_L ÷ (Rᵢ + R_L)² is zero for a short circuit (no voltage) and for an open circuit (no current). Its maximum lies in between, at R_L = Rᵢ = 4 Ω.",
        { U0: 12, Ri: 4, RL: 4, from: 0.25, note: "the peak sits at R_L = Rᵢ" },
        function () { var best = 0, bestP = 0; [0.5, 1, 2, 4, 8, 16, 32].forEach(function (r) { var p = P.loadPower(12, 4, r); if (p > bestP) { bestP = p; best = r; } }); return String(best); }),
      ch("power", "power-max", "3.5", "Maximum power", "How much power does that matched 4 Ω load take from the 12 V, 4 Ω source?",
        [option("36", "36 W"), option("9", "9 W"), option("18", "18 W")], "9",
        "At R_L = Rᵢ the current is 12 V ÷ 8 Ω = 1.5 A and the load gets 1.5 A · 1.5 A · 4 Ω = 9 W = U₀² ÷ 4Rᵢ. 36 W is U₀² ÷ Rᵢ, what the source would turn into heat in its own Rᵢ with the terminals shorted.",
        { U0: 12, Ri: 4, RL: 4, from: 0.25, note: "P_{L,max} = U₀² ÷ 4Rᵢ = 9 W" },
        function () { return String(P.maxPower(12, 4)); }),
      ch("power", "power-eta", "3.5", "Efficiency at the peak", "At maximum power transfer, what share of the source’s power reaches the load?",
        [option("50", "50 %"), option("100", "100 %, all of it"), option("25", "25 %")], "50",
        "At R_L = Rᵢ the same current flows through two equal resistances, so they take equal power: the load gets 9 W of the 18 W supplied, η = 50 %. Maximum power and maximum efficiency are different goals.",
        { U0: 12, Ri: 4, RL: 4, from: 0.25, note: "η = R_L ÷ (Rᵢ + R_L) = ½" },
        function () { return String(Math.round(100 * P.efficiency(4, 4))); }),
      ch("power", "power-double", "3.5", "Past the peak", "The load is doubled from 4 Ω to 8 Ω. What happens to the load power and the efficiency?",
        [option("both-down", "Both fall"), option("trade", "Power falls to 8 W, efficiency rises to 67 %"), option("both-up", "Both rise")], "trade",
        "With 8 Ω: I = 1 A, P_L = 8 W (a little below 9 W) and η = 8 ÷ 12 ≈ 67 %. Beyond the peak you trade a small loss of power for a large gain in efficiency, which is what power systems choose.",
        { U0: 12, Ri: 4, RL: 8, from: 4, note: "less power, much less waste" },
        function () { return near(P.loadPower(12, 4, 8), 8) && Math.round(100 * P.efficiency(4, 8)) === 67 ? "trade" : "both-down"; }),
    ],
    nodal: [
      ch("nodal", "super-u", "3.6", "Voltage source alone", "9 V feeds node n₂ through R₁ = 3 Ω; R₂ = 6 Ω goes to ground; a 1.5 A current source also feeds n₂. With the current source off, what is φ₂?",
        [option("6", "6 V"), option("9", "9 V"), option("3", "3 V")], "6",
        "A switched-off current source is an open circuit, so R₁ and R₂ form a plain divider: φ₂ = 9 V · 6 ÷ 9 = 6 V. 9 V would need R₁ to carry no voltage.",
        { U0: 9, I0: 1.5, R1: 3, R2: 6, on: "u", note: "current source off = open circuit" },
        function () { return String(P.superpose(9, 1.5, 3, 6).fromU); }),
      ch("nodal", "super-i", "3.6", "Current source alone", "Now the voltage source is off and only the 1.5 A source drives n₂. What is φ₂?",
        [option("9", "9 V, from 1.5 A · 6 Ω"), option("3", "3 V"), option("45", "4.5 V, from 1.5 A · 3 Ω")], "3",
        "A switched-off voltage source is a short circuit, so R₁ and R₂ are both connected from n₂ to ground: 3 Ω ∥ 6 Ω = 2 Ω, and φ₂ = 1.5 A · 2 Ω = 3 V. Using R₂ alone forgets that R₁ now also takes current.",
        { U0: 9, I0: 1.5, R1: 3, R2: 6, on: "i", note: "voltage source off = short circuit: R₁ ∥ R₂" },
        function () { return String(P.superpose(9, 1.5, 3, 6).fromI); }),
      ch("nodal", "super-both", "3.6", "Both sources", "Both sources are on. What is φ₂?",
        [option("9", "9 V"), option("6", "6 V, the larger part"), option("45", "4.5 V, the average")], "9",
        "The network is linear, so the partial potentials add: φ₂ = 6 V + 3 V = 9 V. Check with KCL at n₂: (9 V − 9 V) ÷ 3 Ω + 1.5 A = 9 V ÷ 6 Ω, that is 0 + 1.5 A = 1.5 A.",
        { U0: 9, I0: 1.5, R1: 3, R2: 6, on: "both", note: "6 V + 3 V: partial solutions add" },
        function () { var r = P.superpose(9, 1.5, 3, 6); return near((9 - r.phi) / 3 + 1.5, r.phi / 6) ? String(r.phi) : "6"; }),
      ch("nodal", "super-power", "3.6", "Powers do not add", "R₂ takes (6 V)² ÷ 6 Ω = 6 W from the first source alone and (3 V)² ÷ 6 Ω = 1.5 W from the second alone. With both on, it takes…",
        [option("75", "7.5 W, the sum"), option("more", "13.5 W, more than the sum"), option("less", "Less than 7.5 W")], "more",
        "With both on, φ₂ = 9 V and P = (9 V)² ÷ 6 Ω = 13.5 W. Power is quadratic: (6 + 3)² = 36 + 9 + 2 · 6 · 3, and the cross term 36 V² ÷ 6 Ω = 6 W is what adding the partial powers misses.",
        { U0: 9, I0: 1.5, R1: 3, R2: 6, on: "both", note: "13.5 W = 6 W + 1.5 W + 6 W cross term" },
        function () { var r = P.superpose(9, 1.5, 3, 6); return r.P2 > r.P2wrong ? "more" : "75"; }),
    ],
  };

  // ---- generated challenges: answers from EEI3, wrong options are real slips
  function pick(n) { return Math.floor(Math.random() * n); }
  function from(list) { return list[pick(list.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = pick(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mix(right, wrongs) {
    var out = [option(right, right)], seen = {}; seen[right] = true;
    wrongs.forEach(function (w) { if (w != null && !seen[w] && out.length < 3) { seen[w] = true; out.push(option(w, w)); } });
    return shuffle(out);
  }
  var generators = {
    sources: function () {
      var U0 = from([6, 9, 12, 24]), Ri = from([0.5, 1, 2, 3]), RL = from([1, 2, 3, 4, 6, 9]);
      while (RL === Ri) RL = from([1, 2, 3, 4, 6, 9]);
      var r = P.realSource(U0, Ri, RL), right = fmt(r.U, "V");
      return ch("sources", "gen-sources", "3.2", "Terminal voltage", "A source with U₀ = " + fmt(U0, "V") + " and Rᵢ = " + fmt(Ri, "Ω") + " feeds " + fmt(RL, "Ω") + ". What is the terminal voltage?",
        mix(right, [fmt(U0, "V"), fmt(U0 * Ri / (Ri + RL), "V")]), right,
        "I = " + fmt(U0, "V") + " ÷ (" + fmt(Ri, "Ω") + " + " + fmt(RL, "Ω") + ") = " + fmt(r.I, "A") + ", and U = U₀ − IRᵢ = " + right + ". The share U₀Rᵢ ÷ (Rᵢ + R_L) is the internal drop, not the terminal voltage.",
        { U0: U0, Ri: Ri, RL: RL, model: "v", note: "U = U₀ − IRᵢ = " + right });
    },
    kirchhoff: function () {
      var a = 1 + pick(9), b = 1 + pick(9), c = 1 + pick(Math.max(1, a + b - 1));
      var x = a + b - c, right = fmt(x, "A");
      return ch("kirchhoff", "gen-kirchhoff", "3.4", "Current at a node", a + " A and " + b + " A flow in on two wires and " + c + " A flows out on a third. The fourth wire’s arrow points out. What does it carry?",
        mix(right, [fmt(a + b + c, "A"), fmt(c - a - b, "A"), fmt(a - b + c, "A")]), right,
        "In equals out: " + a + " A + " + b + " A = " + c + " A + I₄, so I₄ = " + right + " along its outward arrow.",
        { type: "node", wires: [{ label: "I₁", value: a, inward: true }, { label: "I₂", value: b, inward: true }, { label: "I₃", value: c, inward: false }, { label: "I₄", value: null, inward: false }], answerValue: x, sum: "in " + (a + b) + " A = out " + c + " A + " + right });
    },
    dividers: function () {
      var U, R1, R2, RL, u, right, w1, w2;
      do { // re-draw until the right answer and both slips differ (R₁ = R₂ ∥ R_L makes two of them coincide)
        U = from([10, 12, 24]); R1 = 1000 * from([1, 2, 3, 4, 6]); R2 = 1000 * from([1, 2, 3, 4, 6]); RL = R2 * from([0.5, 1, 2]);
        u = P.divider(U, R1, R2, RL); right = fmt(u, "V"); w1 = fmt(P.divider(U, R1, R2), "V"); w2 = fmt(U * RL / (R1 + RL), "V");
      } while (right === w1 || right === w2 || w1 === w2);
      return ch("dividers", "gen-dividers", "3.5", "Loaded divider", fmt(U, "V") + " across R₁ = " + fmt(R1, "Ω") + " over R₂ = " + fmt(R2, "Ω") + ", with a load of " + fmt(RL, "Ω") + " across R₂. What is U₂?",
        mix(right, [w1, w2]), right,
        "R₂ ∥ R_L = " + fmt(P.par(R2, RL), "Ω") + ", so U₂ = " + fmt(U, "V") + " · " + fmt(P.par(R2, RL), "Ω") + " ÷ (" + fmt(R1, "Ω") + " + " + fmt(P.par(R2, RL), "Ω") + ") = " + right + ". The unloaded value " + fmt(P.divider(U, R1, R2), "V") + " ignores the load.",
        { mode: "v", U: U, R1: R1, R2: R2, RL: RL, note: "combine R₂ with R_L first" });
    },
    power: function () {
      var U0 = from([6, 10, 12, 20, 24]), Ri = from([1, 2, 4, 5, 8]), right = fmt(P.maxPower(U0, Ri), "W");
      return ch("power", "gen-power", "3.5", "Maximum power", "A source has U₀ = " + fmt(U0, "V") + " and Rᵢ = " + fmt(Ri, "Ω") + ". What is the most power a load can take?",
        mix(right, [fmt(U0 * U0 / Ri, "W"), fmt(U0 * U0 / (2 * Ri), "W"), fmt(U0 / (4 * Ri), "W")]), right,
        "The best load is R_L = Rᵢ = " + fmt(Ri, "Ω") + ", and then P_L,max = U₀² ÷ 4Rᵢ = (" + fmt(U0, "V") + ")² ÷ " + fmt(4 * Ri, "Ω") + " = " + right + ". U₀² ÷ Rᵢ forgets that the load only gets a quarter of that, and U₀ ÷ 4Rᵢ forgets the square.",
        { U0: U0, Ri: Ri, RL: Ri, from: Ri / 10, note: "R_L = Rᵢ: P_{L,max} = " + right });
    },
    nodal: function () {
      var U0 = from([6, 9, 12]), R1 = from([2, 3, 6]), R2 = from([2, 3, 6]), I0 = from([0.5, 1, 2]);
      var r = P.superpose(U0, I0, R1, R2), right = fmt(r.phi, "V");
      return ch("nodal", "gen-nodal", "3.6", "Superposition", fmt(U0, "V") + " feeds n₂ through R₁ = " + fmt(R1, "Ω") + ", R₂ = " + fmt(R2, "Ω") + " goes to ground, and " + fmt(I0, "A") + " is pushed into n₂. What is φ₂?",
        mix(right, [fmt(r.fromU, "V"), fmt(r.fromU + I0 * R2, "V"), fmt(r.fromU + I0 * R1, "V")]), right,
        "From U₀ alone (current source open): " + fmt(r.fromU, "V") + ". From I₀ alone (voltage source shorted, R₁ ∥ R₂ = " + fmt(P.par(R1, R2), "Ω") + "): " + fmt(r.fromI, "V") + ". Sum: " + right + ".",
        { U0: U0, I0: I0, R1: R1, R2: R2, on: "both", note: fmt(r.fromU, "V") + " + " + fmt(r.fromI, "V") });
    },
  };

  // ---- sandboxes
  function sandboxDraw(id, root, visual) {
    function val(name) { var el = root.querySelector("[data-control='" + name + "']"); return el ? el.value : ""; }
    function num(name) { var v = val(name); return v === "inf" ? Infinity : Number(v); }
    function own(name) { var el = root.querySelector("[data-own='" + name + "']"); return el ? el.value : ""; }
    function say(msg) { var el = root.querySelector("[data-own-msg]"); if (el) el.textContent = msg || ""; }
    function n(s) { var t = String(s).replace(/−/g, "-").replace(",", ".").trim(); return t === "" ? NaN : Number(t); }
    say("");
    if (id === "sources") drawSource(visual, { U0: num("U0"), Ri: num("Ri"), RL: num("RL"), model: val("model"), note: "" }, 1);
    else if (id === "kirchhoff") {
      var a = n(own("a")), b = n(own("b")), c = n(own("c"));
      if (![a, b, c].every(isFinite)) { reset(visual, "Waiting for three currents"); text(visual, "Type three currents to see the fourth.", 280, 180, 15, tok("--muted"), "middle"); return say("Type a current in amperes in each box, for example 2.5."); }
      var x = P.kclOut([a, b], [c]);
      drawKirchhoff(visual, { type: "node", wires: [{ label: "I₁", value: a, inward: true }, { label: "I₂", value: b, inward: true }, { label: "I₃", value: c, inward: false }, { label: "I₄", value: x, inward: false }], answerValue: x,
        sum: "I₄ = I₁ + I₂ − I₃ = " + fmt(x, "A") + (x < 0 ? ": it flows in, against its arrow" : "") }, 1);
    } else if (id === "dividers") {
      if (val("mode") === "c") drawDivider(visual, { mode: "c", I: num("U") / 1000, R1: num("R1"), R2: num("R2"), note: "" }, 1);
      else drawDivider(visual, { mode: "v", U: num("U"), R1: num("R1"), R2: num("R2"), RL: num("RL"), note: "" }, 1);
    } else if (id === "power") drawPower(visual, { U0: num("U0"), Ri: num("Ri"), RL: num("RL"), from: num("RL"), note: "" }, 1);
    else if (id === "nodal") drawSuper(visual, { U0: num("U0"), I0: num("I0"), R1: num("R1"), R2: num("R2"), on: val("on"), note: "" }, 1);
  }
  function register(id, title) {
    var root = document.querySelector("[data-experiment='" + id + "']"), visual = stage(id);
    function setup(c) { root.classList.remove("sandbox-open"); c.stage(); }
    function sandbox() {
      root.classList.add("sandbox-open");
      if (!root._bound) {
        root._bound = true;
        root.querySelectorAll("[data-control]").forEach(function (el) { el.addEventListener("change", function () { sandboxDraw(id, root, visual); }); });
        root.querySelectorAll("[data-own]").forEach(function (el) { el.addEventListener("input", function () { sandboxDraw(id, root, visual); }); });
      }
      sandboxDraw(id, root, visual);
    }
    function wrap(challenge) {
      var guess = null;
      function draw(phase) { challenge.draw(visual, phase, guess); }
      return Object.assign({}, challenge, {
        stage: function () { guess = null; draw(0); },
        preview: function (choice) { var sel = challenge.options.find(function (o) { return o[0] === choice; }); guess = sel && sel[1]; draw(0); },
        reveal: function () { return Lab.tween(1600, draw).then(function () { draw(1); }); },
      });
    }
    Lab.experiment({ id: id, title: title, card: root.querySelector(".challenge"), lock: function () {}, setup: setup, sandbox: sandbox,
      generate: function () { return wrap(generators[id]()); }, challenges: data[id].map(wrap) });
  }
  register("sources", "3.2 Real sources");
  register("kirchhoff", "3.4 Kirchhoff’s laws");
  register("dividers", "3.5 Dividers");
  register("power", "3.5 Maximum power");
  register("nodal", "3.6 Superposition");
})();
