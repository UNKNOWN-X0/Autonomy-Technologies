/* APDR Chapter 1011a lab: object identity, lookup, contracts, and design choices. */
(function () {
  function spec(id, short, ref, prompt, answer, wrongA, wrongB, steps, why) {
    var opts = [[answer, answer], [wrongA, wrongA], [wrongB, wrongB]];
    var shift = id.split("").reduce(function (n, c) { return n + c.charCodeAt(0); }, 0) % opts.length;
    opts = opts.slice(shift).concat(opts.slice(0, shift));
    return { id: id, short: short, ref: ref, prompt: prompt, options: opts, answer: answer, steps: steps, why: "<p>" + why + "</p>" };
  }
  function mount(id, title, field, challenges) {
    var section = document.querySelector('[data-experiment="' + id + '"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"), msg = form.querySelector("[data-own-msg]"), state = { rows: [], progress: 1, result: "" };
    function paint() {
      var ctx = canvas.getContext("2d"), w = canvas.width = Math.max(320, canvas.clientWidth || 640), h = canvas.height = Math.max(240, canvas.clientHeight || 320), style = getComputedStyle(document.body);
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = style.getPropertyValue("--paper").trim() || "#fff"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = style.getPropertyValue("--ink").trim() || "#10243d"; ctx.font = "600 13px ui-monospace, monospace";
      var maxWidth = w - 36, lines = [];
      state.rows.slice(0, Math.max(1, Math.ceil(state.rows.length * state.progress))).forEach(function (line) {
        var part = "";
        String(line).split(/\s+/).forEach(function (word) {
          var next = part ? part + " " + word : word;
          if (part && ctx.measureText(next).width > maxWidth) { lines.push(part); part = word; } else part = next;
        });
        if (part) lines.push(part);
      });
      var lineHeight = Math.min(22, (h - 64) / Math.max(1, lines.length));
      lines.forEach(function (line, i) { ctx.fillText(line, 18, 24 + i * lineHeight); });
      if (state.result) { ctx.fillStyle = style.getPropertyValue("--act").trim() || "#04316a"; ctx.font = "700 13px sans-serif"; ctx.fillText(state.result, 18, h - 18); }
    }
    function build(s) {
      return { id: s.id, short: s.short, ref: s.ref, prompt: s.prompt, options: s.options, answer: s.answer, why: s.why,
        stage: function () { state.rows = s.steps; state.progress = 0; state.result = "Reveal complete"; paint(); }, preview: paint,
        reveal: function () { return Lab.tween(900, function (t) { state.progress = t; paint(); }); } };
    }
    function live() { try { state.rows = APDR1011A.trace(id, form.querySelector('[data-f="' + field + '"]').value); if (msg) msg.textContent = ""; } catch (e) { state.rows = challenges[0].steps; if (msg) msg.textContent = e.message; } state.result = "Explore freely"; state.progress = 1; paint(); }
    Lab.experiment({ id: id, title: title, card: section.querySelector(".challenge"), lock: function (on) { form.querySelectorAll("input,select,textarea,button").forEach(function (x) { x.disabled = on; }); }, setup: function (c) { c.stage(); }, sandbox: live, challenges: challenges.map(build) });
    form.addEventListener("input", live); form.addEventListener("change", live); if (typeof ResizeObserver !== "undefined") { var ro = new ResizeObserver(paint); ro.observe(canvas.parentElement); } live();
  }
  function s(id, short, ref, prompt, answer, wrongA, wrongB, topic, choice, why) { return spec(id, short, ref, prompt, answer, wrongA, wrongB, APDR1011A.trace(topic, choice), why); }
  mount("alias", "References and copying", "model", [
    s("alias-bind", "assignment alias", "10.1", "After b = a for a = [1], what does a show after b.append(2)?", "[1, 2]", "[1]", "[1, 2, 2]", "alias", "assignment", "Assignment binds a second name to the same list; the append mutates that one object."),
    s("alias-shallow", "shallow nested copy", "10.1", "After b = a.copy() where a = [{'x': 1}], are a[0] and b[0] the same dictionary?", "Yes, the nested dictionary is shared", "No, every nested value is copied", "Only if the dictionary is empty", "alias", "shallow", "A shallow copy creates a new outer list and keeps references to nested items."),
    s("alias-deep", "deep copy", "10.1", "When should a deep copy be considered for a nested list?", "When nested mutable state must be independent", "Whenever two names refer to one object", "Whenever values compare equal", "alias", "deep", "Deep copying recursively duplicates supported parts; decide first which values should remain shared."),
    s("alias-identity", "identity and equality", "10.1", "Two equal integer values may be reused by CPython. Which operator tests equal values?", "==", "is", "id", "alias", "identity", "Identity reuse is an implementation detail; use equality for values and identity only when sameness is the question.")
  ]);
  mount("lookup", "Slots and attribute lookup", "rule", [
    s("lookup-property", "data descriptor", "10.2", "A property and an instance value share the name value. Which normally wins?", "The property getter", "The instance value", "Whichever was assigned last", "lookup", "property", "A property is a data descriptor and takes precedence over the instance dictionary."),
    s("lookup-function", "function shadowing", "10.2", "A normal function is stored on the class. Can an instance value shadow that non-data descriptor?", "Yes", "No, all descriptors take priority", "Only when the function returns None", "lookup", "function", "A normal function is a non-data descriptor, so an instance attribute can shadow it."),
    s("lookup-slots", "fixed slots", "10.2", "Point has __slots__ = ('x',) and no base dictionary. What happens on p.y = 2?", "AttributeError", "A new slot is added automatically", "The value is stored in the class", "lookup", "slots", "Without a dictionary or a y slot, the instance cannot add that attribute."),
    s("lookup-order", "lookup order", "10.2", "Which lookup source is checked before the instance dictionary?", "A data descriptor on the class", "A non-data descriptor on the class", "The class __getattr__ method", "lookup", "precedence", "Data descriptors take priority; non-data descriptors and ordinary class values come later.")
  ]);
  mount("contracts", "Protocols and substitution", "contract", [
    s("contract-protocol", "structural Protocol", "10.3", "A logger has the write(text) method a Protocol requires. Must it inherit from that Protocol?", "No, a static checker can accept its structure", "Yes, every Protocol is nominal", "Only if it also uses ABCMeta", "contracts", "protocol", "Protocols primarily let static checkers recognise structural compatibility."),
    s("contract-runtime", "runtime annotation", "10.3", "Does a Protocol annotation automatically reject an incompatible argument at runtime?", "No", "Yes, annotations validate every call", "Only when the method is abstract", "contracts", "runtime", "Type annotations do not perform runtime validation by themselves."),
    s("contract-variance", "input contract", "10.3", "Base accepts any object; subtype accepts only strings. Is it safely substitutable?", "No, it accepts fewer valid inputs", "Yes, strings are objects", "Yes, if it returns a string", "contracts", "variance", "A replacement must accept the inputs the base contract permits."),
    s("contract-virtual", "virtual subclass", "10.3", "An ABC registers an unrelated virtual subclass. Does that add the ABC to its MRO?", "No", "Yes, registration rewrites its bases", "Only for isinstance", "contracts", "virtual", "Virtual registration affects subclass checks but does not add methods or the ABC to the MRO.")
  ]);
  mount("mro", "C3 and cooperative inheritance", "order", [
    s("mro-diamond", "diamond order", "10.4", "B and C inherit from A; D declares bases B, C. What is the C3 order?", "D, B, C, A, object", "D, A, B, C, object", "D, C, B, A, object", "mro", "diamond", "C3 preserves D’s local B-before-C order and places the shared ancestor after both branches."),
    s("mro-super", "super lookup", "10.4", "A mixin calls super().save(). Where does lookup continue?", "At the next class in the instance MRO", "At the direct parent written beside the mixin", "At object immediately", "mro", "super", "super() follows the runtime MRO and supports cooperative method chains."),
    s("mro-local", "base order", "10.4", "D declares bases B, C. Which declared base comes first in its local precedence order?", "B", "C", "The base with the shorter name", "mro", "local", "C3 respects the order of bases declared by the class."),
    s("mro-conflict", "inconsistent hierarchy", "10.4", "Two branches impose opposite orders for X and Y. What does class creation do?", "Raises a TypeError for inconsistent MRO", "Silently chooses depth-first order", "Sorts X and Y alphabetically", "mro", "conflict", "C3 cannot produce a valid order when the parent constraints conflict.")
  ]);
  mount("descriptor", "Descriptors and class hooks", "mechanism", [
    s("desc-method", "bound method", "10.5", "What does A().f return for a normal function f stored on A?", "A bound method with the instance supplied", "The raw function with no receiver", "A new subclass of A", "descriptor", "method", "Function descriptor access through an instance supplies that instance as the receiver."),
    s("desc-property", "property getter", "10.5", "What happens when code reads obj.value where value is a property?", "The descriptor getter runs", "The raw property object is returned", "The class is instantiated again", "descriptor", "property", "A property mediates attribute access through its descriptor methods."),
    s("desc-classmethod", "classmethod receiver", "10.5", "A subclass accesses an inherited classmethod. What is passed as cls?", "The subclass", "The base class in every case", "The instance dictionary", "descriptor", "classmethod", "The classmethod descriptor supplies the class through which it was accessed."),
    s("desc-hook", "subclass hook", "10.5", "A base only needs to register each subclass. What should you try before a metaclass?", "__init_subclass__", "A custom __getattribute__", "A singleton __new__", "descriptor", "hook", "The base class hook handles subclass creation with less machinery when that is all the rule needs.")
  ]);
  mount("design", "Patterns and runtime traps", "choice", [
    s("design-strategy", "strategy", "11.2", "A client can swap QuickSort and MergeSort behind one sort interface. Which pattern fits?", "Strategy", "Observer", "Singleton", "design", "strategy", "Strategy packages interchangeable algorithms behind a shared operation."),
    s("design-family", "abstract factory", "11.2", "A UI must create matching buttons and checkboxes for one platform. Which pattern fits?", "Abstract factory", "A single mutable default", "Late-bound closure", "design", "family", "An abstract factory creates compatible families of related products."),
    s("design-default", "mutable default", "11.3", "A function has values=[] as a default. When is that list created?", "When the definition executes", "Freshly for every call", "When the first append happens", "design", "default", "Default expressions are evaluated when the function definition executes; use None to create fresh state per call."),
    s("design-closure", "late binding", "11.3", "A loop creates lambda: i three times. How can each lambda retain its current i?", "Use lambda i=i: i", "Use lambda: i + 0", "Rename the loop variable afterward", "design", "closure", "The default argument captures the current value when each lambda is created.")
  ]);
})();
