// APDR Chapter 7: the lab's Python interpreter against the lecture's programs, the guide's answers and the lab challenges.
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/apdr/ch7-physics.js");
const G = P.PROGRAMS;

const said = (code) => P.outcome(P.run(code));
const out = (code) => P.run(code).output;

test("lab challenges, return and print (7.3, 7.5)", () => {
  assert.equal(said(G.isEven(3)), "inside is_even | False");
  assert.equal(said(G.isEvenNoReturn(4)), "None");
  assert.equal(said(G.funcA()), "inside func_a | None");
  assert.equal(said(G.funcC()), "inside func_c | inside func_a | None");
});

test("guide 7.5 worked example: the lecture's three prints make seven lines", () => {
  const code = ["def func_a():", "    print('inside func_a')", "def func_b(y):", "    print('inside func_b')", "    return y", "def func_c(z):", "    print('inside func_c')", "    return z()",
    "print(func_a())", "print(5 + func_b(2))", "print(func_c(func_a))"];
  assert.deepEqual(out(code), ["inside func_a", "None", "inside func_b", "7", "inside func_c", "inside func_a", "None"]);
});

test("lab challenges and guide 7.4: the lecture's scope examples", () => {
  assert.deepEqual(out(G.scopeParam(3, 1)), ["in f(x): x = 4", "3 4"]);
  assert.equal(said(G.scopeF(5, 1, 1)), "2 | 5");
  assert.equal(said(G.scopeG(5, 1)), "5 | 6 | 5");
  const h = P.run(G.scopeH(5, 1));
  assert.equal(h.error, "UnboundLocalError: cannot access local variable 'x' where it is not associated with a value");
  assert.equal(h.errorLine, 1);
});

test("lab challenges and guide 7.6: tuples", () => {
  assert.equal(said(G.quotRem(4, 5)), "0 4");
  assert.equal(said(G.quotRem(17, 5)), "3 2"); // practice 20
  assert.equal(said(G.swapWrong(1, 2)), "2 2"); // practice 12
  assert.equal(said(G.swapTuple(1, 2)), "2 1");
  assert.equal(said(["t = (2, 'fau', 3)", "print(t[1:2])"]), "('fau',)");
  assert.equal(said(["t = (4, 'ab', 7)", "print(t[1:3], t[2:3])"]), "('ab', 7) (7,)"); // practice 1
  assert.equal(said(["t = (2, 'fau', 3)", "t[1] = 4"]), "TypeError");
  assert.equal(said(G.getData([[1, "a"], [2, "b"], [1, "a"]])), "(1, 2, 2)");
});

test("lab challenges and guide 7.8: list operations", () => {
  assert.equal(said(["L = [2, 1, 3, 6, 3, 7, 0]", "L.remove(2)", "L.remove(3)", "del(L[1])", "print(L.pop())", "print(L)"]), "0 | [1, 3, 7]");
  assert.equal(said(["L1 = [2, 1, 3]", "L2 = [4, 5, 6]", "L3 = L1 + L2", "L1.extend([0, 6])", "print(len(L1), len(L3))"]), "5 6");
  assert.equal(out(["warm = ['red', 'yellow', 'orange']", "sortedwarm = warm.sort()", "print(warm)", "print(sortedwarm)"]).join(" | "), "['orange', 'red', 'yellow'] | None");
  assert.deepEqual(out(["s = 'I<3 cs'", "print(list(s))", "print(s.split('<'))"]), ["['I', '<', '3', ' ', 'c', 's']", "['I', '3 cs']"]);
  assert.equal(said(["L = [5, 3, 5, 1]", "L.remove(5)", "print(L.pop(), L)"]), "1 [3, 5]"); // practice 11
  assert.equal(said(["L = [9, 6, 0, 3]", "M = sorted(L)", "L.reverse()", "print(L, M)"]), "[3, 0, 6, 9] [0, 3, 6, 9]"); // practice 24
});

test("lab challenges and guide 7.9: aliasing, cloning and nesting", () => {
  assert.equal(said(["warm = ['red', 'yellow', 'orange']", "hot = warm", "hot.append('pink')", "print(warm)"]), "['red', 'yellow', 'orange', 'pink']");
  assert.equal(said(["cool = ['blue', 'green', 'grey']", "chill = cool[:]", "chill.append('black')", "print(cool)"]), "['blue', 'green', 'grey']");
  assert.equal(said(["warm = ['yellow', 'orange']", "hot = ['red']", "brightcolors = [warm]", "brightcolors.append(hot)", "hot.append('pink')", "print(brightcolors)"]), "[['yellow', 'orange'], ['red', 'pink']]");
  assert.equal(said(["a = [1, 2]", "b = a", "a = a + [3]", "print(b)"]), "[1, 2]");
  assert.equal(said(["a = [1, 2]", "b = a", "a += [3]", "print(b)"]), "[1, 2, 3]");
});

test("lab challenges and guide 7.10: removing while looping", () => {
  const bug = P.run(G.removeDups([1, 2, 3, 4], [1, 2, 5, 6], false));
  assert.equal(P.outcome(bug), "[2, 3, 4]");
  assert.equal(bug.steps.filter((s) => s.iters.length && s.note !== "loop ends" && s.line === 1).length, 3); // three rounds
  assert.equal(said(G.removeDups([1, 2, 3, 4], [1, 2, 5, 6], true)), "[3, 4]");
  assert.equal(said(G.removeDups([1, 1, 2], [1], false)), "[1, 2]");
  assert.equal(said(["L = [1, 2, 3]", "for e in L:", "    L.remove(e)", "print(L)"]), "[2]"); // practice 8
});

test("exam problems: the leaking bonus and the skipped pair", () => {
  assert.equal(said(["def add_bonus(scores, bonus):", "    for i in range(len(scores)):", "        scores[i] += bonus", "    return scores", "base = [50, 70, 90]", "new = add_bonus(base, 5)", "new.append(100)", "print(base, len(base))"]),
    "[55, 75, 95, 100] 4");
  const split = (copy) => ["def split_counts(pairs):", "    names = []", "    total = 0", "    for p in pairs" + (copy ? "[:]" : "") + ":", "        if p[1] == 0:", "            pairs.remove(p)", "        else:", "            names.append(p[0])", "            total += p[1]",
    "    return (names, total)", "data = [('ann', 2), ('bob', 0), ('cy', 0), ('dee', 3)]", "(n, t) = split_counts(data)", "print(n, t, len(data))"];
  assert.equal(said(split(false)), "['ann', 'dee'] 5 3");
  assert.equal(said(split(true)), "['ann', 'dee'] 5 2");
});

test("errors and limits match Python's wording", () => {
  assert.equal(P.run(["L = [1]", "L.remove(5)"]).error, "ValueError: list.remove(x): x not in list");
  assert.equal(P.run(["print total"]).error, "SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...)?"); // slide 26
  assert.equal(P.run(["x = “a”"]).error.split(":")[0], "SyntaxError");
  assert.ok(P.run(["L = [1]", "for e in L:", "    L.append(e)"]).stopped);
  assert.equal(P.run(["def f(x):", "    return x", "f()"]).error, "TypeError: f() missing 1 required positional argument: 'x'");
});

test("every step points at a real line and every reference at a drawn object", () => {
  for (const code of [G.funcC(), G.scopeParam(3, 1), G.getData([[1, "a"], [2, "b"]]), G.removeDups([1, 2, 3, 4], [1, 2, 5, 6], true), ["a = [[1], 2]", "b = (a, a)", "a[0].append(3)"]]) {
    const r = P.run(code);
    for (const s of r.steps) {
      assert.ok(s.line >= 0 && s.line < r.code.length);
      const ids = new Set(s.heap.map((o) => o.id));
      const refs = s.frames.flatMap((f) => f.vars.map((v) => v[1])).concat(s.heap.flatMap((o) => o.items)).filter((v) => v.r != null);
      for (const v of refs) assert.ok(ids.has(v.r));
    }
  }
});
