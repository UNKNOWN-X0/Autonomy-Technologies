// APDR Chapter 6: the lab's Python semantics against the guide's worked examples, practice answers and lab challenges.
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/apdr/ch6-physics.js");

const ev = (e) => P.evaluate(e).text;

test("guide worked example: 2 + 3 * 4 ** 2 // 5 in Python's order", () => {
  const r = P.evaluate("2 + 3 * 4 ** 2 // 5");
  assert.deepEqual(r.steps, ["2 + 3 * 4 ** 2 // 5", "2 + 3 * 16 // 5", "2 + 48 // 5", "2 + 9", "11"]);
  assert.equal(r.type, "int");
});

test("practice 1, 5, 10, 16: values and types", () => {
  assert.equal(ev("9 / 3"), "3.0");
  assert.equal(P.evaluate("9 / 3").type, "float");
  assert.equal(ev("3 + 2 ** 3 * 4 // 6"), "8");
  assert.equal(ev("(3 + 2) ** 3 * 4 // 6"), "83");
  assert.equal(ev("7 % 3"), "1");
  assert.equal(ev("-7 % 3"), "2");
  assert.equal(ev("7 // 2.0"), "3.0");
  assert.equal(Math.trunc(-2.7), -2); // practice 5: int() truncates; the guide's answer is -2
});

test("lab challenges for operators", () => {
  assert.equal(ev("-7 // 2"), "-4");
  assert.equal(ev("8 / 2 * 4"), "16.0");
  assert.equal(ev("2 ** 3 ** 2"), "512");
  assert.equal(ev("-2 ** 2"), "-4");
  assert.equal(ev("6 / 3"), "2.0");
  assert.throws(() => P.evaluate("1 / 0"), /ZeroDivisionError/);
});

test("floats print like Python's repr", () => {
  assert.equal(P.fmtFloat(16), "16.0");
  assert.equal(P.fmtFloat(0.1 + 0.2), "0.30000000000000004");
  assert.equal(P.fmtFloat(1e-5), "1e-05");
  assert.equal(P.fmtFloat(1.5e16), "1.5e+16");
});

test("practice 2 and 22, recall 6.4 and the slips list: indexing and slicing", () => {
  const s = "abcdefgh";
  assert.equal(P.pyIndex("python", 1), "y");
  assert.equal(P.pyIndex("python", -2), "o");
  assert.equal(P.pySlice("python", 1, 4), "yth");
  assert.equal(P.pySlice(s, null, null, -1), "hgfedcba");
  assert.equal(P.pySlice(s, 6, 2, -2), "ge");
  assert.equal(P.pySlice(s, 4, 1, -2), "ec");
  assert.equal(P.pySlice(s, 3, 6, 2), "df");
  assert.throws(() => P.pyIndex(s, 8), /IndexError/);
});

test("range values (practice 4, recall 6.8)", () => {
  assert.deepEqual(P.range(2, 11, 3), [2, 5, 8]);
  assert.deepEqual(P.range(10, 0, -3), [10, 7, 4, 1]);
  assert.deepEqual(P.range(5, 11, 2), [5, 7, 9]);
});

test("sum loops: the lecture's 24 and 21 and practice 13", () => {
  assert.equal(P.traceSumLoop(7, 10, 1, "none").result, 24);
  assert.equal(P.traceSumLoop(5, 11, 2, "none").result, 21);
  assert.equal(P.traceSumLoop(1, 6, 1, "none").result, 15);
});

test("break and continue: the lecture's 5 and 23, the nested 6, recall 6.9", () => {
  assert.equal(P.traceSumLoop(5, 11, 2, "break", 5).result, 5);
  assert.equal(P.traceSumLoop(5, 11, 2, "continue", 5).result, 23);
  assert.equal(P.traceNested(3, 4, 2).result, 6);
  assert.equal(P.traceFirstSquare(10, 20).result, 5);
});

test("practice 7: halving from 10 takes three rounds and leaves 1", () => {
  const r = P.traceHalving(10);
  assert.equal(r.result, 3);
  assert.equal(r.n, 1);
  assert.equal(P.traceHalving(1).result, 0);
});

test("branching: practice 18, the zero case and the elif chain", () => {
  assert.deepEqual(P.traceXY(3, 3).output, ["x and y are equal", "therefore, x / y is 1.0", "thanks!"]);
  assert.deepEqual(P.traceXY(0, 0).output, ["x and y are equal", "thanks!"]);
  assert.deepEqual(P.traceXY(2, 5).output, ["x is smaller", "thanks!"]);
  assert.deepEqual(P.traceChain(7, 5, 3).output, ["big"]);
  assert.deepEqual(P.traceChain(0, 0, -1).output, ["mid"]);
});

test("every trace step points at a real line of its code", () => {
  for (const r of [P.traceSumLoop(5, 11, 2, "continue", 5), P.traceHalving(10), P.traceNested(3, 4, 2), P.traceFirstSquare(10, 20), P.traceXY(4, 2), P.traceChain(1, 5, 3)]) {
    for (const s of r.steps) assert.ok(s.line >= 0 && s.line < r.code.length, r.code[0]);
  }
});
