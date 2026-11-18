const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/apdr/ch8-physics.js");

test("recursive multiplication records the base call and result", () => {
  assert.deepEqual(C.traceMultiply(5, 4), { calls: [{ argument: 4, base: false }, { argument: 3, base: false }, { argument: 2, base: false }, { argument: 1, base: true }], value: 20 });
  assert.throws(() => C.traceMultiply(5, 0), RangeError);
});

test("lecture Fibonacci indexing and call counts", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(C.fibonacci), [1, 1, 2, 3, 5, 8, 13]);
  assert.equal(C.naiveCalls(5), 15);
  assert.equal(C.memoCalls(5), 9);
  assert.equal(C.memoCalls(0), 1);
});

test("palindrome normalization and first mismatch", () => {
  assert.equal(C.normalize("Able was I, ere I saw Elba"), "ablewasiereisawelba");
  assert.deepEqual(C.palindromeTrace("A man, a plan, a canal: Panama!"), { normalized: "amanaplanacanalpanama", pairs: [["a", "a"], ["m", "m"], ["a", "a"], ["n", "n"], ["a", "a"], ["p", "p"], ["l", "l"], ["a", "a"], ["n", "n"], ["a", "a"]], result: true });
  assert.equal(C.palindromeTrace("abca").result, false);
});

test("frequency counts preserve ties and threshold groups", () => {
  const counts = C.frequencies(["oak", "elm", "oak", "ash", "elm", "oak", "ash"]);
  assert.deepEqual(counts, { oak: 3, elm: 2, ash: 2 });
  assert.deepEqual(C.mostCommon(counts), { words: ["oak"], count: 3 });
  assert.deepEqual(C.wordsOften(counts, 2), { groups: [{ words: ["oak"], count: 3 }, { words: ["elm", "ash"], count: 2 }], remaining: {} });
  assert.deepEqual(counts, { oak: 3, elm: 2, ash: 2 }); // caller's dictionary is not mutated
});
