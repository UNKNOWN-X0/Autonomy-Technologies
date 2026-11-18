// EEI Chapter 3 lab answer keys and representative guide answers.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const P = require("../js/eei/ch3-physics.js");

function challenges() {
  const fake = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => "" : fake()), apply: () => fake(), set: () => true });
  const defs = [];
  const ctx = vm.createContext({ document: fake(), getComputedStyle: fake(), Lab: { experiment: (d) => defs.push(d), tween: () => Promise.resolve() }, EEI3: P });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/eei/ch3-lab.js"), "utf8"), ctx);
  return defs;
}
const close = (actual, expected, rel = 0.005) => assert.ok(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * rel), `${actual} is not within ${rel * 100}% of ${expected}`);

test("five Chapter 3 experiments each register four solved challenges", () => {
  const defs = challenges();
  assert.deepEqual(defs.map((d) => d.id), ["sources", "kirchhoff", "dividers", "power", "nodal"]);
  for (const def of defs) {
    assert.equal(def.challenges.length, 4, def.id);
    for (const c of def.challenges) assert.equal(c.solve(), c.answer, c.id);
  }
});

test("sources: the battery worked example, practice 2, 7 and 20", () => {
  const r = P.realSource(12, 0.5, 5.5); // worked example: one battery, two models
  close(r.I, 2); close(r.U, 11); close(r.Ishort, 24);
  close(P.currentDivider(24, 5.5, 0.5), 2); // the current-source model gives the same load current
  close(P.openLoss(12, 0.5).currentModel, 288);
  const p2 = P.realSource(9, 1.5, 3); close(p2.I, 2); close(p2.U, 6); close(p2.Ishort, 6); // practice 2
  close(P.toVoltageSource(0.05, 200).U0, 10); // practice 7
  close(0.002 * 4700, 9.4); // practice 20, ideal current source
});

test("Kirchhoff: the mesh and node worked examples, practice 3, 10 and 23", () => {
  close(P.kvlClose([[12, -1], [3, 1], [5, 1]], 1), 4); // worked example: U3 = 4 V
  close(P.kclOut([3, -0.8], [1.2]), 1.0); // worked example: I4 = 1.0 A
  close(P.kclOut([3, -0.5], [1.2]), 1.3); // practice 3
  close(P.kvlClose([[15, -1], [4, 1], [6, 1]], 1), 5); // practice 10
  close(2 * 5 + 4, 14); // practice 23: current-source voltage
});

test("resistor networks: reduction, dividers, shunts and power from §3.5 and the practice", () => {
  close(P.series(6, P.par(12, 4)), 9); // worked example
  close(P.par(10, 20, 30), 5.4545); // practice 1
  close(P.divider(24, 3000, 9000), 18); // practice 6
  close(P.divider(12, 10000, 10000, 10000), 4); close(P.divider(12, 10000, 10000, 1e6), 5.97); // worked example, loaded divider
  close(P.divider(10, 1000, 1000, 1000), 3.333); close(P.divider(10, 1000, 1000, 100000), 4.975); // practice 11
  close(P.currentDivider(0.06, 2000, 3000), 0.036); // practice 22
  close(1 / (50 * 0.2 - 0.2), 0.102); close(1 / (100 * 0.1 - 0.1), 0.101); // ammeter shunt example, practice 16
  close(P.maxPower(6, 3), 3); close(P.efficiency(3, 3), 0.5); // practice 12
  close(P.loadPower(12, 2, 2), 18); close(P.loadPower(12, 2, 8), 11.52); close(P.efficiency(2, 8), 0.8); // worked example, matched versus efficient
  close(P.efficiency(0.1, 1.9), 0.95); // practice 19
});

test("larger networks: superposition, the node-voltage example, practice 9, the bridge and both exam problems", () => {
  const s = P.superpose(10, 1, 2, 3); close(s.phi / 3, 2.4); close(s.P2, 17.28); close(s.P2wrong, 12.48); // worked superposition
  const [p2, p3] = P.cramer2(1.25, -0.5, -0.5, 0.7, 5, 0.5); close(p2, 6); close(p3, 5); // node-voltage worked example
  close(8 + 9 + 0.5 + 5, 10 * 2 + 5 * 0.5); // its power balance
  close(P.superpose(12, 0.5, 4, 12).phi, 10.5); // practice 9
  close(P.bridgeRx(150, 220, 330), 100); close(P.bridgeRx(100, 470, 1000), 47); // practice 14, worked bridge
  // exam 1: battery 12 V, 1 Ω; divider 5 Ω over 6 Ω; load 3 Ω across the 6 Ω
  const I = 12 / (1 + 5 + P.par(6, 3)); close(I, 1.5); close(I * P.par(6, 3), 3);
  const thev = P.toVoltageSource(P.toCurrentSource(12, 6).I0, P.par(6, 6)); close(thev.U0, 6); close(thev.Ri, 3); close(P.maxPower(6, 3), 3);
  // exam 2: 12 V through 3 Ω into n2, 6 Ω to ground, 1 A into n2
  const e2 = P.superpose(12, 1, 3, 6); close(e2.fromU, 8); close(e2.fromI, 2); close(e2.phi, 10); close(e2.P2, 16.667); close(e2.P2wrong, 11.333);
  close((12 - 10) / 3 * 12 + 10 * 1, (12 - 10) ** 2 / 3 + 100 / 6); // power balance 18 W
});

test("the slip on printed page 233: the superposition cross term needs R2", () => {
  const s = P.superpose(10, 1, 2, 3), a = s.fromU / 3, b = s.fromI / 3;
  close(s.P2 - s.P2wrong, 2 * a * b * 3);
});
