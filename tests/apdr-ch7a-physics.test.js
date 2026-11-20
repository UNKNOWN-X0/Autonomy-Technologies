const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/apdr/ch7a-physics.js");

test("memory traces distinguish shared mutation, copy, and rebinding", () => {
  assert.match(C.memory("alias").join(" "), /both names/);
  assert.match(C.memory("copy").join(" "), /distinct/);
  assert.match(C.memory("rebind").join(" "), /a still points/);
  assert.throws(() => C.memory("bad"), RangeError);
});

test("type-system, abstraction, and ownership models report their rules", () => {
  assert.match(C.classify("forms").join(" "), /parametric/);
  assert.match(C.abstraction("mangling").join(" "), /remains possible/);
  assert.match(C.lifetime("cycle").join(" "), /weak_ptr/);
});

test("compiler traces separate the pipeline, SSA merge, and bytecode", () => {
  assert.match(C.compiler("phi").join(" "), /selects the incoming value/);
  assert.match(C.compiler("python").join(" "), /bytecode/);
});

test("factorial trace includes the base call and rejects out-of-range inputs", () => {
  const trace = C.factorial(4).join(" ");
  assert.match(trace, /fact\(4\) → fact\(3\) → fact\(2\) → fact\(1\) → fact\(0\)/);
  assert.match(trace, /Result: 24/);
  assert.throws(() => C.factorial(-1), RangeError);
});
