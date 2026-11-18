/* APDR Chapter 7 physics: a small Python interpreter for the lecture's programs about functions, scope, tuples and lists.
   It runs a subset of Python 3 (def, return, if/elif/else, for, while, assignment and unpacking, del, list and tuple
   literals, the list methods of the lecture, print, len, min, max, sorted, list, range) and records, after every
   statement, the frames, the objects they point to, the output and each for loop's hidden index. No DOM. */
(function (root) {
  var MAX_STEPS = 400;

  function PyError(type, msg) { var e = Error(type + ": " + msg); e.pyType = type; e.pyMsg = msg; return e; }
  function syntax(msg, line) { var e = PyError("SyntaxError", msg); e.line = line; return e; }

  // ---------- values ----------
  // int: JS integer; str: JS string; bool: true/false; None: null; objects: {t: "list"|"tuple"|"func"|"builtin"|"range", id}
  var nextId = 1;
  function list(items) { return { t: "list", id: nextId++, items: items }; }
  function tuple(items) { return { t: "tuple", id: nextId++, items: items }; }
  function typeName(v) {
    if (v === null) return "NoneType";
    if (typeof v === "boolean") return "bool";
    if (typeof v === "number") return "int";
    if (typeof v === "string") return "str";
    return { list: "list", tuple: "tuple", func: "function", builtin: "builtin_function_or_method", range: "range" }[v.t];
  }
  function strRepr(s) {
    var q = s.indexOf("'") >= 0 && s.indexOf('"') < 0 ? '"' : "'";
    return q + s.replace(/\\/g, "\\\\").replace(q === "'" ? /'/g : /"/g, "\\" + q).replace(/\n/g, "\\n") + q;
  }
  function repr(v, seen) {
    if (v === null) return "None";
    if (v === true) return "True";
    if (v === false) return "False";
    if (typeof v === "number") return String(v);
    if (typeof v === "string") return strRepr(v);
    if (v.t === "func") return "<function " + v.name + ">";
    if (v.t === "builtin") return "<built-in function " + v.name + ">";
    if (v.t === "range") return "range(" + v.start + ", " + v.stop + (v.step !== 1 ? ", " + v.step : "") + ")";
    seen = seen || [];
    if (seen.indexOf(v) >= 0) return v.t === "list" ? "[...]" : "(...)";
    var inner = v.items.map(function (x) { return repr(x, seen.concat([v])); }).join(", ");
    return v.t === "list" ? "[" + inner + "]" : "(" + inner + (v.items.length === 1 ? "," : "") + ")";
  }
  function str(v) { return typeof v === "string" ? v : repr(v); }
  function truthy(v) {
    if (v === null || v === false || v === 0 || v === "") return false;
    if (typeof v === "object" && v.items) return v.items.length > 0;
    if (typeof v === "object" && v.t === "range") return rangeItems(v).length > 0;
    return true;
  }
  function eq(a, b) {
    if (a === b) return true;
    var nb = function (x) { return typeof x === "number" || typeof x === "boolean"; };
    if (nb(a) && nb(b)) return Number(a) === Number(b);
    if (a && b && typeof a === "object" && typeof b === "object" && a.items && b.items && a.t === b.t) {
      return a.items.length === b.items.length && a.items.every(function (x, i) { return eq(x, b.items[i]); });
    }
    return false;
  }
  function less(a, b) {
    var ta = typeName(a), tb = typeName(b), num = function (t) { return t === "int" || t === "bool"; };
    if (num(ta) && num(tb)) return Number(a) < Number(b);
    if (ta === "str" && tb === "str") return a < b;
    if ((ta === "list" || ta === "tuple") && ta === tb) {
      for (var i = 0; i < Math.min(a.items.length, b.items.length); i++) {
        if (!eq(a.items[i], b.items[i])) return less(a.items[i], b.items[i]);
      }
      return a.items.length < b.items.length;
    }
    throw PyError("TypeError", "'<' not supported between instances of '" + ta + "' and '" + tb + "'");
  }
  function rangeItems(r) {
    var out = [];
    for (var i = r.start; r.step > 0 ? i < r.stop : i > r.stop; i += r.step) { out.push(i); if (out.length > 10000) break; }
    return out;
  }
  function iterItems(v) {
    if (typeof v === "string") return v.split("");
    if (v && v.items) return v.items;
    if (v && v.t === "range") return rangeItems(v);
    throw PyError("TypeError", "'" + typeName(v) + "' object is not iterable");
  }
  function checkInt(v) { if (typeof v === "number" && Math.abs(v) > 1e15) throw PyError("OverflowError", "this lab keeps whole numbers below 10^15"); return v; }
  function floorDiv(a, b) { if (b === 0) throw PyError("ZeroDivisionError", "division by zero"); return Math.floor(a / b) + 0; }
  function pyMod(a, b) { if (b === 0) throw PyError("ZeroDivisionError", "division by zero"); var m = a % b; if (m !== 0 && (m < 0) !== (b < 0)) m += b; return m + 0; }

  // ---------- lexer ----------
  var OPS = ["//=", "**", "//", "==", "!=", "<=", ">=", "+=", "-=", "*=", "%=", "->", "+", "-", "*", "/", "%", "<", ">", "=", "(", ")", "[", "]", "{", "}", ",", ":", "."];
  var KEYWORDS = ["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "is", "del", "pass", "break", "continue", "True", "False", "None", "global", "lambda", "class", "import", "from", "with", "try", "except", "finally", "raise", "yield", "as", "assert", "nonlocal", "async", "await"];
  function tokenize(text, line) {
    var toks = [], i = 0;
    while (i < text.length) {
      var ch = text[i];
      if (ch === " " || ch === "\t") { i++; continue; }
      if (ch === "#") break;
      if (ch === '"' || ch === "'") {
        var j = i + 1, val = "";
        while (j < text.length && text[j] !== ch) {
          if (text[j] === "\\" && j + 1 < text.length) { var nx = text[j + 1]; val += nx === "n" ? "\n" : nx === "t" ? "\t" : nx; j += 2; }
          else val += text[j++];
        }
        if (j >= text.length) throw syntax("unterminated string literal (detected at line " + (line + 1) + ")", line);
        toks.push({ k: "str", v: val }); i = j + 1; continue;
      }
      if ("“”‘’".indexOf(ch) >= 0) throw syntax("invalid character '" + ch + "' (U+" + ch.charCodeAt(0).toString(16).toUpperCase() + "): use straight quotes", line);
      if (/[0-9]/.test(ch)) {
        var m = /^[0-9][0-9_]*(\.[0-9]*)?([eE][-+]?[0-9]+)?/.exec(text.slice(i))[0];
        if (/[.eE]/.test(m)) throw syntax("this lab handles whole numbers only, not " + m, line);
        toks.push({ k: "num", v: parseInt(m.replace(/_/g, ""), 10) }); i += m.length; continue;
      }
      if (/[A-Za-z_]/.test(ch)) {
        var w = /^[A-Za-z_][A-Za-z_0-9]*/.exec(text.slice(i))[0];
        toks.push({ k: KEYWORDS.indexOf(w) >= 0 ? "kw" : "name", v: w }); i += w.length; continue;
      }
      var op = null;
      for (var o = 0; o < OPS.length; o++) if (text.substr(i, OPS[o].length) === OPS[o]) { op = OPS[o]; break; }
      if (!op) throw syntax("invalid character '" + ch + "'", line);
      toks.push({ k: "op", v: op }); i += op.length;
    }
    return toks;
  }

  // ---------- parser ----------
  function Parser(toks, line) { this.t = toks; this.i = 0; this.line = line; }
  Parser.prototype = {
    peek: function (o) { return this.t[this.i + (o || 0)]; },
    is: function (k, v) { var x = this.t[this.i]; return !!x && x.k === k && (v === undefined || x.v === v); },
    isOp: function (v) { return this.is("op", v); },
    eat: function (k, v) { if (this.is(k, v)) return this.t[this.i++]; return null; },
    need: function (k, v, what) {
      var x = this.eat(k, v);
      if (!x) { var got = this.t[this.i]; throw syntax(got ? "invalid syntax near '" + got.v + "'" : "expected " + (what || "'" + v + "'"), this.line); }
      return x;
    },
    done: function () { return this.i >= this.t.length; },
    end: function () { if (!this.done()) throw syntax("invalid syntax near '" + this.t[this.i].v + "'", this.line); },
    // a comma list makes a tuple: "a, b" or "(a, b)"
    exprList: function () {
      var first = this.expr();
      if (!this.isOp(",")) return first;
      var items = [first];
      while (this.eat("op", ",")) { if (this.done() || this.isOp("=") || this.isOp(")") || this.isOp(":")) break; items.push(this.expr()); }
      return { k: "tuple", items: items };
    },
    expr: function () { return this.or(); },
    or: function () { var a = this.and(); while (this.eat("kw", "or")) a = { k: "or", a: a, b: this.and() }; return a; },
    and: function () { var a = this.not(); while (this.eat("kw", "and")) a = { k: "and", a: a, b: this.not() }; return a; },
    not: function () { if (this.eat("kw", "not")) return { k: "not", a: this.not() }; return this.cmp(); },
    cmp: function () {
      var a = this.add(), ops = [], rest = [];
      for (;;) {
        var op = null;
        if (this.is("op") && ["==", "!=", "<", ">", "<=", ">="].indexOf(this.peek().v) >= 0) op = this.t[this.i++].v;
        else if (this.eat("kw", "in")) op = "in";
        else if (this.is("kw", "not") && this.peek(1) && this.peek(1).k === "kw" && this.peek(1).v === "in") { this.i += 2; op = "not in"; }
        else if (this.eat("kw", "is")) op = this.eat("kw", "not") ? "is not" : "is";
        if (!op) break;
        ops.push(op); rest.push(this.add());
      }
      return ops.length ? { k: "cmp", first: a, ops: ops, rest: rest } : a;
    },
    add: function () {
      var a = this.mul();
      while (this.isOp("+") || this.isOp("-")) { var op = this.t[this.i++].v; a = { k: "bin", op: op, a: a, b: this.mul() }; }
      return a;
    },
    mul: function () {
      var a = this.unary();
      while (this.isOp("*") || this.isOp("//") || this.isOp("%") || this.isOp("/")) {
        var op = this.t[this.i++].v;
        if (op === "/") throw syntax("this lab handles whole numbers only: use // for division", this.line);
        a = { k: "bin", op: op, a: a, b: this.unary() };
      }
      return a;
    },
    unary: function () { if (this.eat("op", "-")) return { k: "neg", a: this.unary() }; if (this.eat("op", "+")) return this.unary(); return this.power(); },
    power: function () { var a = this.postfix(); if (this.eat("op", "**")) return { k: "bin", op: "**", a: a, b: this.unary() }; return a; },
    postfix: function () {
      var a = this.atom();
      for (;;) {
        if (this.eat("op", "(")) {
          var args = [];
          while (!this.isOp(")")) { args.push(this.expr()); if (!this.eat("op", ",")) break; }
          this.need("op", ")");
          a = { k: "call", f: a, args: args };
        } else if (this.eat("op", "[")) {
          var parts = [null, null, null], n = 0, isSlice = false;
          for (;;) {
            if (!this.isOp(":") && !this.isOp("]")) parts[n] = this.expr();
            if (this.eat("op", ":")) { isSlice = true; n++; if (n > 2) throw syntax("invalid slice", this.line); continue; }
            break;
          }
          this.need("op", "]");
          a = isSlice ? { k: "slice", a: a, lo: parts[0], hi: parts[1], st: parts[2] } : { k: "index", a: a, i: parts[0] };
          if (!isSlice && !parts[0]) throw syntax("invalid syntax: an index is needed between [ and ]", this.line);
        } else if (this.eat("op", ".")) {
          a = { k: "attr", a: a, name: this.need("name", undefined, "a method name").v };
        } else return a;
      }
    },
    atom: function () {
      var x = this.peek();
      if (!x) throw syntax("invalid syntax: the line ends too early", this.line);
      if (x.k === "num") { this.i++; return { k: "const", v: checkInt(x.v) }; }
      if (x.k === "str") {
        this.i++; var s = x.v;
        while (this.is("str")) s += this.t[this.i++].v; // adjacent strings join
        return { k: "const", v: s };
      }
      if (x.k === "kw" && (x.v === "True" || x.v === "False" || x.v === "None")) { this.i++; return { k: "const", v: x.v === "None" ? null : x.v === "True" }; }
      if (x.k === "name") { this.i++; return { k: "name", name: x.v }; }
      if (this.eat("op", "[")) {
        var items = [];
        while (!this.isOp("]")) { items.push(this.expr()); if (!this.eat("op", ",")) break; }
        this.need("op", "]");
        return { k: "list", items: items };
      }
      if (this.eat("op", "(")) {
        if (this.eat("op", ")")) return { k: "tuple", items: [] };
        var e = this.expr();
        if (this.eat("op", ")")) return e;
        var its = [e];
        while (this.eat("op", ",")) { if (this.isOp(")")) break; its.push(this.expr()); }
        this.need("op", ")");
        return { k: "tuple", items: its };
      }
      if (x.k === "kw") throw syntax("invalid syntax: '" + x.v + "' cannot be used here", this.line);
      throw syntax("invalid syntax near '" + x.v + "'", this.line);
    },
  };

  function targetOf(e, line) {
    if (e.k === "name" || e.k === "index" || e.k === "attr") return e;
    if (e.k === "tuple") { e.items.forEach(function (x) { if (x.k !== "name") throw syntax("cannot assign to " + describe(x), line); }); return e; }
    if (e.k === "slice") throw syntax("this lab does not assign to slices", line);
    throw syntax("cannot assign to " + describe(e) + " here. Maybe you meant '==' instead of '='?", line);
  }
  function describe(e) { return { call: "function call", const: "literal", bin: "expression", cmp: "comparison", list: "list display" }[e.k] || "expression"; }

  // split the program into statements with their blocks
  function parse(lines) {
    var rows = [];
    lines.forEach(function (raw, n) {
      if (/\t/.test(raw)) raw = raw.replace(/\t/g, "    ");
      var body = raw.replace(/^\s+/, "");
      if (!body || body[0] === "#") return;
      rows.push({ n: n, ind: raw.length - body.length, text: body });
    });
    var pos = 0;
    function block(ind) {
      var out = [];
      while (pos < rows.length && rows[pos].ind === ind) out.push(stmt(ind));
      if (pos < rows.length && rows[pos].ind > ind) throw syntax("unexpected indent", rows[pos].n);
      return out;
    }
    function body(header, ind) {
      if (pos >= rows.length || rows[pos].ind <= ind) throw syntax("expected an indented block after line " + (header + 1), pos < rows.length ? rows[pos].n : header);
      return block(rows[pos].ind);
    }
    function stmt(ind) {
      var r = rows[pos++], toks = tokenize(r.text, r.n), P = new Parser(toks, r.n), line = r.n, s;
      var colonEnd = function () {
        if (!toks.length || toks[toks.length - 1].v !== ":") throw syntax("expected ':'", line);
        P.t = toks.slice(0, -1);
      };
      var kw = toks[0] && toks[0].k === "kw" ? toks[0].v : null;
      if (kw === "def") {
        colonEnd(); P.i = 1;
        var name = P.need("name", undefined, "a function name").v, params = [];
        P.need("op", "(");
        while (!P.isOp(")")) { params.push(P.need("name", undefined, "a parameter name").v); if (!P.eat("op", ",")) break; }
        P.need("op", ")"); P.end();
        s = { k: "def", name: name, params: params, line: line };
        s.body = body(line, ind);
        return s;
      }
      if (kw === "if" || kw === "while") {
        colonEnd(); P.i = 1;
        var cond = P.expr(); P.end();
        if (kw === "while") return { k: "while", cond: cond, line: line, body: body(line, ind) };
        s = { k: "if", line: line, branches: [{ cond: cond, line: line, body: body(line, ind) }], orelse: null };
        while (pos < rows.length && rows[pos].ind === ind && /^(elif|else)\b/.test(rows[pos].text)) {
          var rr = rows[pos++], tt = tokenize(rr.text, rr.n);
          if (!tt.length || tt[tt.length - 1].v !== ":") throw syntax("expected ':'", rr.n);
          if (tt[0].v === "else") { if (tt.length !== 2) throw syntax("invalid syntax", rr.n); s.orelse = body(rr.n, ind); s.elseLine = rr.n; break; }
          var PP = new Parser(tt.slice(1, -1), rr.n), c2 = PP.expr(); PP.end();
          s.branches.push({ cond: c2, line: rr.n, body: body(rr.n, ind) });
        }
        return s;
      }
      if (kw === "elif" || kw === "else") throw syntax("invalid syntax: '" + kw + "' without a matching if", line);
      if (kw === "for") {
        colonEnd(); P.i = 1;
        var names = [P.need("name", undefined, "a loop variable").v];
        while (P.eat("op", ",")) names.push(P.need("name", undefined, "a loop variable").v);
        P.need("kw", "in"); var seq = P.exprList(); P.end();
        return { k: "for", target: names.length === 1 ? { k: "name", name: names[0] } : { k: "tuple", items: names.map(function (x) { return { k: "name", name: x }; }) }, seq: seq, line: line, body: body(line, ind) };
      }
      if (toks.length && toks[toks.length - 1].v === ":" && !kw) throw syntax("invalid syntax", line);
      if (kw === "return") { P.i = 1; s = { k: "return", e: P.done() ? null : P.exprList(), line: line }; P.end(); return s; }
      if (kw === "pass" || kw === "break" || kw === "continue") { if (toks.length !== 1) throw syntax("invalid syntax", line); return { k: kw, line: line }; }
      if (kw === "global") { P.i = 1; var gs = [P.need("name").v]; while (P.eat("op", ",")) gs.push(P.need("name").v); P.end(); return { k: "global", names: gs, line: line }; }
      if (kw === "del") {
        P.i = 1; var de = P.exprList(); P.end();
        var ts = de.k === "tuple" ? de.items : [de];
        ts.forEach(function (x) { if (x.k !== "name" && x.k !== "index") throw syntax("cannot delete " + describe(x), line); });
        return { k: "del", targets: ts, line: line };
      }
      if (kw && ["True", "False", "None", "not"].indexOf(kw) < 0) throw syntax("this lab does not support '" + kw + "'", line);
      if (toks[0] && toks[0].k === "name" && toks[0].v === "print" && toks[1] && !(toks[1].k === "op" && toks[1].v === "(")) {
        throw syntax("Missing parentheses in call to 'print'. Did you mean print(...)?", line);
      }
      // assignment, augmented assignment or a bare expression
      var e = P.exprList();
      if (P.is("op") && ["+=", "-=", "*=", "//=", "%="].indexOf(P.peek().v) >= 0) {
        var aop = P.t[P.i++].v; if (e.k !== "name" && e.k !== "index") throw syntax("illegal expression for augmented assignment", line);
        s = { k: "aug", target: e, op: aop.slice(0, -1), e: P.exprList(), line: line }; P.end(); return s;
      }
      if (P.isOp("=")) {
        var targets = [targetOf(e, line)];
        var value;
        while (P.eat("op", "=")) { value = P.exprList(); if (P.isOp("=")) targets.push(targetOf(value, line)); }
        P.end();
        return { k: "assign", targets: targets, e: value, line: line };
      }
      P.end();
      return { k: "expr", e: e, line: line };
    }
    var prog = block(0);
    if (pos < rows.length) throw syntax("unindent does not match any outer indentation level", rows[pos].n);
    return prog;
  }

  // names a function assigns anywhere in its own body are local to it
  function localsOf(fn) {
    var loc = {}, glob = {};
    (function walk(body) {
      body.forEach(function (s) {
        var add = function (t) { if (t.k === "name") loc[t.name] = 1; else if (t.k === "tuple") t.items.forEach(add); };
        if (s.k === "assign") s.targets.forEach(add);
        else if (s.k === "aug") add(s.target);
        else if (s.k === "for") { add(s.target); walk(s.body); }
        else if (s.k === "def") loc[s.name] = 1;
        else if (s.k === "del") s.targets.forEach(add);
        else if (s.k === "global") s.names.forEach(function (n) { glob[n] = 1; });
        if (s.k === "while") walk(s.body);
        if (s.k === "if") { s.branches.forEach(function (b) { walk(b.body); }); if (s.orelse) walk(s.orelse); }
      });
    })(fn.body);
    fn.params.forEach(function (p) { loc[p] = 1; });
    Object.keys(glob).forEach(function (n) { delete loc[n]; });
    return { loc: loc, glob: glob };
  }

  // ---------- interpreter ----------
  function BreakSig() {} function ContinueSig() {} function ReturnSig(v) { this.v = v; }

  function run(code, opts) {
    opts = opts || {};
    nextId = 1;
    var lines = typeof code === "string" ? code.split("\n") : code.slice();
    var result = { code: lines, steps: [], output: [], error: null, errorLine: -1, frames: null };
    var out = result.output, frames = [], iters = [];
    var G = { name: "Global frame", vars: {}, order: [], fn: null };
    frames.push(G);
    var prog;
    try { prog = parse(lines); }
    catch (e) { result.error = e.pyType ? e.message : "SyntaxError: " + e.message; result.errorLine = e.line != null ? e.line : 0; result.steps.push(snap(e.line || 0, result.error)); return result; }

    function setVar(f, name, v) { if (!(name in f.vars)) f.order.push(name); f.vars[name] = v; }
    function delVar(f, name) { delete f.vars[name]; f.order.splice(f.order.indexOf(name), 1); }
    function top() { return frames[frames.length - 1]; }

    function snapVal(v) { return v !== null && typeof v === "object" && (v.t === "list" || v.t === "tuple") ? { r: v.id } : { p: v !== null && typeof v === "object" && v.t === "func" ? "function " + v.name : repr(v) }; }
    function snap(line, error, note) {
      var heap = {}, order = [];
      function visit(v) {
        if (v === null || typeof v !== "object" || !v.items || heap[v.id]) return;
        heap[v.id] = { id: v.id, t: v.t, items: v.items.map(snapVal) };
        order.push(v.id);
        v.items.forEach(visit);
      }
      var fs = frames.map(function (f) {
        var vars = f.order.map(function (n) { visit(f.vars[n]); return [n, snapVal(f.vars[n])]; });
        if (f.hasRet) { visit(f.ret); vars.push(["Return value", snapVal(f.ret)]); }
        return { name: f.name, vars: vars };
      });
      iters.forEach(function (it) { if (it.obj && it.obj.items) visit(it.obj); });
      order.sort(function (a, b) { return a - b; });
      return { line: line, frames: fs, heap: order.map(function (id) { return heap[id]; }), out: out.slice(),
        iters: iters.filter(function (it) { return it.obj && it.obj.items; }).map(function (it) { return { r: it.obj.id, idx: it.idx }; }), error: error || "", note: note || "" };
    }
    function step(line, note) {
      result.steps.push(snap(line, "", note));
      if (result.steps.length > MAX_STEPS) { var e = Error("Stopped after " + MAX_STEPS + " steps: the program may never end."); e.stop = true; throw e; }
    }

    function lookup(name) {
      var f = top();
      if (f.fn) {
        if (f.locals.loc[name]) {
          if (name in f.vars) return f.vars[name];
          throw PyError("UnboundLocalError", "cannot access local variable '" + name + "' where it is not associated with a value");
        }
      }
      if (name in G.vars) return G.vars[name];
      if (BUILTINS[name]) return BUILTINS[name];
      throw PyError("NameError", "name '" + name + "' is not defined");
    }
    function bind(name, v) { var f = top(); if (f.fn && f.locals.glob[name]) setVar(G, name, v); else setVar(f, name, v); }

    function index(seq, i, forWrite) {
      var t = typeName(seq);
      if (typeof i !== "number" && typeof i !== "boolean") throw PyError("TypeError", t + " indices must be integers or slices, not " + typeName(i));
      var items = typeof seq === "string" ? seq : seq.items, n = items.length, j = Number(i) < 0 ? Number(i) + n : Number(i);
      if (j < 0 || j >= n) throw PyError("IndexError", t + (forWrite ? " assignment" : "") + " index out of range");
      return j;
    }
    function sliceIdx(n, lo, hi, st) {
      st = st == null ? 1 : st;
      if (st === 0) throw PyError("ValueError", "slice step cannot be zero");
      var clamp = function (v, def, low, high) { if (v == null) return def; if (v < 0) v += n; return Math.max(low, Math.min(high, v)); };
      var a = st > 0 ? clamp(lo, 0, 0, n) : clamp(lo, n - 1, -1, n - 1), b = st > 0 ? clamp(hi, n, 0, n) : clamp(hi, -1, -1, n - 1), out = [];
      for (var i = a; st > 0 ? i < b : i > b; i += st) out.push(i);
      return out;
    }

    function binop(op, a, b) {
      var ta = typeName(a), tb = typeName(b), num = function (t) { return t === "int" || t === "bool"; };
      if (num(ta) && num(tb)) {
        a = Number(a); b = Number(b);
        if (op === "+") return checkInt(a + b);
        if (op === "-") return checkInt(a - b);
        if (op === "*") return checkInt(a * b);
        if (op === "//") return floorDiv(a, b);
        if (op === "%") return pyMod(a, b);
        if (op === "**") { if (b < 0) throw PyError("ValueError", "this lab keeps whole numbers: no negative powers"); return checkInt(Math.pow(a, b)); }
      }
      if (op === "+") {
        if (ta === tb && ta === "str") return a + b;
        if (ta === tb && ta === "list") return list(a.items.concat(b.items));
        if (ta === tb && ta === "tuple") return tuple(a.items.concat(b.items));
        if (ta === "str" || ta === "list" || ta === "tuple") throw PyError("TypeError", "can only concatenate " + ta + " (not \"" + tb + "\") to " + ta);
      }
      if (op === "*") {
        var seq = num(ta) ? b : a, k = num(ta) ? Number(a) : Number(b), ts = typeName(seq);
        if ((num(ta) || num(tb)) && (ts === "str" || ts === "list" || ts === "tuple")) {
          if (k * (typeof seq === "string" ? seq.length : seq.items.length) > 2000) throw PyError("MemoryError", "this lab keeps repeated sequences short");
          if (ts === "str") return k > 0 ? new Array(k + 1).join(seq) : "";
          var items = []; for (var i = 0; i < k; i++) items = items.concat(seq.items);
          return ts === "list" ? list(items) : tuple(items);
        }
      }
      throw PyError("TypeError", "unsupported operand type(s) for " + op + ": '" + ta + "' and '" + tb + "'");
    }
    function contains(seq, x) {
      if (typeof seq === "string") { if (typeof x !== "string") throw PyError("TypeError", "'in <string>' requires string as left operand, not " + typeName(x)); return seq.indexOf(x) >= 0; }
      return iterItems(seq).some(function (y) { return eq(x, y); });
    }

    function evalE(e) {
      switch (e.k) {
        case "const": return e.v;
        case "name": return lookup(e.name);
        case "list": return list(e.items.map(evalE));
        case "tuple": return tuple(e.items.map(evalE));
        case "neg": { var v = evalE(e.a); if (typeof v !== "number" && typeof v !== "boolean") throw PyError("TypeError", "bad operand type for unary -: '" + typeName(v) + "'"); return 0 - Number(v); }
        case "not": return !truthy(evalE(e.a));
        case "and": { var a = evalE(e.a); return truthy(a) ? evalE(e.b) : a; }
        case "or": { var o = evalE(e.a); return truthy(o) ? o : evalE(e.b); }
        case "bin": return binop(e.op, evalE(e.a), evalE(e.b));
        case "cmp": {
          var left = evalE(e.first);
          for (var i = 0; i < e.ops.length; i++) {
            var right = evalE(e.rest[i]), op = e.ops[i], ok;
            if (op === "==") ok = eq(left, right);
            else if (op === "!=") ok = !eq(left, right);
            else if (op === "<") ok = less(left, right);
            else if (op === ">") ok = less(right, left);
            else if (op === "<=") ok = less(left, right) || eq(left, right);
            else if (op === ">=") ok = less(right, left) || eq(left, right);
            else if (op === "in") ok = contains(right, left);
            else if (op === "not in") ok = !contains(right, left);
            else if (op === "is") ok = left === right;
            else ok = left !== right;
            if (!ok) return false;
            left = right;
          }
          return true;
        }
        case "index": {
          var s = evalE(e.a), ix = evalE(e.i);
          if (typeName(s) === "range") s = list(rangeItems(s));
          if (typeof s !== "string" && !(s && s.items)) throw PyError("TypeError", "'" + typeName(s) + "' object is not subscriptable");
          var j = index(s, ix);
          return typeof s === "string" ? s.charAt(j) : s.items[j];
        }
        case "slice": {
          var sq = evalE(e.a), lo = e.lo ? evalE(e.lo) : null, hi = e.hi ? evalE(e.hi) : null, st = e.st ? evalE(e.st) : null;
          if (typeof sq !== "string" && !(sq && sq.items)) throw PyError("TypeError", "'" + typeName(sq) + "' object is not subscriptable");
          var src = typeof sq === "string" ? sq : sq.items, picked = sliceIdx(src.length, lo, hi, st).map(function (k) { return src[k]; });
          return typeof sq === "string" ? picked.join("") : sq.t === "list" ? list(picked) : tuple(picked);
        }
        case "attr": throw PyError("TypeError", "this lab calls methods only, such as L.append(x)");
        case "call": {
          if (e.f.k === "attr") return callMethod(evalE(e.f.a), e.f.name, e.args.map(evalE));
          var f = evalE(e.f), args = e.args.map(evalE);
          return call(f, args);
        }
      }
      throw PyError("SyntaxError", "invalid syntax");
    }

    function call(f, args) {
      if (f && f.t === "builtin") return f.fn(args);
      if (!f || f.t !== "func") throw PyError("TypeError", "'" + typeName(f) + "' object is not callable");
      var np = f.params.length;
      if (args.length < np) {
        var miss = f.params.slice(args.length);
        throw PyError("TypeError", f.name + "() missing " + miss.length + " required positional argument" + (miss.length > 1 ? "s" : "") + ": " + miss.map(function (m) { return "'" + m + "'"; }).join(miss.length > 2 ? ", " : " and ").replace(/, ('[^']*')$/, ", and $1"));
      }
      if (args.length > np) throw PyError("TypeError", f.name + "() takes " + np + " positional argument" + (np === 1 ? "" : "s") + " but " + args.length + (args.length === 1 ? " was" : " were") + " given");
      if (frames.length > 40) throw PyError("RecursionError", "maximum recursion depth exceeded");
      var fr = { name: f.name, vars: {}, order: [], fn: f, locals: f.locals || (f.locals = localsOf(f)) };
      f.params.forEach(function (p, i) { setVar(fr, p, args[i]); });
      frames.push(fr);
      var savedIters = iters; iters = [];
      step(f.line, "call " + f.name);
      var ret = null;
      try { execBlock(f.body); fr.hasRet = true; fr.ret = null; step(lastLine(f.body), "return"); }
      catch (sig) {
        if (!(sig instanceof ReturnSig)) { iters = savedIters; throw sig; }
        ret = sig.v;
      }
      iters = savedIters;
      frames.pop();
      return ret;
    }
    function lastLine(body) { var s = body[body.length - 1]; return s.k === "if" || s.k === "for" || s.k === "while" ? s.line : s.line; }

    function callMethod(obj, name, args) {
      var t = typeName(obj), need = function (n) {
        if (args.length !== n) throw PyError("TypeError", t + "." + name + "() takes " + (n === 0 ? "no arguments" : "exactly one argument") + " (" + args.length + " given)");
      };
      if (t === "list") {
        var L = obj.items;
        switch (name) {
          case "append": need(1); L.push(args[0]); return null;
          case "extend": need(1); var add = iterItems(args[0]).slice(); for (var i = 0; i < add.length; i++) L.push(add[i]); return null;
          case "remove": need(1); for (var j = 0; j < L.length; j++) if (eq(L[j], args[0])) { L.splice(j, 1); return null; } throw PyError("ValueError", "list.remove(x): x not in list");
          case "pop":
            if (args.length > 1) throw PyError("TypeError", "pop expected at most 1 argument, got " + args.length);
            if (!L.length) throw PyError("IndexError", "pop from empty list");
            var k = args.length ? Number(args[0]) : L.length - 1; if (k < 0) k += L.length;
            if (k < 0 || k >= L.length) throw PyError("IndexError", "pop index out of range");
            return L.splice(k, 1)[0];
          case "insert": if (args.length !== 2) throw PyError("TypeError", "insert expected 2 arguments, got " + args.length);
            var at = Number(args[0]); if (at < 0) at = Math.max(0, at + L.length); at = Math.min(at, L.length); L.splice(at, 0, args[1]); return null;
          case "sort": need(0);
            var copy = L.slice();
            for (var a = 1; a < copy.length; a++) { var x = copy[a], b = a - 1; while (b >= 0 && less(x, copy[b])) { copy[b + 1] = copy[b]; b--; } copy[b + 1] = x; }
            for (var c = 0; c < copy.length; c++) L[c] = copy[c];
            return null;
          case "reverse": need(0); L.reverse(); return null;
          case "index": need(1); for (var d = 0; d < L.length; d++) if (eq(L[d], args[0])) return d; throw PyError("ValueError", repr(args[0]) + " is not in list");
          case "count": need(1); return L.filter(function (y) { return eq(y, args[0]); }).length;
          case "copy": need(0); return list(L.slice());
        }
      }
      if (t === "tuple" && (name === "index" || name === "count")) {
        need(1);
        if (name === "count") return obj.items.filter(function (y) { return eq(y, args[0]); }).length;
        for (var e = 0; e < obj.items.length; e++) if (eq(obj.items[e], args[0])) return e;
        throw PyError("ValueError", "tuple.index(x): x not in tuple");
      }
      if (t === "str") {
        if (name === "split") {
          if (args.length === 0) return list(obj.split(/\s+/).filter(Boolean));
          if (typeof args[0] !== "string") throw PyError("TypeError", "must be str or None, not " + typeName(args[0]));
          if (args[0] === "") throw PyError("ValueError", "empty separator");
          return list(obj.split(args[0]));
        }
        if (name === "join") {
          need(1);
          var parts = iterItems(args[0]);
          parts.forEach(function (p, n) { if (typeof p !== "string") throw PyError("TypeError", "sequence item " + n + ": expected str instance, " + typeName(p) + " found"); });
          return parts.join(obj);
        }
        if (name === "upper") { need(0); return obj.toUpperCase(); }
        if (name === "lower") { need(0); return obj.toLowerCase(); }
      }
      throw PyError("AttributeError", "'" + t + "' object has no attribute '" + name + "'");
    }

    function assign(t, v) {
      if (t.k === "name") return bind(t.name, v);
      if (t.k === "tuple") {
        if (typeName(v) === "range") v = list(rangeItems(v));
        if (typeof v !== "string" && !(v && v.items)) throw PyError("TypeError", "cannot unpack non-iterable " + typeName(v) + " object");
        var items = iterItems(v);
        if (items.length > t.items.length) throw PyError("ValueError", "too many values to unpack (expected " + t.items.length + ", got " + items.length + ")");
        if (items.length < t.items.length) throw PyError("ValueError", "not enough values to unpack (expected " + t.items.length + ", got " + items.length + ")");
        items = items.slice();
        return t.items.forEach(function (x, i) { bind(x.name, items[i]); });
      }
      if (t.k === "index") {
        var s = evalE(t.a), i = evalE(t.i), ts = typeName(s);
        if (ts !== "list") throw PyError("TypeError", "'" + ts + "' object does not support item assignment");
        s.items[index(s, i, true)] = v;
        return;
      }
      throw PyError("SyntaxError", "cannot assign here");
    }

    function exec(s) {
      switch (s.k) {
        case "expr": evalE(s.e); step(s.line); return;
        case "assign": { var v = evalE(s.e); s.targets.forEach(function (t) { assign(t, v); }); step(s.line); return; }
        case "aug": {
          var cur = evalE(s.target), rhs = evalE(s.e), nv;
          if (s.op === "+" && typeName(cur) === "list") { var add = iterItems(rhs).slice(); for (var k = 0; k < add.length; k++) cur.items.push(add[k]); nv = cur; } // += on a list mutates it in place
          else {
            try { nv = binop(s.op, cur, rhs); }
            catch (err) { if (err.pyType === "TypeError" && err.pyMsg.indexOf("unsupported operand") === 0) throw PyError("TypeError", err.pyMsg.replace("for " + s.op + ":", "for " + s.op + "=:")); throw err; }
          }
          assign(s.target, nv); step(s.line); return;
        }
        case "def": { var f = { t: "func", name: s.name, params: s.params, body: s.body, line: s.line }; bind(s.name, f); step(s.line); return; }
        case "return": throw new ReturnSig((function () { var r = s.e ? evalE(s.e) : null, fr = top(); if (!fr.fn) throw syntax("'return' outside function", s.line); fr.hasRet = true; fr.ret = r; step(s.line, "return"); return r; })());
        case "pass": step(s.line); return;
        case "break": step(s.line); throw new BreakSig();
        case "continue": step(s.line); throw new ContinueSig();
        case "global": step(s.line); return;
        case "del":
          s.targets.forEach(function (t) {
            if (t.k === "name") { var fr = top(); var holder = fr.fn && fr.locals.glob[t.name] ? G : fr; if (!(t.name in holder.vars)) { lookup(t.name); throw PyError("NameError", "name '" + t.name + "' is not defined"); } delVar(holder, t.name); }
            else { var sq = evalE(t.a), ix = evalE(t.i), ts = typeName(sq); if (ts !== "list") throw PyError("TypeError", "'" + ts + "' object does not support item deletion"); sq.items.splice(index(sq, ix, true), 1); }
          });
          step(s.line); return;
        case "if": {
          for (var b = 0; b < s.branches.length; b++) {
            var br = s.branches[b], ok = truthy(evalE(br.cond));
            step(br.line);
            if (ok) return execBlock(br.body);
          }
          if (s.orelse) execBlock(s.orelse);
          return;
        }
        case "while": {
          for (;;) {
            var go = truthy(evalE(s.cond)); step(s.line);
            if (!go) return;
            try { execBlock(s.body); } catch (sig) { if (sig instanceof BreakSig) return; if (!(sig instanceof ContinueSig)) throw sig; }
          }
        }
        case "for": {
          var seq = evalE(s.seq), it = { obj: seq, idx: 0 };
          if (typeName(seq) === "range") seq = { items: rangeItems(seq) };
          else iterItems(seq); // throws for a non-sequence
          var items = typeof seq === "string" ? seq.split("") : seq.items;
          iters.push(it);
          try {
            // Python's list iterator keeps a hidden index and checks it against the list's length each round
            for (;;) {
              if (it.idx >= items.length) { it.idx = items.length; step(s.line, "loop ends"); break; }
              it.cur = it.idx;
              assign(s.target, items[it.idx]);
              it.idx++;
              step(s.line);
              try { execBlock(s.body); } catch (sig) { if (sig instanceof BreakSig) break; if (!(sig instanceof ContinueSig)) throw sig; }
            }
          } finally { iters.splice(iters.indexOf(it), 1); }
          return;
        }
      }
    }
    function execBlock(body) { for (var i = 0; i < body.length; i++) { curLine = body[i].line; exec(body[i]); } }
    var curLine = 0;

    var BUILTINS = {};
    function builtin(name, fn) { BUILTINS[name] = { t: "builtin", name: name, fn: fn }; }
    builtin("print", function (a) { out.push(a.map(str).join(" ")); return null; });
    builtin("len", function (a) { if (a.length !== 1) throw PyError("TypeError", "len() takes exactly one argument (" + a.length + " given)"); var v = a[0]; if (typeof v === "string") return v.length; if (v && v.items) return v.items.length; if (v && v.t === "range") return rangeItems(v).length; throw PyError("TypeError", "object of type '" + typeName(v) + "' has no len()"); });
    function minmax(name, pick) {
      builtin(name, function (a) {
        var items = a.length === 1 ? iterItems(a[0]) : a;
        if (!items.length) throw PyError("ValueError", name + "() iterable argument is empty");
        return items.reduce(function (m, x) { return pick(x, m) ? x : m; });
      });
    }
    minmax("min", function (x, m) { return less(x, m); });
    minmax("max", function (x, m) { return less(m, x); });
    builtin("sorted", function (a) { var L = list(iterItems(a[0]).slice()); callMethod(L, "sort", []); return L; });
    builtin("list", function (a) { return list(a.length ? iterItems(a[0]).slice() : []); });
    builtin("tuple", function (a) { return tuple(a.length ? iterItems(a[0]).slice() : []); });
    builtin("range", function (a) {
      a.forEach(function (x) { if (typeof x !== "number") throw PyError("TypeError", "'" + typeName(x) + "' object cannot be interpreted as an integer"); });
      var r = a.length === 1 ? { t: "range", start: 0, stop: a[0], step: 1 } : { t: "range", start: a[0], stop: a[1], step: a.length > 2 ? a[2] : 1 };
      if (r.step === 0) throw PyError("ValueError", "range() arg 3 must not be zero");
      return r;
    });
    builtin("str", function (a) { return a.length ? str(a[0]) : ""; });
    builtin("int", function (a) { var v = a[0]; if (typeof v === "string") { if (!/^\s*[-+]?\d+\s*$/.test(v)) throw PyError("ValueError", "invalid literal for int() with base 10: " + strRepr(v)); return parseInt(v, 10); } if (typeof v === "number" || typeof v === "boolean") return Number(v); throw PyError("TypeError", "int() argument must be a string or a number, not '" + typeName(v) + "'"); });
    builtin("type", function (a) { return "<class '" + typeName(a[0]) + "'>"; });

    try { execBlock(prog); }
    catch (e) {
      if (e instanceof ReturnSig) { result.error = "SyntaxError: 'return' outside function"; }
      else if (e instanceof BreakSig || e instanceof ContinueSig) { result.error = "SyntaxError: 'break' outside loop"; }
      else if (e.stop) { result.error = e.message; result.stopped = true; }
      else if (e.pyType) { result.error = e.message; }
      else throw e;
      result.errorLine = e.line != null ? e.line : curLine;
      result.steps.push(snap(result.errorLine, result.error));
    }
    result.globals = {};
    G.order.forEach(function (n) { result.globals[n] = G.vars[n] && G.vars[n].t === "func" ? "function " + G.vars[n].name : repr(G.vars[n]); });
    result.rounds = result.steps.filter(function (s) { return s.iters.length && s.note !== "loop ends"; }).length;
    return result;
  }

  // what a run printed, as one line for a challenge option: output lines joined with " | ", then any error type
  function outcome(r) {
    var parts = r.output.slice();
    if (r.error) parts.push(r.error.split(":")[0]);
    return parts.join(" | ") || "(nothing)";
  }

  // ---------- the lecture's programs, with their numbers as parameters ----------
  var PROGRAMS = {
    isEven: function (i) { return ["def is_even(i):", "    print(\"inside is_even\")", "    return i % 2 == 0", "", "print(is_even(" + i + "))"]; },
    isEvenNoReturn: function (i) { return ["def is_even(i):", "    i % 2 == 0", "", "r = is_even(" + i + ")", "print(r)"]; },
    funcA: function () { return ["def func_a():", "    print(\"inside func_a\")", "", "print(func_a())"]; },
    funcB: function (n) { return ["def func_b(y):", "    print(\"inside func_b\")", "    return y", "", "print(5 + func_b(" + n + "))"]; },
    funcC: function () { return ["def func_a():", "    print(\"inside func_a\")", "", "def func_c(z):", "    print(\"inside func_c\")", "    return z()", "", "print(func_c(func_a))"]; },
    // four bodies for "return or print?"
    retPrint: function (kind, a, b) {
      var body = { ret: ["    return a * b"], prt: ["    print(a * b)"], dead: ["    return a", "    print(b)"], both: ["    print(a)", "    return b"] }[kind];
      return ["def f(a, b):"].concat(body, ["", "r = f(" + a + ", " + b + ")", "print(r)"]);
    },
    scopeParam: function (x, d) { return ["def f(x):", "    x = x + " + d, "    print(\"in f(x): x =\", x)", "    return x", "", "x = " + x, "z = f(x)", "print(x, z)"]; },
    scopeF: function (x, k, d) { return ["def f(y):", "    x = " + k, "    x += " + d, "    print(x)", "", "x = " + x, "f(x)", "print(x)"]; },
    scopeG: function (x, d) { return ["def g(y):", "    print(x)", "    print(x + " + d + ")", "", "x = " + x, "g(x)", "print(x)"]; },
    scopeH: function (x, d) { return ["def h(y):", "    x += " + d, "", "x = " + x, "h(x)", "print(x)"]; },
    quotRem: function (x, y) { return ["def quotient_and_remainder(x, y):", "    q = x // y", "    r = x % y", "    return (q, r)", "", "(quot, rem) = quotient_and_remainder(" + x + ", " + y + ")", "print(quot, rem)"]; },
    swapWrong: function (x, y) { return ["x = " + x, "y = " + y, "x = y", "y = x", "print(x, y)"]; },
    swapTemp: function (x, y) { return ["x = " + x, "y = " + y, "temp = x", "x = y", "y = temp", "print(x, y)"]; },
    swapTuple: function (x, y) { return ["x = " + x, "y = " + y, "(x, y) = (y, x)", "print(x, y)"]; },
    getData: function (pairs) {
      return ["def get_data(aTuple):", "    nums = ()", "    words = ()", "    for t in aTuple:", "        nums = nums + (t[0],)", "        if t[1] not in words:", "            words = words + (t[1],)",
        "    return (min(nums), max(nums), len(words))", "", "data = (" + pairs.map(function (p) { return "(" + p[0] + ", " + strRepr(p[1]) + ")"; }).join(", ") + ")", "print(get_data(data))"];
    },
    removeDups: function (L1, L2, copy) {
      return ["def remove_dups(L1, L2):"].concat(copy ? ["    L1_copy = L1[:]", "    for e in L1_copy:"] : ["    for e in L1:"], ["        if e in L2:", "            L1.remove(e)", "", "L1 = " + repr(list(L1)), "L2 = " + repr(list(L2)), "remove_dups(L1, L2)", "print(L1)"]);
    },
  };

  var api = { run: run, outcome: outcome, repr: repr, strRepr: strRepr, PROGRAMS: PROGRAMS, MAX_STEPS: MAX_STEPS };
  root.APDR7 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
