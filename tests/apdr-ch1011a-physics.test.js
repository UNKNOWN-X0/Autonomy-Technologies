const test = require("node:test");
const assert = require("node:assert/strict");
const { trace } = require("../js/apdr/ch1011a-physics.js");

test("object traces distinguish aliases, shallow copies, and identity", () => {
  assert.match(trace("alias", "assignment")[0], /same list/);
  assert.match(trace("alias", "shallow")[1], /shared/);
  assert.match(trace("alias", "identity")[2], /==/);
});

test("lookup, typing, and C3 traces state precedence and contract outcomes", () => {
  assert.match(trace("lookup", "property")[2], /precedence/);
  assert.match(trace("contracts", "variance")[2], /breaks substitution/);
  assert.match(trace("mro", "diamond")[2], /D, B, C, A, object/);
  assert.match(trace("mro", "conflict")[2], /class creation fails/);
});

test("descriptor and design traces expose binding-time rules", () => {
  assert.match(trace("descriptor", "method")[2], /bound method/);
  assert.match(trace("descriptor", "classmethod")[2], /subclass as cls/);
  assert.match(trace("design", "default")[2], /fresh list per call/);
  assert.match(trace("design", "closure")[2], /lambda i=i/);
});

test("unknown traces are rejected", () => {
  assert.throws(() => trace("lookup", "unknown"), RangeError);
});
