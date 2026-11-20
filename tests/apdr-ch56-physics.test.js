const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/apdr/ch56-physics.js");

test("two-level AMAT weights the lower-level time by the miss rate", () => {
  assert.equal(C.averageAccessTime(2, 0.1, 10), 3);
  assert.equal(C.averageAccessTime(2, 0, 10), 2);
  assert.throws(() => C.averageAccessTime(2, 1.1, 10), RangeError);
});

test("cache set mapping uses cache-line number modulo set count", () => {
  assert.equal(C.cacheSet(1088, 64, 8), 1);
  assert.equal(C.cacheSet(0, 64, 8), 0);
  assert.throws(() => C.cacheSet(-1, 64, 8), RangeError);
});

test("MESI read shares an exclusive line, while invalid stays invalid only until a read", () => {
  assert.equal(C.mesiRead("E"), "E");
  assert.equal(C.mesiRead("S"), "S");
  assert.equal(C.mesiRead("I"), "E");
  assert.throws(() => C.mesiRead("X"), RangeError);
});

test("store buffering outcome is forbidden by SC but allowed by TSO and weak ordering", () => {
  assert.equal(C.storeBufferingAllowsZero("SC"), false);
  assert.equal(C.storeBufferingAllowsZero("TSO"), true);
  assert.equal(C.storeBufferingAllowsZero("weak"), true);
});
