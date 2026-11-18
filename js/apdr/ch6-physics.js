/* APDR Chapter 6: Python semantics for the lab, with no DOM. Arithmetic with Python's int/float rules and step-by-step
   evaluation, string indexing and slicing, range, and line-by-line traces of the guide's small programs. */
(function (root) {
  "use strict";
  var LIMIT = 1e15; // ints stay exact in a JS number well below 2^53

  // ---------- values ----------
  function num(v, t) { return { v: v, t: t }; }
  function fmtFloat(x) {
    // Python's repr of a float: shortest digits, a ".0" on whole numbers, scientific outside [1e-4, 1e16)
    if (x === Infinity) return "inf";
    if (x === -Infinity) return "-inf";
    if (x !== x) return "nan";
    var a = Math.abs(x);
    if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
    if (a >= 1e16 || a < 1e-4) {
      var m = x.toExponential().split("e"), e = Number(m[1]);
      return m[0] + "e" + (e < 0 ? "-" : "+") + (Math.abs(e) < 10 ? "0" : "") + Math.abs(e);
    }
    var s = String(x);
    return Number.isInteger(x) ? s + ".0" : s;
  }
  function show(n) { return n.t === "int" ? String(n.v) : fmtFloat(n.v); }
  function pyErr(name, msg) { var e = new Error(name + ": " + msg); e.py = name; return e; }
  function checkInt(v) { if (Math.abs(v) > LIMIT) throw pyErr("Lab limit", "the lab keeps whole numbers below 10¹⁵"); return v; }

  function zero(sign) { return sign < 0 || Object.is(sign, -0) ? -0 : 0; }
  // whole numbers: exact quotient rounded down, remainder with the divisor's sign
  function intDivmod(a, b) {
    var q = Math.trunc(a / b), r = a - q * b;
    while (r !== 0 && (r < 0) !== (b < 0)) { q -= 1; r += b; }
    while (Math.abs(r) >= Math.abs(b)) { q += 1; r -= b; }
    return [q + 0, r + 0]; // + 0 turns −0 into 0: ints have no signed zero
  }
  // floats: CPython's float divmod, built on fmod (JS %), so results match Python to the last bit
  function floatDivmod(vx, wx) {
    var mod = vx % wx, div = (vx - mod) / wx, fd;
    if (mod) { if ((wx < 0) !== (mod < 0)) { mod += wx; div -= 1; } }
    else mod = zero(wx);
    if (div) { fd = Math.floor(div); if (div - fd > 0.5) fd += 1; }
    else fd = zero(vx / wx);
    return [fd, mod];
  }
  function floorDiv(a, b) { return intDivmod(a, b)[0]; }
  function pyMod(a, b) { return intDivmod(a, b)[1]; }

  function apply(op, x, y) {
    var both = x.t === "int" && y.t === "int", a = x.v, b = y.v;
    switch (op) {
      case "+": return both ? num(checkInt(a + b) + 0, "int") : num(a + b, "float");
      case "-": return both ? num(checkInt(a - b) + 0, "int") : num(a - b, "float");
      case "*": return both ? num(checkInt(a * b) + 0, "int") : num(a * b, "float");
      case "/":
        if (b === 0) throw pyErr("ZeroDivisionError", "division by zero");
        return num(a / b, "float");
      case "//":
        if (b === 0) throw pyErr("ZeroDivisionError", "division by zero");
        return both ? num(intDivmod(a, b)[0], "int") : num(floatDivmod(a, b)[0], "float");
      case "%":
        if (b === 0) throw pyErr("ZeroDivisionError", "division by zero");
        return both ? num(intDivmod(a, b)[1], "int") : num(floatDivmod(a, b)[1], "float");
      case "**":
        if (a === 0 && b < 0) throw pyErr("ZeroDivisionError", "zero to a negative power");
        if (a < 0 && !Number.isInteger(b)) throw pyErr("Lab limit", "a negative base with a fractional power is complex; the lab stops here");
        if (both && b >= 0) return num(checkInt(Math.pow(a, b)), "int");
        // an int to a negative int power: one exact power, then one correctly rounded division, as close to C's pow as JS gets
        var inv = both ? Math.pow(a, -b) : Infinity, f = both && isFinite(inv) ? 1 / inv : Math.pow(a, b);
        if (!isFinite(f) && isFinite(a) && isFinite(b)) throw pyErr("OverflowError", "(34, 'Result too large')");
        // a float power can differ from Python in the last digit (V8's pow is not C's); the challenges avoid it
        return num(f, "float");
    }
    throw pyErr("SyntaxError", "unknown operator " + op);
  }

  // ---------- parsing ----------
  function tokens(text) {
    var out = [], re = /\s*(\d+\.\d*|\.\d+|\d+|\*\*|\/\/|[-+*\/%()])/y, m, i = 0;
    text = String(text).replace(/−/g, "-").replace(/×/g, "*").replace(/÷/g, "/");
    while (i < text.length) {
      if (/^\s*$/.test(text.slice(i))) break;
      re.lastIndex = i;
      m = re.exec(text);
      if (!m) throw pyErr("SyntaxError", "cannot read “" + text.slice(i).trim().charAt(0) + "”: use numbers, + - * / // % ** and brackets");
      out.push(m[1]);
      i = re.lastIndex;
    }
    if (!out.length) throw pyErr("SyntaxError", "type an expression such as 7 // 2");
    return out;
  }
  // grammar (Python): sum := term (('+'|'-') term)* ; term := unary (('*'|'/'|'//'|'%') unary)* ;
  // unary := '-' unary | '+' unary | power ; power := atom ('**' unary)?   (so -2 ** 2 is -(2 ** 2), 2 ** -1 works)
  function parse(text) {
    var t = tokens(text), p = 0, depth = 0;
    function peek() { return t[p]; }
    function take(x) { if (t[p] !== x) throw pyErr("SyntaxError", "expected “" + x + "”"); p++; }
    function sum() {
      var n = term();
      while (peek() === "+" || peek() === "-") { var op = t[p++]; n = { k: "bin", op: op, a: n, b: term() }; }
      return n;
    }
    function term() {
      var n = unary();
      while (peek() === "*" || peek() === "/" || peek() === "//" || peek() === "%") { var op = t[p++]; n = { k: "bin", op: op, a: n, b: unary() }; }
      return n;
    }
    function unary() {
      if (peek() === "-") {
        p++; var a = unary();
        // a minus straight on a number is part of the number, not an evaluation step of its own
        if (a.k === "lit") return { k: "lit", n: num(a.n.t === "int" ? 0 - a.n.v : -a.n.v, a.n.t) };
        return { k: "neg", a: a };
      }
      if (peek() === "+") { p++; return unary(); }
      return power();
    }
    function power() {
      var n = atom();
      if (peek() === "**") { p++; n = { k: "bin", op: "**", a: n, b: unary() }; }
      return n;
    }
    function atom() {
      var x = t[p];
      if (x === undefined) throw pyErr("SyntaxError", "the expression ends too early");
      if (x === "(") { if (++depth > 100) throw pyErr("Lab limit", "the lab reads at most 100 nested brackets"); p++; var n = sum(); take(")"); depth--; return { k: "group", a: n }; }
      if (/^0+[1-9]\d*$/.test(x)) throw pyErr("SyntaxError", "leading zeros in decimal integer literals are not permitted");
      if (/^[\d.]/.test(x)) { p++; return x.indexOf(".") >= 0 ? { k: "lit", n: num(parseFloat(x), "float") } : { k: "lit", n: num(checkInt(parseInt(x, 10)), "int") }; }
      throw pyErr("SyntaxError", "unexpected “" + x + "”");
    }
    var tree = sum();
    if (p < t.length) throw pyErr("SyntaxError", "unexpected “" + t[p] + "”");
    return tree;
  }

  var PREC = { "+": 1, "-": 1, "*": 2, "/": 2, "//": 2, "%": 2, neg: 3, "**": 4 };
  function print(n, parent, side) {
    if (n.k === "lit") {
      var s = show(n.n);
      // a negative number as the base of ** or after a unary minus needs brackets to keep its meaning
      if (n.n.v < 0 && parent && ((parent.op === "**" && side === "a") || parent.k === "neg")) return "(" + s + ")";
      return s;
    }
    if (n.k === "group") return "(" + print(n.a) + ")";
    if (n.k === "neg") return "-" + print(n.a, n, "a");
    var me = PREC[n.op], a = print(n.a, n, "a"), b = print(n.b, n, "b");
    if (n.a.k === "bin" && (PREC[n.a.op] < me || (n.op === "**" && n.a.op === "**"))) a = "(" + a + ")";
    if (n.b.k === "bin" && (PREC[n.b.op] < me || (PREC[n.b.op] === me && n.op !== "**"))) b = "(" + b + ")";
    return a + " " + n.op + " " + b;
  }
  // one evaluation step: the first operation, in Python's order, whose operands are already numbers
  function step(n) {
    if (n.k === "lit") return null;
    if (n.k === "group") {
      if (n.a.k === "lit") return { node: n.a, op: "brackets" };
      var g = step(n.a);
      return g && { node: { k: "group", a: g.node }, op: g.op, val: g.val };
    }
    if (n.k === "neg") {
      if (n.a.k === "lit") { var r = num(n.a.n.t === "int" ? 0 - n.a.n.v : -n.a.n.v, n.a.n.t); return { node: { k: "lit", n: r }, op: "-", val: r }; }
      var s = step(n.a);
      return s && { node: { k: "neg", a: s.node }, op: s.op, val: s.val };
    }
    if (n.a.k !== "lit") { var l = step(n.a); return { node: { k: "bin", op: n.op, a: l.node, b: n.b }, op: l.op, val: l.val }; }
    if (n.b.k !== "lit") { var q = step(n.b); return { node: { k: "bin", op: n.op, a: n.a, b: q.node }, op: q.op, val: q.val }; }
    var v = apply(n.op, n.a.n, n.b.n);
    return { node: { k: "lit", n: v }, op: n.op, val: v };
  }
  function evaluate(text) {
    var tree = parse(text), steps = [print(tree)], ops = [];
    for (var guard = 0; tree.k !== "lit" && guard < 200; guard++) {
      var s = step(tree);
      tree = s.node;
      if (s.op === "brackets") { steps[steps.length - 1] = print(tree); continue; } // dropping brackets is not a step of its own
      var shown = print(tree);
      if (shown === steps[steps.length - 1]) continue; // "-(4)" and "-4" print alike: one step on screen
      steps.push(shown);
      ops.push(s.op);
    }
    if (tree.k !== "lit") throw pyErr("Lab limit", "the lab shows at most 200 steps; shorten the expression");
    return { value: tree.n.v, type: tree.n.t, text: show(tree.n), steps: steps, ops: ops };
  }

  // ---------- strings ----------
  function pyIndex(s, i) {
    var n = s.length, j = i < 0 ? i + n : i;
    if (j < 0 || j >= n) throw pyErr("IndexError", "string index out of range");
    return s.charAt(j);
  }
  // Python's slice.indices(len): the positions a slice visits, in order; null means "left out"
  function sliceIndices(n, start, stop, step) {
    if (step === null || step === undefined) step = 1;
    if (step === 0) throw pyErr("ValueError", "slice step cannot be zero");
    function fix(x, def, lo, hi) {
      if (x === null || x === undefined) return def;
      if (x < 0) { x += n; return x < lo ? lo : x; }
      return x > hi ? hi : x;
    }
    var a, b, out = [];
    if (step > 0) { a = fix(start, 0, 0, n); b = fix(stop, n, 0, n); for (var i = a; i < b; i += step) out.push(i); }
    else { a = fix(start, n - 1, -1, n - 1); b = fix(stop, -1, -1, n - 1); for (var k = a; k > b; k += step) out.push(k); }
    return out;
  }
  function pySlice(s, start, stop, step) {
    return sliceIndices(s.length, start, stop, step).map(function (i) { return s.charAt(i); }).join("");
  }
  function sliceText(start, stop, step) {
    function f(x) { return x === null || x === undefined ? "" : String(x); }
    return "[" + f(start) + ":" + f(stop) + (step === null || step === undefined ? "" : ":" + step) + "]";
  }

  // ---------- range ----------
  function range(start, stop, step) {
    if (stop === undefined) { stop = start; start = 0; }
    if (step === undefined) step = 1;
    if (step === 0) throw pyErr("ValueError", "range() arg 3 must not be zero");
    var out = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) { out.push(i); if (out.length > 10000) throw pyErr("Range", "the lab stops after 10 000 values"); }
    return out;
  }

  // ---------- traces: one record per line run, with the variables and the output so far ----------
  function recorder() {
    var steps = [], vars = {}, out = [];
    return {
      steps: steps, vars: vars, out: out,
      at: function (line) { steps.push({ line: line, vars: Object.assign({}, vars), out: out.slice() }); },
      set: function (k, v) { vars[k] = v; },
      print: function (s) { out.push(s); },
    };
  }

  // the lecture's sum loop, with an optional break or continue at mysum == target (jump: "none" | "break" | "continue")
  function sumLoopCode(start, stop, step, jump, target) {
    var head = "for i in range(" + start + ", " + stop + (step === 1 ? "" : ", " + step) + "):";
    if (jump === "none") return ["mysum = 0", head, "    mysum += i", "print(mysum)"];
    return ["mysum = 0", head, "    mysum += i", "    if mysum == " + target + ":", "        " + jump, "    mysum += 1", "print(mysum)"];
  }
  function traceSumLoop(start, stop, step, jump, target) {
    var r = recorder(), code = sumLoopCode(start, stop, step, jump, target), mysum = 0, rounds = 0, end = jump === "none" ? 3 : 6;
    r.set("mysum", "0"); r.at(0);
    var vals = range(start, stop, step);
    for (var k = 0; k < vals.length; k++) {
      var i = vals[k];
      r.set("i", String(i)); r.at(1); rounds++;
      mysum += i; r.set("mysum", String(mysum)); r.at(2);
      if (jump !== "none") {
        r.at(3);
        if (mysum === target) {
          r.at(4);
          if (jump === "break") break;
          continue;
        }
        mysum += 1; r.set("mysum", String(mysum)); r.at(5);
      }
    }
    r.print(String(mysum)); r.at(end);
    return { code: code, steps: r.steps, result: mysum, rounds: rounds, output: r.out };
  }

  // halving with a while loop: how many rounds until n is no longer above 1
  function traceHalving(n0) {
    var r = recorder(), n = n0, rounds = 0, code = ["n = " + n0, "rounds = 0", "while n > 1:", "    n = n // 2", "    rounds += 1", "print(rounds, n)"];
    r.set("n", String(n)); r.at(0);
    r.set("rounds", "0"); r.at(1);
    for (;;) {
      r.at(2);
      if (!(n > 1)) break;
      n = floorDiv(n, 2); r.set("n", String(n)); r.at(3);
      rounds++; r.set("rounds", String(rounds)); r.at(4);
    }
    r.print(rounds + " " + n); r.at(5);
    return { code: code, steps: r.steps, result: rounds, n: n, output: r.out };
  }

  // nested loops with a break in the inner one
  function traceNested(outer, inner, stopAt) {
    var r = recorder(), count = 0, code = ["count = 0", "for i in range(" + outer + "):", "    for j in range(" + inner + "):", "        if j == " + stopAt + ":", "            break", "        count += 1", "print(count)"];
    r.set("count", "0"); r.at(0);
    for (var i = 0; i < outer; i++) {
      r.set("i", String(i)); r.at(1);
      for (var j = 0; j < inner; j++) {
        r.set("j", String(j)); r.at(2);
        r.at(3);
        if (j === stopAt) { r.at(4); break; }
        count++; r.set("count", String(count)); r.at(5);
      }
    }
    r.print(String(count)); r.at(6);
    return { code: code, steps: r.steps, result: count, output: r.out };
  }

  // break at the first square above a limit
  function traceFirstSquare(stop, limit) {
    var r = recorder(), code = ["for i in range(" + stop + "):", "    if i * i > " + limit + ":", "        break", "print(i)"], last = null;
    var vals = range(stop);
    for (var k = 0; k < vals.length; k++) {
      var i = vals[k]; last = i;
      r.set("i", String(i)); r.at(0);
      r.at(1);
      if (i * i > limit) { r.at(2); break; }
    }
    r.print(String(last)); r.at(3);
    return { code: code, steps: r.steps, result: last, output: r.out };
  }

  // the lecture's x and y program (§6.7); x and y arrive as floats from float(input(...))
  var XY_CODE = ["x = float(input(\"x: \"))", "y = float(input(\"y: \"))", "if x == y:", "    print(\"x and y are equal\")", "    if y != 0:", "        print(\"therefore, x / y is\", x/y)", "elif x < y:", "    print(\"x is smaller\")", "else:", "    print(\"y is smaller\")", "print(\"thanks!\")"];
  function traceXY(x, y) {
    var r = recorder();
    r.set("x", fmtFloat(x)); r.at(0);
    r.set("y", fmtFloat(y)); r.at(1);
    r.at(2);
    if (x === y) {
      r.print("x and y are equal"); r.at(3);
      r.at(4);
      if (y !== 0) { r.print("therefore, x / y is " + fmtFloat(x / y)); r.at(5); }
    } else {
      r.at(6);
      if (x < y) { r.print("x is smaller"); r.at(7); }
      else { r.at(8); r.print("y is smaller"); r.at(9); }
    }
    r.print("thanks!"); r.at(10);
    return { code: XY_CODE.slice(), steps: r.steps, output: r.out };
  }

  // an if/elif/else chain: only the first true condition's block runs
  function traceChain(x, a, b) {
    var r = recorder(), code = ["x = " + x, "if x > " + a + ":", "    print(\"big\")", "elif x > " + b + ":", "    print(\"mid\")", "else:", "    print(\"small\")"];
    r.set("x", String(x)); r.at(0);
    r.at(1);
    if (x > a) { r.print("big"); r.at(2); }
    else { r.at(3); if (x > b) { r.print("mid"); r.at(4); } else { r.at(5); r.print("small"); r.at(6); } }
    return { code: code, steps: r.steps, output: r.out };
  }

  var api = {
    fmtFloat: fmtFloat, evaluate: evaluate, apply: apply, floorDiv: floorDiv, pyMod: pyMod,
    pyIndex: pyIndex, pySlice: pySlice, sliceIndices: sliceIndices, sliceText: sliceText, range: range,
    sumLoopCode: sumLoopCode, traceSumLoop: traceSumLoop, traceHalving: traceHalving, traceNested: traceNested,
    traceFirstSquare: traceFirstSquare, traceXY: traceXY, traceChain: traceChain,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.APDR6 = api;
})(typeof window !== "undefined" ? window : globalThis);
