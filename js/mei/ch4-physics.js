/* MEI Chapter 4 complex-number calculations. A complex number is a pair [re, im]; no DOM. */
(function (root) {
  var TAU = 2 * Math.PI;
  function add(z, w) { return [z[0] + w[0], z[1] + w[1]]; }
  function sub(z, w) { return [z[0] - w[0], z[1] - w[1]]; }
  function mul(z, w) { return [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]]; }
  function conj(z) { return [z[0], -z[1]]; }
  function abs(z) { return Math.hypot(z[0], z[1]); }
  // z / w = z · w̄ / |w|²; NaN parts for w = 0
  function div(z, w) { var d = w[0] * w[0] + w[1] * w[1], t = mul(z, conj(w)); return [t[0] / d, t[1] / d]; }
  // the argument in the notes' range 0 ≤ φ < 2π; null for z = 0
  function arg(z) {
    if (z[0] === 0 && z[1] === 0) return null;
    var p = Math.atan2(z[1], z[0]);
    if (p < 0) p += TAU;
    return p >= TAU - 1e-12 ? 0 : p;
  }
  function fromPolar(r, phi) { return [r * Math.cos(phi), r * Math.sin(phi)]; }
  // reduce an angle into [0, 2π)
  function wrap(phi) { var p = phi % TAU; if (p < 0) p += TAU; return Math.abs(p - TAU) < 1e-12 ? 0 : p; }
  // de Moivre: z^k = |z|^k e^{ikφ}, k ∈ ℕ
  function pow(z, k) { var r = abs(z), p = arg(z); return r === 0 ? [0, 0] : fromPolar(Math.pow(r, k), k * p); }
  // all n-th roots w_k = |z|^{1/n} e^{i(φ + 2kπ)/n}, k = 0 … n−1
  function roots(z, n) {
    var r = Math.pow(abs(z), 1 / n), p = arg(z) || 0, out = [];
    for (var k = 0; k < n; k++) out.push(fromPolar(r, (p + TAU * k) / n));
    return out;
  }
  // e^{x+iy} = e^x (cos y + i sin y)
  function exp(z) { return fromPolar(Math.exp(z[0]), z[1]); }
  // ln z = ln|z| + iφ with 0 ≤ φ < 2π; null for z = 0
  function log(z) { var p = arg(z); return p === null ? null : [Math.log(abs(z)), p]; }
  // (z − z0)(z − z̄0) = z² − 2 Re(z0) z + |z0|²: returns the real coefficients [1, b, c]
  function pairQuadratic(z0) { return [1, -2 * z0[0], z0[0] * z0[0] + z0[1] * z0[1]]; }
  // evaluate a polynomial with complex or real coefficients (highest power first) at z
  function poly(coeffs, z) {
    return coeffs.reduce(function (acc, c) { var cc = typeof c === "number" ? [c, 0] : c; return add(mul(acc, z), cc); }, [0, 0]);
  }
  function near(z, w, eps) { return Math.abs(z[0] - w[0]) < (eps || 1e-9) && Math.abs(z[1] - w[1]) < (eps || 1e-9); }
  var api = { add: add, sub: sub, mul: mul, div: div, conj: conj, abs: abs, arg: arg, fromPolar: fromPolar, wrap: wrap,
    pow: pow, roots: roots, exp: exp, log: log, pairQuadratic: pairQuadratic, poly: poly, near: near, TAU: TAU };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MEI4 = api;
})(this);
