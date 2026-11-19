/* Pure, deterministic traces for the APDR 89a lab. */
(function (root) {
  function concurrency(kind) {
    const traces = {
      threads: ["Threads share one process address space", "A waiting I/O thread lets another thread make progress", "Shared mutation still needs a coordination rule"],
      gil: ["Ordinary CPython build: the GIL is enabled", "Python bytecode runs in one thread at a time", "CPU-bound threads do not execute bytecode on two cores at once"],
      free: ["Free-threaded CPython is an optional build", "Python threads may execute in parallel when the GIL is disabled", "An unsupported extension may enable the GIL again"],
      processes: ["Each process has a separate address space by default", "CPU work can run in different processes on different cores", "Results must be passed back or stored in shared memory"],
    };
    if (!traces[kind]) throw new RangeError("unknown concurrency model");
    return traces[kind];
  }
  function asyncCounter(locked) {
    if (locked) return ["Task A acquires the lock and reads 0", "Task A awaits while retaining the lock", "Task B waits for the lock", "Task A writes 1 and releases", "Task B reads 1, then writes 2", "Final count: 2"];
    return ["Task A reads 0", "Task A awaits the remote result", "Task B reads 0 and awaits too", "Task A writes 1", "Task B writes 1 from its stale read", "Final count: 1; one update was lost"];
  }
  function route(kind) {
    const traces = {
      io: ["Work is mostly waiting for network replies", "Choose threads for blocking APIs or asyncio for async APIs", "Keep rate limits and shared state explicit"],
      cpu: ["Work is mostly Python calculation", "Default CPython threads share the GIL", "Compare processes or native code and include transfer cost"],
      mixed: ["Downloads overlap well", "Normalisation is CPU-heavy", "Overlap I/O, then measure whether CPU work should be offloaded"],
      transfer: ["The calculation is tiny", "The input object is very large", "Process transfer can cost more than the calculation"],
    };
    if (!traces[kind]) throw new RangeError("unknown workload");
    return traces[kind];
  }
  function metaprogramming(kind) {
    const traces = {
      decorator: ["At definition time, decorate receives the function", "The returned wrapper is bound to the original name", "functools.wraps preserves useful function metadata"],
      order: ["The nearest decorator receives the original function first", "Its result is passed to the next decorator", "f = outer(inner(f))"],
      class: ["A class object is an instance of a metaclass", "The default metaclass is type", "A metaclass hook can inspect the new name, bases, and namespace"],
      hook: ["The base class receives subclass creation", "__init_subclass__ can register the new class", "Use a metaclass only when a simpler hook cannot express the rule"],
    };
    if (!traces[kind]) throw new RangeError("unknown metaprogramming topic");
    return traces[kind];
  }
  function dynamic(kind) {
    const traces = {
      eval: ["eval accepts a Python expression", "The expression is evaluated as code", "Never pass untrusted text to eval"],
      exec: ["exec accepts Python statements", "The statements run with the selected namespace", "Untrusted statements can act with the program's authority"],
      ast: ["An AST stores code as structured syntax nodes", "The tree can be validated or transformed", "Compiling and executing it still runs code; an AST is not a sandbox"],
      type: ["type(name, bases, namespace) creates a class", "The namespace supplies attributes and methods", "No source string needs to be executed"],
    };
    if (!traces[kind]) throw new RangeError("unknown dynamic-code topic");
    return traces[kind];
  }
  function debugging(kind) {
    const traces = {
      property: ["State an invariant the program must satisfy", "Generate many inputs", "Shrink a failing case to a smaller counterexample"],
      mock: ["Patch the name where the module looks it up", "Use a spec to constrain calls", "Restore the patch when the test scope ends"],
      coverage: ["Coverage reports which code ran", "An executed line may still have no useful assertion", "Add a behaviour check for the requirement"],
      hang: ["Capture task or thread stacks", "Find a wait cycle or a task paused at an await", "Reduce the case and add a regression test"],
    };
    if (!traces[kind]) throw new RangeError("unknown debugging topic");
    return traces[kind];
  }
  const api = { concurrency, asyncCounter, route, metaprogramming, dynamic, debugging };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.APDR89A = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
