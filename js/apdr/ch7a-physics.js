/* Pure traces for the APDR 7a concepts lab. */
(function (root) {
  function memory(action) {
    const rows = {
      alias: ["a → list O1 [1]", "b = a → both names point to O1", "b.append(2) mutates O1", "a and b both show [1, 2]"],
      copy: ["a → list O1 [1]", "b = a.copy() creates O2", "O1 and O2 have equal contents", "The outer lists are distinct"],
      rebind: ["a → O1 [1]", "b = a → b also points to O1", "b = [9] creates O2", "a still points to O1; b points to O2"],
    };
    if (!rows[action]) throw new RangeError("unknown binding operation");
    return rows[action];
  }
  function classify(kind) {
    const rows = {
      static: ["C++ checks declared expression types before execution", "Python binds names to runtime objects", "A Python type hint is not runtime enforcement"],
      forms: ["Overloads choose among separate implementations: ad-hoc", "A template supplies a generic definition: parametric", "A derived object through a base interface: subtype"],
      duck: ["Call speak() on the supplied object", "No Animal parent is required", "The operation must exist when the call runs"],
    };
    if (!rows[kind]) throw new RangeError("unknown type-system topic");
    return rows[kind];
  }
  function abstraction(rule) {
    const rows = {
      private: ["C++ class members default to private", "The compiler rejects outside access", "A public method can expose a stable operation"],
      mangling: ["__secret is rewritten to _Class__secret", "This reduces accidental name clashes", "Deliberate access remains possible"],
      all: ["__all__ lists names for wildcard imports", "It does not block direct attribute access", "A leading underscore remains a convention"],
    };
    if (!rows[rule]) throw new RangeError("unknown abstraction rule");
    return rows[rule];
  }
  function lifetime(resource) {
    const rows = {
      raii: ["A C++ owner opens a file resource", "Scope exits, including by exception", "The owner destructor closes the file"],
      cycle: ["Object A owns B with shared_ptr", "Object B owns A with shared_ptr", "Both counts remain positive; use weak_ptr to break the cycle"],
      gc: ["Two Python objects refer to one another", "No outside reference remains", "CPython's cyclic collector can reclaim the unreachable cycle"],
    };
    if (!rows[resource]) throw new RangeError("unknown resource model");
    return rows[resource];
  }
  function compiler(question) {
    const rows = {
      pipeline: ["Lexing makes tokens", "Parsing builds syntax structure", "Semantic checks establish meaning", "IR is optimized", "Code generation targets the machine"],
      phi: ["Branch true defines x2", "Branch false defines x3", "At the join x4 = φ(x2, x3) selects the incoming value"],
      python: ["Python source compiles to bytecode", "The virtual machine executes bytecode", ".pyc caches compiled bytecode for imports"],
    };
    if (!rows[question]) throw new RangeError("unknown compiler topic");
    return rows[question];
  }
  function factorial(n) {
    n = Number(n);
    if (!Number.isInteger(n) || n < 0 || n > 12) throw new RangeError("n must be a whole number from 0 to 12");
    const calls = Array.from({ length: n + 1 }, (_, i) => n - i);
    let value = 1;
    const returns = [];
    for (let i = 1; i <= n; i++) { value *= i; returns.push("fact(" + i + ") returns " + value); }
    return ["Measure: n decreases by one", "Calls: " + calls.map(x => "fact(" + x + ")").join(" → "), "Base fact(0) returns 1", ...returns, "Result: " + value];
  }
  const api = { memory, classify, abstraction, lifetime, compiler, factorial };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR7A = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
