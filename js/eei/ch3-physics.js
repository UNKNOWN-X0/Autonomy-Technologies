/* EEI Chapter 3 relations for DC networks, in SI units. Shared by the lab and node tests. */
(function (root) {
  function par() { // R1 ∥ R2 ∥ …; Infinity stands for an open branch (no load)
    var g = 0;
    for (var i = 0; i < arguments.length; i++) if (isFinite(arguments[i])) g += 1 / arguments[i];
    return g === 0 ? Infinity : 1 / g;
  }
  function series() { var s = 0; for (var i = 0; i < arguments.length; i++) s += arguments[i]; return s; }
  // a real voltage source U0 with internal resistance Ri feeding a load RL (RL = Infinity: open terminals)
  function realSource(U0, Ri, RL) {
    var I = isFinite(RL) ? U0 / (Ri + RL) : 0;
    return { I: I, U: U0 - I * Ri, Ishort: U0 / Ri };
  }
  function toCurrentSource(U0, Ri) { return { I0: U0 / Ri, Ri: Ri }; }
  function toVoltageSource(I0, Ri) { return { U0: I0 * Ri, Ri: Ri }; }
  // power turned into heat inside each model with open terminals (voltage model, current model)
  function openLoss(U0, Ri) { return { voltageModel: 0, currentModel: U0 * U0 / Ri }; }
  // KCL: inward currents count +, outward −; returns the current an extra outward wire must carry
  function sum(list) { return list.reduce(function (s, v) { return s + v; }, 0); }
  function kclOut(inward, outward) { return sum(inward) - sum(outward); }
  // KVL round a mesh: [value, +1 along the travel or −1 against]; returns the value of the last voltage given its sign
  function kvlClose(known, sign) { return -known.reduce(function (s, k) { return s + k[0] * k[1]; }, 0) / sign; }
  function divider(U, R1, R2, RL) { var Rp = par(R2, RL === undefined ? Infinity : RL); return U * Rp / (R1 + Rp); }
  function currentDivider(I, Rthis, Rother) { return I * Rother / (Rthis + Rother); }
  function loadPower(U0, Ri, RL) { return U0 * U0 * RL / Math.pow(Ri + RL, 2); }
  function totalPower(U0, Ri, RL) { return U0 * U0 / (Ri + RL); }
  function maxPower(U0, Ri) { return U0 * U0 / (4 * Ri); }
  function efficiency(Ri, RL) { return RL / (Ri + RL); }
  // U0 feeds node 2 through R1; R2 from node 2 to the reference; I0 pushes current into node 2
  function superpose(U0, I0, R1, R2) {
    var a = U0 * R2 / (R1 + R2), b = I0 * par(R1, R2);
    return { fromU: a, fromI: b, phi: a + b, P2: (a + b) * (a + b) / R2, P2wrong: (a * a + b * b) / R2 };
  }
  // a 2 × 2 linear system by Cramer's rule: [[a, b], [c, d]] · [x, y] = [e, f]
  function cramer2(a, b, c, d, e, f) { var D = a * d - b * c; return [(e * d - b * f) / D, (a * f - c * e) / D]; }
  function bridgeRx(R2, R3, R4) { return R2 * R3 / R4; }
  // a value with an SI prefix and three significant figures, Unicode minus: fmt(0.0125, "A") → "12.5 mA"
  var PREFIX = [[1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"]];
  function fmt(v, unit) {
    if (v === Infinity) return "∞";
    if (!isFinite(v)) return "—";
    var a = Math.abs(v);
    if (a < 1e-12) return "0 " + unit;
    var p = PREFIX[PREFIX.length - 1];
    for (var i = 0; i < PREFIX.length; i++) if (a >= PREFIX[i][0] * 0.9995) { p = PREFIX[i]; break; }
    if (unit === "Ω" && a >= 0.01 && a < 1) p = PREFIX[2]; // 0.5 Ω, not 500 mΩ: resistances below 1 Ω read better plain
    var s = String(Number((a / p[0]).toPrecision(3)));
    return (v < 0 ? "−" : "") + s + " " + p[1] + unit;
  }
  var api = {
    fmt: fmt,
    par: par, series: series, realSource: realSource, toCurrentSource: toCurrentSource, toVoltageSource: toVoltageSource, openLoss: openLoss,
    kclOut: kclOut, kvlClose: kvlClose, divider: divider, currentDivider: currentDivider, loadPower: loadPower, totalPower: totalPower,
    maxPower: maxPower, efficiency: efficiency, superpose: superpose, cramer2: cramer2, bridgeRx: bridgeRx,
  };
  root.EEI3 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
