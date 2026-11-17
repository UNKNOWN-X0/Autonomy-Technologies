// MEI Chapter 4 lab answer keys and representative guide answers.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const P = require("../js/mei/ch4-physics.js");

function challenges() {
  const fake = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => "" : fake()), apply: () => fake(), set: () => true });
  const defs = [];
  const ctx = vm.createContext({ document: fake(), getComputedStyle: fake(), Lab: { experiment: d => defs.push(d), tween: () => Promise.resolve() }, MEI4: P });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/mei/ch4-lab.js"), "utf8"), ctx);
  return defs;
}
const close = (z, w) => assert.ok(P.near(z, w, 1e-9), JSON.stringify(z) + " ≠ " + JSON.stringify(w));
const PI = Math.PI;

test("five Chapter 4 experiments each register four solved challenges", () => {
  const defs = challenges();
  assert.deepEqual(defs.map(d => d.id), ["arith", "polar", "powers", "roots", "functions"]);
  for (const def of defs) {
    assert.equal(def.challenges.length, 4, def.id);
    for (const c of def.challenges) assert.equal(c.solve(), c.answer, c.id);
  }
});

test("arithmetic: practice 1, 7 and 22 and the four-operations worked example", () => {
  close(P.mul([2, -3], [4, 1]), [11, -10]); // practice 1
  close(P.div([1, 0], [3, 4]), [3 / 25, -4 / 25]); // practice 7
  close(P.div([1, 1], [1, -1]), [0, 1]); // practice 22
  close(P.mul([3, 1], [1, -2]), [5, -5]); // worked example
  close(P.div([3, 1], [1, -2]), [0.2, 1.4]);
});

test("polar form: practice 10 and 18, the exponential-form worked example", () => {
  assert.ok(Math.abs(P.arg([-2, -2]) - 5 * PI / 4) < 1e-12); // practice 10
  assert.ok(Math.abs(P.abs([-2, -2]) - 2 * Math.SQRT2) < 1e-12);
  close(P.mul(P.fromPolar(3, PI / 4), P.fromPolar(2, 3 * PI / 4)), [-6, 0]); // practice 18
  assert.ok(Math.abs(P.arg([-Math.sqrt(3), 1]) - 5 * PI / 6) < 1e-12); // worked example
  assert.equal(P.arg([0, 0]), null);
});

test("powers: practice 2, 9 and 21, exam 2 part 2, worked (1 − i)⁶", () => {
  close(P.pow([1, 1], 8), [16, 0]); // practice 2
  close(P.pow(P.fromPolar(2, PI / 6), 3), [0, 8]); // practice 9
  close(P.pow([0, 1], 2026), [-1, 0]); // practice 21
  close(P.pow([1, -1], 5), [-4, 4]); // exam 2
  close(P.pow([1, -1], 6), [0, 8]); // worked example
});

test("roots: practice 5, 16 and 24, worked cube roots of −8, exam 1", () => {
  const sq = P.roots([-9, 0], 2); close(sq[0], [0, 3]); close(sq[1], [0, -3]); // practice 5
  const four = P.roots([16, 0], 4); [[2, 0], [0, 2], [-2, 0], [0, -2]].forEach((w, k) => close(four[k], w)); // practice 16
  const cube = P.roots([0, 1], 3); close(cube[0], [Math.sqrt(3) / 2, 0.5]); close(cube[1], [-Math.sqrt(3) / 2, 0.5]); close(cube[2], [0, -1]); // practice 24
  const m8 = P.roots([-8, 0], 3); close(m8[0], [1, Math.sqrt(3)]); close(m8[1], [-2, 0]); close(m8[2], [1, -Math.sqrt(3)]); // worked example
  const e8 = P.roots([8, 0], 3); close(e8.reduce(P.mul, [1, 0]), [8, 0]); close(e8.reduce(P.add, [0, 0]), [0, 0]); // exam 1
  for (const w of e8) close(P.pow(w, 3), [8, 0]);
});

test("complex functions: practice 3, 6, 14 and 23, the worked factorisation, exam 2 part 4", () => {
  assert.deepEqual(P.pairQuadratic([3, -2]), [1, -6, 13]); // practice 3
  close(P.log([-2, 0]), [Math.log(2), PI]); // practice 6
  assert.ok(Math.abs(P.abs(P.exp([-1, 5])) - Math.exp(-1)) < 1e-12); // practice 14
  close(P.log([0, 1]), [0, PI / 2]); // practice 23
  for (const z of [[1, 0], [0, 2], [0, -2]]) close(P.poly([1, -1, 4, -4], z), [0, 0]); // worked factorisation
  close(P.exp(P.log([1, 1])), [1, 1]);
  const lz = P.log([1, -1]), lz2 = P.log(P.mul([1, -1], [1, -1])); // exam 2: ln(z²) and 2 ln z differ by 2πi
  close([2 * lz[0] - lz2[0], 2 * lz[1] - lz2[1]], [0, 2 * PI]);
  close(P.exp([0.3, PI / 4 + 2 * PI]), P.exp([0.3, PI / 4])); // period 2πi
});
