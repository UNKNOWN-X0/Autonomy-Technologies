/* MEI Chapter 4 experiments: arithmetic and polar form in the Gaussian plane, powers, roots, and complex functions. */
(function () {
  var P = window.MEI4, ns = "http://www.w3.org/2000/svg", PI = Math.PI, CX = 280, CY = 184;
  function tok(name) { return getComputedStyle(document.body).getPropertyValue(name).trim(); }
  function node(tag, attrs, parent) {
    var el = document.createElementNS(ns, tag);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    parent.appendChild(el); return el;
  }
  function text(svg, words, x, y, size, color, anchor, weight) {
    var el = node("text", { x: x, y: y, fill: color || tok("--ink"), "font-size": size || 15, "font-family": "var(--f-display)", "text-anchor": anchor || "start" }, svg);
    if (weight) el.setAttribute("font-weight", weight);
    el.textContent = words; return el;
  }
  function line(svg, x1, y1, x2, y2, color, width, dash) {
    return node("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || tok("--line"), "stroke-width": width || 2, "stroke-dasharray": dash || "", "stroke-linecap": "round" }, svg);
  }
  function reset(svg, label) { svg.innerHTML = ""; svg.setAttribute("role", "img"); svg.setAttribute("aria-label", label); }
  function stage(id) { return document.querySelector("[data-visual='" + id + "']"); }

  // ---- number formatting: Unicode minus, at most two decimals, a + bi with the i forms the notes use
  function num(v) {
    var r = Math.round(v * 100) / 100;
    if (Object.is(r, -0)) r = 0;
    return String(r).replace("-", "−");
  }
  function cfmt(z) {
    var a = Math.round(z[0] * 100) / 100, b = Math.round(z[1] * 100) / 100;
    if (Object.is(a, -0)) a = 0; if (Object.is(b, -0)) b = 0;
    var bi = Math.abs(b) === 1 ? "i" : num(Math.abs(b)) + "i";
    if (b === 0) return num(a);
    if (a === 0) return (b < 0 ? "−" : "") + bi;
    return num(a) + (b < 0 ? " − " : " + ") + bi;
  }
  // an angle as a multiple of π with denominator 12 or smaller (“5π/4”, “π”, “0”); falls back to radians
  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
  function ang(phi) {
    var n = Math.round(phi / PI * 12);
    if (Math.abs(n * PI / 12 - phi) > 1e-9) return num(phi) + " rad";
    if (n === 0) return "0";
    var g = gcd(Math.abs(n), 12), p = n / g, q = 12 / g, sign = p < 0 ? "−" : "", top = Math.abs(p) === 1 ? "π" : Math.abs(p) + "π";
    return sign + top + (q === 1 ? "" : "/" + q);
  }

  // ---- the shared stage: a Gaussian plane with given points, animated results, an optional circle and polygon
  function plane(svg, spec, phase, said) {
    reset(svg, spec.label || "Gaussian plane with complex numbers as points");
    var s = spec.scale || 48, X = function (z) { return CX + s * z[0]; }, Y = function (z) { return CY - s * z[1]; };
    line(svg, 40, CY, 520, CY); line(svg, CX, 30, CX, 330);
    text(svg, "Re", 516, CY - 8, 13, tok("--muted"), "end"); text(svg, "Im", CX + 8, 42, 13, tok("--muted"));
    line(svg, CX + s, CY - 4, CX + s, CY + 4, tok("--muted"), 2); text(svg, "1", CX + s, CY + 18, 12, tok("--muted"), "middle");
    line(svg, CX - 4, CY - s, CX + 4, CY - s, tok("--muted"), 2); text(svg, "i", CX - 9, CY - s + 4, 12, tok("--muted"), "end");
    if (spec.circle) node("circle", { cx: CX, cy: CY, r: s * spec.circle, fill: "none", stroke: tok("--line"), "stroke-width": 1.5, "stroke-dasharray": "4 4" }, svg);
    function dot(z, label, color, filled) {
      node("circle", { cx: X(z), cy: Y(z), r: 6.5, fill: filled ? color : tok("--paper"), stroke: color, "stroke-width": 2.5 }, svg);
      if (label) {
        var r = Math.hypot(z[0], z[1]) || 1, dx = z[0] / r, dy = -z[1] / r;
        if (!isFinite(dx)) { dx = 1; dy = 0; }
        text(svg, label, X(z) + 16 * dx + (dx >= 0 ? 4 : -4), Y(z) + 16 * dy + 5, 13, color, dx >= 0 ? "start" : "end", 700);
      }
    }
    (spec.given || []).forEach(function (g) {
      line(svg, CX, CY, X(g.z), Y(g.z), tok("--fau-mark"), 2);
      dot(g.z, g.label, tok("--fau-mark"), false);
    });
    (spec.path || []).forEach(function (seg) { // helper segments such as the parallelogram of a sum
      if (phase > 0.25) line(svg, X(seg[0]), Y(seg[0]), X(seg[1]), Y(seg[1]), tok("--muted"), 1.5, "5 5");
    });
    var res = spec.result || [];
    if (spec.polygon && res.length > 2 && phase > 0.6) {
      node("polygon", { points: res.map(function (r) { return X(r.z) + "," + Y(r.z); }).join(" "), fill: "none", stroke: tok("--course"), "stroke-width": 2, "stroke-dasharray": "6 4" }, svg);
    }
    if (spec.spiral && res.length > 1) {
      var shown = Math.max(1, Math.ceil(res.length * Math.min(1, phase * 1.25)));
      node("polyline", { points: res.slice(0, shown).map(function (r) { return X(r.z) + "," + Y(r.z); }).join(" "), fill: "none", stroke: tok("--course"), "stroke-width": 2 }, svg);
    }
    res.forEach(function (r, i) {
      var t = spec.spiral ? (i + 1) / res.length <= Math.min(1, phase * 1.25) ? 1 : 0 : Math.min(1, phase * 1.4);
      if (t <= 0) return;
      var z = [r.z[0] * t, r.z[1] * t];
      if (!spec.spiral) line(svg, CX, CY, X(z), Y(z), tok("--act"), 3);
      if (t >= 1) dot(r.z, r.label, tok("--act"), true);
    });
    if (spec.note && phase > 0.82) text(svg, spec.note, 280, 322, 15, tok("--act"), "middle", 800);
    if (said) text(svg, "Your prediction: " + said, 280, 348, 13, tok("--muted"), "middle");
  }
  function pts(list) { return list.map(function (p) { return { z: p[0], label: p[1] }; }); }

  function option(key, label) { return [key, label]; }
  function ch(id, ref, short, prompt, options, answer, why, spec, solve) {
    return { id: id, ref: ref, short: short, prompt: prompt, options: options, answer: answer, why: why,
      draw: function (svg, phase, said) { plane(svg, typeof spec === "function" ? spec() : spec, phase, said); }, solve: solve };
  }

  // ---- fixed challenges; each solve() recomputes its answer from MEI4 (tests/mei-ch4-physics.test.js)
  var I = [0, 1];
  var data = {
    arith: [
      ch("arith-times-i", "4.1", "Multiplying by i", "Where does (2 + i) · i land in the plane?",
        [option("rot", "−1 + 2i, a quarter turn counterclockwise"), option("same", "2 + 2i, only the imaginary part grows"), option("flip", "1 − 2i, a quarter turn clockwise")], "rot",
        "i(2 + i) = 2i + i² = −1 + 2i. Multiplying by i keeps the length (|2 + i| = √5 both times) and turns the point by π/2 counterclockwise; it does not just add to the imaginary part.",
        { given: pts([[[2, 1], "2 + i"]]), result: pts([[[-1, 2], "i(2 + i)"]]), note: "same length, turned by π/2" },
        function () { var r = P.mul([2, 1], I); return P.near(r, [-1, 2]) ? "rot" : "same"; }),
      ch("arith-sum", "4.1", "Adding as arrows", "What is (1 + 2i) + (2 − 3i)?",
        [option("mul", "8 + i"), option("sum", "3 − i"), option("wrong", "3 + 5i")], "sum",
        "Add real parts and imaginary parts separately: (1 + 2) + (2 − 3)i = 3 − i. In the plane, the sum is the far corner of the parallelogram built on the two arrows. 8 + i is the product, not the sum.",
        { given: pts([[[1, 2], "1 + 2i"], [[2, -3], "2 − 3i"]]), path: [[[1, 2], [3, -1]], [[2, -3], [3, -1]]], result: pts([[[3, -1], "sum"]]), note: "parallelogram rule: 3 − i", scale: 40 },
        function () { return P.near(P.add([1, 2], [2, -3]), [3, -1]) ? "sum" : "mul"; }),
      ch("arith-modsq", "4.1", "Magnitude squared", "For z = 1 + i, what is z · z̄?",
        [option("2i", "2i, the same as z²"), option("0", "0"), option("2", "2, a real number")], "2",
        "z · z̄ = (1 + i)(1 − i) = 1 − i² = 2 = |z|², a real number. Squaring is different: (1 + i)² = 2i. Only for real numbers are |x|² and x² the same.",
        { given: pts([[[1, 1], "z"], [[1, -1], "z̄"]]), result: pts([[[2, 0], "z · z̄ = 2"]]), note: "z · z̄ = |z|² is real" },
        function () { var r = P.mul([1, 1], P.conj([1, 1])); return P.near(r, [2, 0]) ? "2" : "2i"; }),
      ch("arith-divide", "4.1", "Dividing", "What is 1 ÷ (1 + i) in normal form?",
        [option("half", "½ − ½i"), option("naive", "1 − i"), option("plus", "½ + ½i")], "half",
        "Multiply top and bottom by the conjugate 1 − i: (1 − i) ÷ ((1 + i)(1 − i)) = (1 − i) ÷ 2 = ½ − ½i. Writing 1 − i forgets to divide by |1 + i|² = 2, and the sign of the imaginary part flips because the conjugate is used.",
        { given: pts([[[1, 1], "1 + i"]]), result: pts([[[0.5, -0.5], "½ − ½i"]]), note: "half the length, angle −π/4", scale: 64 },
        function () { return P.near(P.div([1, 0], [1, 1]), [0.5, -0.5]) ? "half" : "naive"; }),
    ],
    polar: [
      ch("polar-quadrant", "4.1", "Angle and quadrant", "What is the argument of z = −1 − i, with 0 ≤ φ < 2π?",
        [option("raw", "π/4, from arctan 1"), option("right", "5π/4"), option("neg", "−3π/4")], "right",
        "tan φ = (−1) ÷ (−1) = 1, but arctan 1 = π/4 points into quadrant I. Both parts are negative, so the point is in quadrant III and φ = π/4 + π = 5π/4. −3π/4 is the same direction but lies outside [0, 2π).",
        { given: pts([[[-1, -1], "−1 − i"]]), result: pts([[[-1, -1], "φ = 5π/4"]]), circle: Math.SQRT2, note: "quadrant III: add π to arctan", scale: 64 },
        function () { return Math.abs(P.arg([-1, -1]) - 5 * PI / 4) < 1e-12 ? "right" : "raw"; }),
      ch("polar-length", "4.1", "Magnitude", "What is |3 − 4i|?",
        [option("7", "7"), option("1", "−1"), option("5", "5")], "5",
        "|a + ib| = √(a² + b²) = √(9 + 16) = 5, the distance from the origin. Adding the parts (7) or keeping the sign of b (−1) ignores Pythagoras.",
        { given: pts([[[3, -4], "3 − 4i"]]), path: [[[3, 0], [3, -4]], [[0, 0], [3, 0]]], result: pts([[[3, -4], "|z| = 5"]]), circle: 5, note: "Pythagoras: 3² + 4² = 5²", scale: 30 },
        function () { return String(P.abs([3, -4])); }),
      ch("polar-product", "4.1", "Angles add", "What is 2e^(iπ/3) · e^(iπ/6)?",
        [option("2i", "2i"), option("pi18", "2e^(iπ²/18)"), option("2", "2")], "2i",
        "Multiply the lengths and add the angles: 2 · 1 = 2 and π/3 + π/6 = π/2, so the product is 2e^(iπ/2) = 2i. Angles are added, not multiplied.",
        { given: pts([[P.fromPolar(2, PI / 3), "2e^(iπ/3)"], [P.fromPolar(1, PI / 6), "e^(iπ/6)"]]), result: pts([[[0, 2], "2i"]]), circle: 2, note: "lengths multiply, angles add" },
        function () { var r = P.mul(P.fromPolar(2, PI / 3), P.fromPolar(1, PI / 6)); return P.near(r, [0, 2]) ? "2i" : "2"; }),
      ch("polar-conjugate", "4.1", "Conjugate in polar form", "For z = 2e^(iπ/3), which is z̄ with its angle in [0, 2π)?",
        [option("pi3", "2e^(iπ/3)"), option("conj", "2e^(i5π/3)"), option("half", "½e^(iπ/3)")], "conj",
        "The conjugate reflects z in the real axis: same length, opposite angle. −π/3 lies outside [0, 2π), so add 2π: z̄ = 2e^(i5π/3) = 1 − i√3. ½e^(iπ/3) would be the reciprocal’s length, not the conjugate.",
        { given: pts([[P.fromPolar(2, PI / 3), "z"]]), result: pts([[P.fromPolar(2, 5 * PI / 3), "z̄ = 2e^(i5π/3)"]]), circle: 2, note: "mirror in the real axis" },
        function () { return Math.abs(P.arg(P.conj(P.fromPolar(2, PI / 3))) - 5 * PI / 3) < 1e-12 ? "conj" : "pi3"; }),
    ],
    powers: [
      ch("powers-fourth", "4.2", "A fourth power", "What is (1 + i)⁴?",
        [option("4i", "4i"), option("-4", "−4"), option("4", "4")], "-4",
        "1 + i = √2 e^(iπ/4). De Moivre: length (√2)⁴ = 4, angle 4 · π/4 = π, so (1 + i)⁴ = 4e^(iπ) = −4. The angle multiplies by the power; it does not stay π/4.",
        function () { var out = []; for (var k = 1; k <= 4; k++) out.push([P.pow([1, 1], k), "(1 + i)" + ["", "²", "³", "⁴"][k - 1]]); return { given: pts([[[1, 1], ""]]), result: pts(out), spiral: true, note: "length ×√2, angle +π/4 each step", scale: 34 }; },
        function () { return P.near(P.pow([1, 1], 4), [-4, 0]) ? "-4" : "4"; }),
      ch("powers-i", "4.2", "Powers of i", "What is i⁷?",
        [option("i", "i"), option("-1", "−1"), option("-i", "−i")], "-i",
        "Each factor i turns by π/2, and four turns make a full circle: i⁴ = 1. So i⁷ = i⁴ · i³ = i³ = −i. The angle 7π/2 reduces to 3π/2.",
        function () { var out = []; for (var k = 1; k <= 7; k++) out.push([P.pow(I, k), k === 7 ? "i⁷" : ""]); return { result: pts(out), spiral: true, circle: 1, note: "7 quarter turns = 3 quarter turns", scale: 80 }; },
        function () { return P.near(P.pow(I, 7), [0, -1]) ? "-i" : "i"; }),
      ch("powers-length", "4.2", "Length of a power", "How long is (1 + 2i)³ (its magnitude)?",
        [option("125", "125"), option("5r5", "5√5 ≈ 11.2"), option("15", "15")], "5r5",
        "The length is raised to the power: |1 + 2i|³ = (√5)³ = 5√5 ≈ 11.2. Cubing |1 + 2i|² = 5 gives 125, and 15 adds instead of multiplying.",
        function () { var out = []; for (var k = 1; k <= 3; k++) out.push([P.pow([1, 2], k), k === 3 ? "(1 + 2i)³" : ""]); return { given: pts([[[1, 2], "1 + 2i"]]), result: pts(out), spiral: true, note: "|z³| = |z|³ = 5√5", scale: 13 }; },
        function () { return Math.abs(P.abs(P.pow([1, 2], 3)) - 5 * Math.sqrt(5)) < 1e-9 ? "5r5" : "125"; }),
      ch("powers-cycle", "4.2", "Back to 1", "For z = e^(iπ/3), what is the smallest k ≥ 1 with zᵏ = 1?",
        [option("3", "3"), option("6", "6"), option("never", "Never: the powers keep moving")], "6",
        "Each power turns by another π/3 on the unit circle. After 6 steps the angle is 2π, a full turn, so z⁶ = 1. After 3 steps the angle is π, which gives −1.",
        function () { var out = []; for (var k = 1; k <= 6; k++) out.push([P.pow(P.fromPolar(1, PI / 3), k), k === 3 ? "z³ = −1" : k === 6 ? "z⁶ = 1" : ""]); return { result: pts(out), spiral: true, polygon: true, circle: 1, note: "six steps of π/3 make 2π", scale: 80 }; },
        function () { for (var k = 1; k < 20; k++) if (P.near(P.pow(P.fromPolar(1, PI / 3), k), [1, 0], 1e-9)) return String(k); return "never"; }),
    ],
    roots: [
      ch("roots-count", "4.2", "How many roots", "How many different complex solutions does w⁵ = 1 have?",
        [option("1", "1, only w = 1"), option("5", "5"), option("2", "2, w = ±1")], "5",
        "A nonzero complex number has exactly n different n-th roots. Here they are e^(i2kπ/5) for k = 0, …, 4: the corners of a regular pentagon on the unit circle. Over the reals only w = 1 works.",
        { result: pts(P.roots([1, 0], 5).map(function (z, k) { return [z, "w" + "₀₁₂₃₄"[k]]; })), polygon: true, circle: 1, note: "five corners, 2π/5 apart", scale: 96 },
        function () { return String(P.roots([1, 0], 5).length); }),
      ch("roots-square", "4.2", "Square roots of a negative", "Which numbers w solve w² = −4?",
        [option("none", "None; a square cannot be negative"), option("pm2", "2 and −2"), option("pm2i", "2i and −2i")], "pm2i",
        "−4 = 4e^(iπ). The roots have length √4 = 2 and angles π/2 and 3π/2: 2i and −2i. In ℂ every nonzero number has two square roots; 2 and −2 square to +4.",
        { given: pts([[[-4, 0], "−4"]]), result: pts([[[0, 2], "2i"], [[0, -2], "−2i"]]), circle: 2, note: "length 2, angles π/2 and 3π/2", scale: 40 },
        function () { var r = P.roots([-4, 0], 2); return P.near(r[0], [0, 2]) && P.near(r[1], [0, -2]) ? "pm2i" : "pm2"; }),
      ch("roots-spacing", "4.2", "Spacing of roots", "w⁶ = 64i has six solutions. What angle separates neighbouring roots?",
        [option("pi3", "π/3"), option("pi6", "π/6"), option("pi12", "π/12")], "pi3",
        "The roots are 2e^(i(π/2 + 2kπ)/6), so neighbours differ by 2π/6 = π/3: the corners of a regular hexagon of radius 2. π/12 is the angle of the first root, not the spacing.",
        { given: pts([[[0, 2.6], "64i (not to scale)"]]), result: pts(P.roots([0, 64], 6).map(function (z) { return [z, ""]; })), polygon: true, circle: 2, note: "neighbours 2π/6 = π/3 apart", scale: 48 },
        function () { var r = P.roots([0, 64], 6), d = P.wrap(P.arg(r[1]) - P.arg(r[0])); return Math.abs(d - PI / 3) < 1e-9 ? "pi3" : "pi6"; }),
      ch("roots-sum", "4.2", "Roots balance", "What is the sum of the three cube roots of 8?",
        [option("6", "6"), option("2", "2"), option("0", "0")], "0",
        "The cube roots of 8 are 2, −1 + i√3 and −1 − i√3, the corners of an equilateral triangle centred at the origin. Their sum is 2 − 1 − 1 + i(√3 − √3) = 0. Adding only the real root gives 2.",
        { result: pts(P.roots([8, 0], 3).map(function (z) { return [z, cfmt(z).replace("1.73", "√3")]; })), polygon: true, circle: 2, note: "centred triangle: the corners add to 0", scale: 56 },
        function () { var s = P.roots([8, 0], 3).reduce(P.add, [0, 0]); return P.near(s, [0, 0], 1e-9) ? "0" : "2"; }),
    ],
    functions: [
      ch("functions-pair", "4.3", "Conjugate zeros", "A polynomial with real coefficients has the zero 2 + 3i. Which other number must be a zero?",
        [option("conj", "2 − 3i"), option("neg", "−2 − 3i"), option("none", "None is forced")], "conj",
        "Conjugating P(z₀) = 0 leaves real coefficients unchanged, so P(z̄₀) = 0 too: 2 − 3i is a zero. Together they give the real factor z² − 4z + 13. The rule needs real coefficients.",
        { given: pts([[[2, 3], "2 + 3i"]]), path: [[[2, 3], [2, -3]]], result: pts([[[2, -3], "2 − 3i"]]), note: "mirror image in the real axis: z² − 4z + 13", scale: 40 },
        function () { var q = P.pairQuadratic([2, 3]); return P.near(P.poly(q, [2, -3]), [0, 0]) && q[1] === -4 && q[2] === 13 ? "conj" : "none"; }),
      ch("functions-exp-length", "4.3", "Length of e^z", "What is |e^(1 + iπ)|?",
        [option("1", "1"), option("e", "e ≈ 2.72"), option("-e", "−e")], "e",
        "e^(x + iy) = eˣ(cos y + i sin y): the real part sets the length, the imaginary part only turns. So |e^(1 + iπ)| = e¹ ≈ 2.72; the number itself is −e, but a length is never negative.",
        { given: pts([[[1, PI], "z = 1 + iπ (not to scale)"]].map(function (p) { return [[1, 2.4], p[1]]; })), result: pts([[P.exp([1, PI]), "e^z = −e"]]), circle: Math.E, note: "length e¹, angle π", scale: 40 },
        function () { return Math.abs(P.abs(P.exp([1, PI])) - Math.E) < 1e-9 ? "e" : "1"; }),
      ch("functions-log", "4.3", "Logarithm of −1", "With the notes’ angle range 0 ≤ φ < 2π, what is ln(−1)?",
        [option("ipi", "iπ"), option("undef", "Undefined"), option("-ipi", "−iπ")], "ipi",
        "−1 = 1 · e^(iπ), so ln(−1) = ln 1 + iπ = iπ. In ℂ negative numbers have logarithms. −iπ has the same exponential, but its angle −π lies outside the notes’ range.",
        { given: pts([[[-1, 0], "−1"]]), result: pts([[[0, PI], "ln(−1) = iπ"]]), note: "ln|z| = 0, angle π", scale: 48 },
        function () { var l = P.log([-1, 0]); return P.near(l, [0, PI]) ? "ipi" : "undef"; }),
      ch("functions-period", "4.3", "Period of e^z", "How does e^z change when you add 2πi to z?",
        [option("same", "It does not change"), option("double", "Its length doubles"), option("rot", "It turns by π")], "same",
        "e^(z + 2πi) = e^z · e^(2πi) = e^z · 1. Adding 2πi turns by a full circle, so e^z has period 2πi; this is why ln z must fix an angle range.",
        function () { var z = [0.3, PI / 4]; return { given: pts([[P.exp(z), "e^z"]]), result: pts([[P.exp([z[0], z[1] + 2 * PI]), "e^(z + 2πi)"]]), circle: Math.exp(0.3), note: "a full turn lands on the same point", scale: 80 }; },
        function () { var z = [0.3, PI / 4]; return P.near(P.exp(z), P.exp([z[0], z[1] + 2 * PI])) ? "same" : "rot"; }),
    ],
  };

  // ---- endless practice: generated challenges with computed answers (tests/lab-generators.test.js)
  function pick(n) { return Math.floor(Math.random() * n); }
  function shuffle(o) { for (var i = o.length - 1; i > 0; i--) { var j = pick(i + 1), t = o[i]; o[i] = o[j]; o[j] = t; } return o; }
  // the right answer plus up to two distinct wrong ones, as [key, label] pairs keyed by their label
  function mix(right, wrongs) {
    var out = [option(right, right)], seen = {}; seen[right] = true;
    wrongs.forEach(function (w) { if (w != null && !seen[w] && out.length < 3) { seen[w] = true; out.push(option(w, w)); } });
    return shuffle(out);
  }
  function nz() { var v = pick(7) - 3; return v; }
  var generators = {
    arith: function () {
      var a, b, c, d;
      do { a = nz(); b = nz(); c = nz(); d = nz(); } while (b === 0 || d === 0 || (a === 0 && c === 0));
      var z = [a, b], w = [c, d], r = P.mul(z, w), right = cfmt(r);
      return ch("gen-arith", "4.1", "Product in normal form", "What is (" + cfmt(z) + ")(" + cfmt(w) + ")?",
        mix(right, [cfmt([a * c + b * d, a * d + b * c]), cfmt([a * c, b * d]), cfmt([a * c - b * d, -(a * d + b * c)])]), right,
        "Multiply out and replace i² by −1: real part " + num(a) + "·" + num(c) + " − " + num(b) + "·" + num(d) + " = " + num(r[0]) + ", imaginary part " + num(a) + "·" + num(d) + " + " + num(b) + "·" + num(c) + " = " + num(r[1]) + ". So the product is " + right + ".",
        { given: pts([[z, cfmt(z)], [w, cfmt(w)]]), result: pts([[r, right]]), note: "lengths multiply, angles add", scale: Math.max(8, Math.min(48, 130 / Math.max(P.abs(z), P.abs(w), P.abs(r)))) });
    },
    polar: function () {
      var step = pick(2) ? PI / 4 : PI / 6, k, phi;
      do { k = pick(Math.round(2 * PI / step)); phi = k * step; } while (Math.abs(Math.cos(phi)) < 1e-9);
      var r = 1 + pick(3), z = P.fromPolar(r, phi), right = ang(phi), raw = Math.atan(z[1] / z[0]);
      var shown = cfmt(z).replace(/1\.73/g, "√3").replace(/0\.87/g, "√3/2").replace(/1\.41/g, "√2").replace(/2\.12/g, "3√2/2").replace(/2\.6/g, "3√3/2");
      return ch("gen-polar", "4.1", "Argument with quadrant", "What is the argument φ of z = " + shown + ", with 0 ≤ φ < 2π?",
        mix(right, [ang(raw), ang(P.wrap(phi + PI)), ang(P.wrap(2 * PI - phi))]), right,
        "Start from arctan(b/a) = " + ang(raw) + ", then use the quadrant from the signs of a and b: " + (z[0] < 0 ? "a < 0, so add π" : z[1] < 0 ? "a > 0 and b < 0, so add 2π" : "both are non-negative, so keep it") + ". φ = " + right + ".",
        { given: pts([[z, "z"]]), result: pts([[z, "φ = " + right]]), circle: r, note: "check the quadrant first", scale: 40 });
    },
    powers: function () {
      var step = pick(2) ? PI / 4 : PI / 6, m = 1 + pick(5), k = 2 + pick(5), th = m * step, right = ang(P.wrap(k * th));
      var wrongs = [k * th >= 2 * PI - 1e-9 ? ang(k * th) : null, ang(th), ang(P.wrap((k + 1) * th)), ang(P.wrap((k - 1) * th))];
      return ch("gen-powers", "4.2", "Angle of a power", "z = e^(i" + ang(th) + "). What is the angle of z" + "⁰¹²³⁴⁵⁶⁷⁸⁹"[k] + " in [0, 2π)?",
        mix(right, wrongs), right,
        "De Moivre: the angle multiplies by the power, " + k + " · " + ang(th) + " = " + ang(k * th) + (k * th >= 2 * PI - 1e-9 ? ", which reduces to " + right + " after removing whole turns." : "."),
        function () { var out = []; for (var j = 1; j <= k; j++) out.push([P.pow(P.fromPolar(1, th), j), j === k ? "z" + "⁰¹²³⁴⁵⁶⁷⁸⁹"[k] : ""]); return { result: pts(out), spiral: true, circle: 1, note: "angle " + right, scale: 80 }; });
    },
    roots: function () {
      var pairs = [[2, 2], [2, 3], [3, 2], [3, 3], [4, 2], [5, 2], [6, 2], [4, 3]], q = pairs[pick(pairs.length)], n = q[0], root = q[1], r = Math.pow(root, n);
      var dirs = [[0, "", [1, 0]], [PI, "−", [-1, 0]], [PI / 2, "i", [0, 1]]], d = dirs[pick(dirs.length)], z = [r * d[2][0], r * d[2][1]];
      var zs = d[0] === PI / 2 ? r + "i" : d[1] + r, right = String(root);
      return ch("gen-roots", "4.2", "Length of the roots", "w" + "⁰¹²³⁴⁵⁶⁷⁸⁹"[n] + " = " + zs + " has " + n + " solutions. How long is each of them?",
        mix(right, [String(r), num(r / n), String(root * root)]), right,
        "Every root has length |z|^(1/" + n + ") = " + r + "^(1/" + n + ") = " + root + ", because |w|" + "⁰¹²³⁴⁵⁶⁷⁸⁹"[n] + " = |z|. Only the angles differ: they are " + ang(2 * PI / n) + " apart.",
        { result: pts(P.roots(z, n).map(function (w) { return [w, ""]; })), polygon: n > 2, circle: root, note: "all " + n + " roots on the circle of radius " + root, scale: Math.min(80, 120 / root) });
    },
    functions: function () {
      var rs = [2, 3, 5, 10], r = rs[pick(rs.length)], dirs = [[0, String(r)], [PI / 2, r + "i"], [PI, "−" + r], [3 * PI / 2, "−" + r + "i"]], d = dirs[pick(dirs.length)];
      var right = "ln " + r + (d[0] === 0 ? "" : " + i" + ang(d[0]).replace(/^π/, "π"));
      var wrongs = d[0] === 0 ? ["ln " + r + " + iπ", "undefined"] : ["ln " + r + " − i" + ang(2 * PI - d[0]), "undefined", d[0] === PI ? "−ln " + r : "ln " + r];
      var z = P.fromPolar(r, d[0]);
      return ch("gen-functions", "4.3", "Complex logarithm", "With 0 ≤ φ < 2π, what is ln(" + d[1] + ")?",
        mix(right, wrongs), right,
        d[1] + " = " + r + "e^(i" + ang(d[0]) + "), so ln(" + d[1] + ") = ln " + r + " + i" + ang(d[0]) + (d[0] === 0 ? " = ln " + r + "." : ". A negative angle lies outside the notes’ range, and negative numbers do have logarithms in ℂ."),
        { given: pts([[z.map(function (v) { return v / r * 2; }), d[1] + " (scaled)"]]), result: pts([[[Math.log(r) / 1.2, d[0] / 1.2], "ln(" + d[1] + ")"]]), note: "real part ln " + r + ", imaginary part the angle", scale: 44 });
    },
  };

  // ---- sandboxes
  function sandboxDraw(id, root, visual) {
    function val(name) { var el = root.querySelector("[data-control='" + name + "']"); return el ? el.value : ""; }
    function own(name) { var el = root.querySelector("[data-own='" + name + "']"); return el ? el.value : ""; }
    function say(msg) { var el = root.querySelector("[data-own-msg]"); if (el) el.textContent = msg || ""; }
    function n(s) { var v = Number(String(s).replace("−", "-").trim()); return String(s).trim() === "" ? NaN : v; }
    say("");
    if (id === "arith") {
      var z = [n(own("a")), n(own("b"))], w = [n(own("c")), n(own("d"))];
      if (!z.concat(w).every(isFinite)) return say("Type a number in each box, for example 2 and −1.");
      var op = val("op"), r = op === "add" ? P.add(z, w) : op === "sub" ? P.sub(z, w) : op === "mul" ? P.mul(z, w) : P.div(z, w);
      if (op === "div" && P.abs(w) === 0) return say("w = 0: division by zero is not defined.");
      var big = Math.max(P.abs(z), P.abs(w), P.abs(r), 1);
      plane(visual, { given: pts([[z, "z = " + cfmt(z)], [w, "w = " + cfmt(w)]]), path: op === "add" ? [[z, r], [w, r]] : [], result: pts([[r, cfmt(r)]]),
        note: { add: "z + w", sub: "z − w", mul: "z · w: lengths multiply, angles add", div: "z ÷ w: lengths divide, angles subtract" }[op] + " = " + cfmt(r), scale: Math.max(6, Math.min(56, 120 / big)) }, 1);
    } else if (id === "polar") {
      var p = root._point || P.fromPolar(Number(val("radius")), Number(val("angle"))), phi = P.arg(p);
      plane(visual, { given: pts([[P.conj(p), "z̄"]]), result: pts([[p, "z"]]), circle: P.abs(p),
        note: "z = " + cfmt(p) + " = " + num(P.abs(p)) + "e^(i" + (phi === null ? "?" : ang(phi)) + ")", scale: 48 }, 1);
    } else if (id === "powers") {
      var bases = { "1+i": [1, 1], i: I, sixth: P.fromPolar(1, PI / 3), shrink: P.fromPolar(0.9, PI / 6), grow: P.fromPolar(1.1, PI / 4) }, b = bases[val("base")], k = Number(val("k")), out = [];
      for (var j = 1; j <= k; j++) out.push([P.pow(b, j), j === k ? "z^" + k : ""]);
      var far = Math.max.apply(null, out.map(function (o) { return P.abs(o[0]); }).concat([1]));
      plane(visual, { given: pts([[b, "z"]]), result: pts(out), spiral: true, circle: 1, note: "z^" + k + " = " + cfmt(P.pow(b, k)), scale: Math.max(6, Math.min(80, 130 / far)) }, 1);
    } else if (id === "roots") {
      var targets = { one: [1, 0], minus8: [-8, 0], i: I, sixteen: [16, 0], m: [-1, Math.sqrt(3)] }, t = targets[val("z")], nn = Number(val("n")), rr = P.roots(t, nn), len = Math.pow(P.abs(t), 1 / nn);
      plane(visual, { result: pts(rr.map(function (w, q) { return [w, nn <= 6 ? "w" + "₀₁₂₃₄₅₆₇"[q] : ""]; })), polygon: nn > 2, circle: len,
        note: nn + " roots, length " + num(len) + ", " + ang(2 * PI / nn) + " apart", scale: Math.min(96, 120 / len) }, 1);
    } else if (id === "functions") {
      var x = n(own("x")), y = n(own("y"));
      if (!(isFinite(x) && isFinite(y))) return say("Type a number for x and for y, for example 0.5 and 2.");
      var zz = [x, y], f = val("fn");
      if (f === "ln" && x === 0 && y === 0) return say("ln 0 is not defined: z must not be 0.");
      var outz = f === "exp" ? P.exp(zz) : P.log(zz), far2 = Math.max(P.abs(zz), P.abs(outz), 1);
      plane(visual, { given: pts([[zz, "z = " + cfmt(zz)]]), result: pts([[outz, (f === "exp" ? "e^z = " : "ln z = ") + cfmt(outz)]]), circle: f === "exp" ? P.abs(outz) : null,
        note: f === "exp" ? "|e^z| = e^x = " + num(Math.exp(x)) + ", angle y" : "ln|z| = " + num(outz[0]) + ", angle " + num(outz[1]) + " rad", scale: Math.max(8, Math.min(56, 120 / far2)) }, 1);
    }
  }
  function register(id, title) {
    var root = document.querySelector("[data-experiment='" + id + "']"), visual = stage(id);
    function setup(c) { root.classList.remove("sandbox-open"); root._point = null; c.stage(); }
    function sandbox() {
      root.classList.add("sandbox-open"); root._point = null;
      if (!root._bound) {
        root._bound = true;
        root.querySelectorAll("[data-control]").forEach(function (el) { el.addEventListener("change", function () { root._point = null; sandboxDraw(id, root, visual); }); });
        root.querySelectorAll("[data-own]").forEach(function (el) { el.addEventListener("input", function () { sandboxDraw(id, root, visual); }); });
        if (id === "polar") {
          var host = root.querySelector(".stage"), drag = false;
          function at(ev) { var q = visual.createSVGPoint(), m = visual.getScreenCTM(); q.x = ev.clientX; q.y = ev.clientY; return m ? q.matrixTransform(m.inverse()) : q; }
          function move(ev) {
            var q = at(ev), x = Math.round((q.x - CX) / 48 * 10) / 10, y = Math.round((CY - q.y) / 48 * 10) / 10;
            root._point = [Math.max(-4.5, Math.min(4.5, x)), Math.max(-3, Math.min(3, y))]; sandboxDraw(id, root, visual);
          }
          host.addEventListener("pointerdown", function (ev) {
            if (!root.classList.contains("sandbox-open")) return;
            drag = true; host.classList.add("dragging"); if (ev.isTrusted && host.setPointerCapture) { try { host.setPointerCapture(ev.pointerId); } catch (_) { /* synthetic events */ } }
            move(ev); ev.preventDefault();
          });
          host.addEventListener("pointermove", function (ev) { if (drag) move(ev); });
          ["pointerup", "pointercancel"].forEach(function (t) { host.addEventListener(t, function () { drag = false; host.classList.remove("dragging"); }); });
          visual.setAttribute("tabindex", "0");
          visual.addEventListener("keydown", function (ev) {
            var d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[ev.key];
            if (!d || !root.classList.contains("sandbox-open")) return;
            ev.preventDefault();
            var p = root._point || P.fromPolar(Number(root.querySelector("[data-control='radius']").value), Number(root.querySelector("[data-control='angle']").value)), st = ev.shiftKey ? 1 : 0.1;
            root._point = [Math.round((p[0] + d[0] * st) * 10) / 10, Math.round((p[1] + d[1] * st) * 10) / 10]; sandboxDraw(id, root, visual);
          });
        }
      }
      sandboxDraw(id, root, visual);
    }
    function wrap(challenge) {
      var said = null;
      function draw(phase) { challenge.draw(visual, phase, said); }
      return Object.assign({}, challenge, {
        stage: function () { said = null; draw(0); },
        preview: function (choice) { var sel = challenge.options.find(function (o) { return o[0] === choice; }); said = sel && sel[1]; draw(0); },
        reveal: function () { return Lab.tween(1500, draw).then(function () { draw(1); }); },
      });
    }
    Lab.experiment({ id: id, title: title, card: root.querySelector(".challenge"), lock: function () {}, setup: setup, sandbox: sandbox,
      generate: generators[id] ? function () { return wrap(generators[id]()); } : null,
      challenges: data[id].map(wrap) });
  }
  register("arith", "4.1 Arithmetic in the plane");
  register("polar", "4.1 Polar form");
  register("powers", "4.2 Powers");
  register("roots", "4.2 Roots");
  register("functions", "4.3 Complex functions");
})();
