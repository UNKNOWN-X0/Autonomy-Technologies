/* APDR Chapter 89a lab: concurrency, metaprogramming, and debugging. */
(function () {
  function spec(id, short, ref, prompt, answer, wrongA, wrongB, steps, why) {
    var opts = [[answer, answer], [wrongA, wrongA]];
    if (wrongB) opts.push([wrongB, wrongB]);
    var shift = id.split("").reduce(function (n, c) { return n + c.charCodeAt(0); }, 0) % 3;
    opts = opts.slice(shift).concat(opts.slice(0, shift));
    return { id: id, short: short, ref: ref, prompt: prompt, answer: answer, options: opts, steps: steps, why: "<p>" + why + "</p>" };
  }
  function mount(id, title, challenges, sandbox) {
    var section = document.querySelector('[data-experiment="' + id + '"]');
    var form = section.querySelector("form"), canvas = section.querySelector("canvas"), msg = form.querySelector("[data-own-msg]");
    var state = { rows: [], progress: 1, result: "" };
    function paint() {
      var ctx = canvas.getContext("2d"), w = canvas.width = Math.max(320, canvas.clientWidth || 640), h = canvas.height = Math.max(240, canvas.clientHeight || 320), style = getComputedStyle(document.body);
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = style.getPropertyValue("--paper").trim() || "#fff"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = style.getPropertyValue("--ink").trim() || "#10243d"; ctx.font = "600 13px ui-monospace, monospace";
      var lines = [];
      state.rows.slice(0, Math.max(1, Math.ceil(state.rows.length * state.progress))).forEach(function (line) {
        var text = String(line), maxWidth = w - 36, part = "";
        text.split(/\s+/).forEach(function (word) {
          var next = part ? part + " " + word : word;
          if (part && ctx.measureText(next).width > maxWidth) { lines.push(part); part = word; } else part = next;
        });
        if (part) lines.push(part);
      });
      var lineHeight = Math.min(22, (h - 64) / Math.max(1, lines.length));
      lines.forEach(function (line, i) { ctx.fillText(line, 18, 24 + i * lineHeight); });
      if (state.result) { ctx.fillStyle = style.getPropertyValue("--act").trim() || "#04316a"; ctx.font = "700 13px sans-serif"; ctx.fillText(state.result, 18, h - 20); }
    }
    function build(s) {
      return { id: s.id, short: s.short, ref: s.ref, prompt: s.prompt, options: s.options, answer: s.answer, why: s.why,
        stage: function () { state.rows = s.steps; state.progress = 0; state.result = "Answer: " + s.answer; paint(); },
        preview: paint,
        reveal: function () { return Lab.tween(900, function (t) { state.progress = t; paint(); }); } };
    }
    function live() {
      try { state.rows = sandbox(form); state.result = "Explore freely"; if (msg) msg.textContent = ""; }
      catch (e) { state.rows = []; state.result = ""; if (msg) msg.textContent = e.message; }
      state.progress = 1; paint();
    }
    Lab.experiment({ id: id, title: title, card: section.querySelector(".challenge"), lock: function (on) {
      form.querySelectorAll("input,select,textarea,button").forEach(function (x) { x.disabled = on; });
    }, setup: function (c) { c.stage(); }, sandbox: live, challenges: challenges.map(build) });
    form.addEventListener("input", live); form.addEventListener("change", live);
    if (typeof ResizeObserver !== "undefined") { var ro = new ResizeObserver(paint); ro.observe(canvas.parentElement); }
    live();
  }
  function val(form, key) { return form.querySelector('[data-f="' + key + '"]').value; }
  var C = APDR89A;
  mount("concurrency", "Threads, processes, and the GIL", [
    spec("conc-cpu", "CPU-bound Python", "8.1–8.2", "For CPU-heavy Python on ordinary GIL-enabled CPython, which option can use multiple cores?", "A process pool", "More Python threads", "More asyncio tasks on one event loop", C.concurrency("processes"), "Processes can execute on separate cores. Include process start-up and data-transfer costs in the comparison."),
    spec("conc-share", "thread memory", "8.1", "Where do two threads in one process normally access shared objects?", "The same process address space", "Separate private address spaces", "Only through a message queue", C.concurrency("threads"), "Threads share their process memory; shared mutation still needs a coordination rule."),
    spec("conc-free", "free-threaded build", "8.2", "A CPython extension is not marked as free-threading compatible. What may happen on a free-threaded build?", "Importing it may enable the GIL", "Import always fails immediately", "The GIL must stay disabled after every import", C.concurrency("free"), "An incompatible extension may re-enable the GIL, so check the actual runtime state and dependency support."),
    spec("conc-io", "I/O overlap", "8.1–8.2", "Several worker threads are blocked on network reads. What can another thread do meanwhile?", "Make progress while a worker waits", "Run Python bytecode on another core in every build", "Force every other thread to pause for the whole network wait", C.concurrency("threads"), "Threads can overlap I/O waits even when the default CPython GIL prevents parallel Python-bytecode execution.")
  ], function (f) { return C.concurrency(val(f, "model")); });
  mount("async", "Asyncio scheduling", [
    spec("async-yield", "await yields", "8.3", "Task A awaits a pending network response. What may the event loop run?", "Another ready task", "Only Task A until the reply arrives", "The same Python task on another core", C.asyncCounter(false), "A task awaiting a pending operation suspends, allowing the event loop to run other ready work."),
    spec("async-lock", "shared invariant", "8.3", "A balance update reads, awaits, then writes shared state. What protects the whole update?", "An asyncio lock or a single-owner redesign", "The GIL in every Python build", "A type annotation", C.asyncCounter(true), "Another task can interleave at the await; protect the invariant or give one task ownership."),
    spec("async-cpu", "CPU work", "8.3", "A coroutine runs a long CPU loop without awaiting. What happens to other tasks on that loop?", "They wait until the loop regains control", "They pre-empt the running task automatically", "They run in parallel on other event-loop cores", C.asyncCounter(false), "Asyncio uses cooperative scheduling; a long synchronous computation blocks the event loop."),
    spec("async-race", "lost update", "8.3", "Two tasks read zero, await, then each writes old_value + 1 without a lock. What final value can result?", "1", "2 in every schedule", "0 because await resets the counter", C.asyncCounter(false), "Both tasks can read the same old value and overwrite each other, losing one update.")
  ], function (f) { return C.asyncCounter(val(f, "lock") === "yes"); });
  mount("routing", "Route the workload", [
    spec("route-io", "blocking I/O", "8.5", "A task mostly waits on a blocking network API. Which model is a reasonable starting point?", "Threads", "A process per network read", "A large blocking thread pool even though the API is async", C.route("io"), "Threads can overlap waits for blocking APIs; measure and respect shared-state and rate-limit rules."),
    spec("route-async", "async I/O", "8.3–8.5", "A client library is fully asynchronous and there are many concurrent requests. What is a natural starting point?", "Asyncio tasks", "One operating-system process for every request", "A lock around every await", C.route("io"), "Asyncio can coordinate many I/O waits through one event loop without a thread per task."),
    spec("route-cpu", "CPU-heavy work", "8.2, 8.5", "Pure Python calculations dominate on ordinary CPython. What should be compared?", "Processes or native code", "More asyncio tasks on the same loop", "More threads with no measurement", C.route("cpu"), "The default GIL limits parallel Python bytecode; compare alternatives and include data movement."),
    spec("route-transfer", "transfer cost", "8.1, 8.5", "A 1 ms calculation needs a 2 GB input sent to a process. What may dominate?", "Moving or serialising the input", "The GIL inside the child process", "An asyncio task switch", C.route("transfer"), "Large process-boundary transfers can cost more than a small calculation.")
  ], function (f) { return C.route(val(f, "work")); });
  mount("metaprogramming", "Decorators and class creation", [
    spec("meta-binding", "decorator binding", "9.2", "After a decorator returns a wrapper, what is bound to the function's name?", "The returned wrapper", "Always the original function unchanged", "The metaclass object", C.metaprogramming("decorator"), "A decorator returns the object subsequently bound to the function name."),
    spec("meta-order", "decorator order", "9.2", "For @outer above @inner on f, which expression describes the binding?", "f = outer(inner(f))", "f = inner(outer(f))", null, C.metaprogramming("order"), "The decorator closest to the definition is applied first; its result is passed outward."),
    spec("meta-class", "metaclass", "9.3", "What is the usual metaclass of a Python class object?", "type", "object.__init__", "inspect.signature", C.metaprogramming("class"), "Python class objects are instances of a metaclass; the default is type."),
    spec("meta-hook", "subclass hook", "9.3", "A base class only needs to register each subclass. Which hook should you try first?", "__init_subclass__", "eval", "threading.settrace", C.metaprogramming("hook"), "The base-class hook often handles subclass registration with less machinery than a metaclass.")
  ], function (f) { return C.metaprogramming(val(f, "topic")); });
  mount("dynamic", "Dynamic code and ASTs", [
    spec("code-eval", "eval", "9.4", "What does eval accept as its main input?", "A Python expression", "A block of statements", "A class namespace tuple", C.dynamic("eval"), "eval evaluates an expression and returns its value; untrusted text must not be passed to it."),
    spec("code-exec", "exec", "9.4", "What can exec run?", "Python statements", "Only a module name", "Only a type annotation", C.dynamic("exec"), "exec executes statements in a chosen namespace; that authority makes untrusted input unsafe."),
    spec("code-ast", "AST boundary", "9.4", "Does validating an AST automatically sandbox code compiled from it?", "No", "Yes, AST nodes cannot execute", "Yes, if whitespace was removed", C.dynamic("ast"), "AST structure can help validate syntax, but compiled code still executes operations."),
    spec("code-type", "dynamic class", "9.3–9.4", "What does type(name, bases, namespace) create?", "A class object", "A running event loop", "A source-code sandbox", C.dynamic("type"), "The three-argument form of type creates a class from a name, base tuple and attribute namespace.")
  ], function (f) { return C.dynamic(val(f, "tool")); });
  mount("testing", "Debug and test", [
    spec("debug-shrink", "shrink failure", "9.6", "A property-based test finds a failing list and reduces it. What is the small result called?", "A counterexample", "A coverage report", "A fixture scope", C.debugging("property"), "Shrinking seeks a smaller input that still violates the property."),
    spec("debug-patch", "patch lookup", "9.5–9.6", "A module imported send with from transport import send. Which name should its test patch?", "The module's local send name", "Only transport.send after import", "Every method in the process", C.debugging("mock"), "Patch where the code under test looks up the dependency, then scope the replacement."),
    spec("debug-coverage", "coverage", "9.6", "What does 100% line coverage fail to prove?", "That the assertions check the right behaviour", "That each line ran", "That tests were collected", C.debugging("coverage"), "Coverage shows execution, not whether the test made a useful claim."),
    spec("debug-hang", "stack trace", "9.6", "A threaded program hangs. What evidence helps locate a wait cycle?", "Thread stack traces", "A larger line-coverage percentage", "Rerunning without recording task or thread stacks", C.debugging("hang"), "Thread stacks show where workers are blocked; combine that evidence with lock ownership and a small reproduction.")
  ], function (f) { return C.debugging(val(f, "tool")); });
})();
