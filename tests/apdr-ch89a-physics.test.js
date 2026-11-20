const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/apdr/ch89a-physics.js");

test("concurrency traces distinguish shared threads, GIL, free-threading, and processes", () => {
  assert.match(C.concurrency("threads").join(" "), /share one process/);
  assert.match(C.concurrency("gil").join(" "), /one thread at a time/);
  assert.match(C.concurrency("free").join(" "), /may execute in parallel/);
  assert.match(C.concurrency("processes").join(" "), /separate address space/);
  assert.throws(() => C.concurrency("unknown"), RangeError);
});

test("an async lock preserves both increments across suspension", () => {
  assert.match(C.asyncCounter(false).at(-1), /Final count: 1/);
  assert.match(C.asyncCounter(true).at(-1), /Final count: 2/);
});

test("workload routing exposes I/O, CPU, mixed, and transfer costs", () => {
  assert.match(C.route("io").join(" "), /blocking APIs/);
  assert.match(C.route("cpu").join(" "), /processes or native code/);
  assert.match(C.route("mixed").join(" "), /Overlap I\/O/);
  assert.match(C.route("transfer").join(" "), /transfer can cost more/);
  assert.throws(() => C.route("unknown"), RangeError);
});

test("metaprogramming and dynamic-code traces state their boundaries", () => {
  assert.match(C.metaprogramming("order").at(-1), /outer\(inner\(f\)\)/);
  assert.match(C.metaprogramming("hook").join(" "), /__init_subclass__/);
  assert.match(C.dynamic("ast").join(" "), /not a sandbox/);
  assert.match(C.dynamic("type").join(" "), /creates a class/);
});

test("debugging traces distinguish generated counterexamples from coverage", () => {
  assert.match(C.debugging("property").join(" "), /smaller counterexample/);
  assert.match(C.debugging("coverage").join(" "), /no useful assertion/);
  assert.match(C.debugging("hang").join(" "), /task or thread stacks/);
});
