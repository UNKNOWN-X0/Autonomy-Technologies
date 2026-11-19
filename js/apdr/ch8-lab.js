/* APDR Chapter 8 labs: call traces and dictionary state, backed by ch8-physics.js. */
(function () {
  var C = APDR8, observer;
  function sample(a) { return a[Math.floor(Math.random() * a.length)]; }
  function options(answer, a, b) { return [[answer, answer], [a, a], [b, b]]; }
  function spec(id, short, ref, prompt, answer, wrongA, wrongB, steps, why) {
    return { id: id, short: short, ref: ref, prompt: prompt, answer: answer, options: options(answer, wrongA, wrongB), steps: steps, why: why };
  }
  function mount(id, title, fields, challenges, generate, sandbox) {
    var section = document.querySelector('[data-experiment="' + id + '"]'), form = section.querySelector("form"), canvas = section.querySelector("canvas"), msg = form.querySelector("[data-own-msg]");
    var state = { rows: [], progress: 1, result: "" };
    function paint() {
      var ctx = canvas.getContext("2d"), w = canvas.width = Math.max(320, canvas.clientWidth || 640), h = canvas.height = Math.max(240, canvas.clientHeight || 320);
      var style = getComputedStyle(document.body), paper = style.getPropertyValue("--paper").trim() || "#fff", ink = style.getPropertyValue("--ink").trim() || "#10243d", act = style.getPropertyValue("--act").trim() || "#04316a", muted = style.getPropertyValue("--muted").trim() || "#526278";
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = paper; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = ink; ctx.font = "700 12px ui-monospace, monospace";
      var rows = state.rows || [], shown = state.challenge ? Math.max(1, Math.ceil(rows.length * state.progress)) : rows.length;
      rows.slice(0, shown).forEach(function (line, i) { ctx.fillStyle = i === shown - 1 && state.revealing ? act : ink; ctx.fillText(String(line).slice(0, 72), 18, 28 + i * 17); });
      if (state.guess) { ctx.fillStyle = muted; ctx.font = "600 12px sans-serif"; ctx.fillText("Your prediction: " + state.guess, 18, h - 16); }
      if (state.result) { ctx.fillStyle = act; ctx.font = "700 13px sans-serif"; ctx.fillText(state.result, 18, h - 38); }
    }
    function showSpec(s) { state.challenge = true; state.revealing = false; state.progress = 0; state.guess = ""; state.result = "Answer: " + s.answer; state.rows = s.steps; paint(); }
    function buildChallenge(s) {
      return { id: s.id, short: s.short, ref: s.ref, prompt: s.prompt, options: s.options, answer: s.answer, why: "<p>" + s.why + "</p>", stage: function () { showSpec(s); }, preview: function (key) { state.guess = key; paint(); }, reveal: function () { state.revealing = true; return Lab.tween(900, function (t) { state.progress = t; paint(); }).then(function () { state.revealing = false; state.progress = 1; paint(); }); } };
    }
    function live() {
      state.challenge = false; state.guess = ""; state.revealing = false; state.progress = 1;
      try { state.rows = sandbox(form); state.result = "Explore freely"; if (msg) msg.textContent = ""; }
      catch (e) { state.rows = []; state.result = ""; if (msg) msg.textContent = e.message; }
      paint();
    }
    Lab.experiment({ id: id, title: title, card: section.querySelector(".challenge"), generate: generate ? function () { return buildChallenge(generate()); } : null,
      lock: function (on) { form.querySelectorAll("input,select,textarea,button").forEach(function (el) { el.disabled = on; }); section.querySelector(".stage").classList.toggle("locked", on); },
      setup: function (c) { c.stage(); }, sandbox: live, challenges: challenges.map(buildChallenge) });
    form.addEventListener("input", live); form.addEventListener("change", live);
    if (typeof ResizeObserver !== "undefined") { observer = observer || new ResizeObserver(function (entries) { entries.forEach(function (e) { var cv = e.target.querySelector("canvas"); if (cv && cv._show) cv._show(); }); }); canvas._show = paint; observer.observe(canvas.parentElement); }
    live();
  }
  function field(form, key) { return form.querySelector('[data-f="' + key + '"]').value.trim(); }
  function integer(form, key, min, max) { var text = field(form, key), n = Number(text); if (!/^\d+$/.test(text) || !Number.isInteger(n) || n < min || n > max) throw Error("Enter a whole number from " + min + " to " + max + "."); return n; }
  function multSteps(a, b) { var r = C.traceMultiply(a, b), rows = r.calls.map(function (c) { return "mult(" + a + ", " + c.argument + ")" + (c.base ? " → base returns " + a : " → waits for the smaller call"); }); for (var n = 2; n <= b; n++) rows.push("Return to b = " + n + ": add " + a + " → " + (a * n)); return rows; }
  function fibSteps(n) { var v = C.fibonacci(n); return ["Lecture indexing: fib(0) = fib(1) = 1", "fib(" + n + ") = " + v, "Naive recursive calls: " + C.naiveCalls(n), "Memoized calls including cached base entries: " + C.memoCalls(n), "Cache stores one value for each argument 0 through " + n]; }
  function palSteps(s) { var t = C.palindromeTrace(s); return ["Normalize: " + (t.normalized || "(empty string)"), "Compare from the outside inward:"].concat(t.pairs.map(function (p) { return p[0] + " == " + p[1] + (p[0] === p[1] ? " → continue" : " → stop"); }), ["Result: " + t.result]); }
  function dictSteps(op, key, value) { var d = { Ana: "B", John: "A+", Denise: "A" }, exists = Object.prototype.hasOwnProperty.call(d, key); var before = JSON.stringify(d); if (op === "set") d[key] = value; else if (op === "delete" && exists) delete d[key]; return ["Before: " + before, op === "lookup" ? (exists ? key + " → " + d[key] : "KeyError: " + key + " is absent") : op === "contains" ? key + " in d → " + exists : op === "delete" ? (exists ? "Delete " + key : "KeyError: " + key + " is absent") : "Set d[" + key + "] = " + value, "After: " + JSON.stringify(d)]; }
  function frequencySteps(words) { var counts = C.frequencies(words), best = Object.keys(counts).length ? C.mostCommon(counts) : { words: [], count: 0 }; return ["Words: " + words.join(", ")].concat(Object.keys(counts).map(function (word) { return word + " → " + counts[word]; }), ["Most common: " + (best.words.join(", ") || "none") + " (" + best.count + ")"]); }

  var recChallenges = [spec("rec-1", "four calls", "8.1", "For a = 3 and b = 4, how many calls does mult make, including the base call?", "4", "3", "5", multSteps(3, 4), "b decreases by one until the call with b = 1, so the four arguments are 4, 3, 2, 1."), spec("rec-2", "unwind a product", "8.2", "What does mult(5, 3) return?", "15", "10", "20", multSteps(5, 3), "The base call returns 5; the two waiting calls each add another 5."), spec("rec-3", "base case", "8.1", "Which call is the base case in mult(2, 5)?", "mult(2, 1)", "mult(2, 0)", "mult(2, 5)", multSteps(2, 5), "The lecture defines the base at b = 1 for positive b."), spec("rec-4", "return order", "8.2", "In mult(4, 3), which call returns first?", "mult(4, 1)", "mult(4, 3)", "mult(4, 2)", multSteps(4, 3), "Calls descend to the base case; the deepest call returns first.")];
  mount("recursion", "Recursive multiplication", [{ name: "a", min: 1, max: 20 }, { name: "b", min: 1, max: 8 }], recChallenges, function () { var a = 2 + Math.floor(Math.random() * 7), b = 2 + Math.floor(Math.random() * 7), answer = String(a * b); return spec("gen-rec", "new multiplication", "8.1", "What does mult(" + a + ", " + b + ") return?", answer, String(a * (b - 1)), String((a + 1) * b), multSteps(a, b), "Each call adds a once after the smaller multiplier returns."); }, function (form) { var a = integer(form, "a", 1, 20), b = integer(form, "b", 1, 8); return multSteps(a, b); });

  var fibChallenges = [2, 3, 4, 5].map(function (n, i) { var v = C.fibonacci(n); return spec("fib-" + i, "fib(" + n + ")", "8.4", "Using the lecture's 0-based convention, what is fib(" + n + ")?", String(v), String(v - 1), String(v + 1), fibSteps(n), "The two base values are both 1; each later value adds the previous two."); });
  mount("fibonacci", "Fibonacci memoization", [{ name: "n", min: 0, max: 20 }], fibChallenges, function () { var n = 3 + Math.floor(Math.random() * 8), v = C.fibonacci(n); return spec("gen-fib", "new Fibonacci value", "8.4", "With fib(0) = fib(1) = 1, what is fib(" + n + ")?", String(v), String(v - 1), String(v + 1), fibSteps(n), "The cache stores the computed answer under its argument so later calls can reuse it."); }, function (form) { return fibSteps(integer(form, "n", 0, 20)); });

  var phrases = ["Able was I, ere I saw Elba", "A man, a plan, a canal: Panama!", "abca", "level"], palChallenges = phrases.map(function (s, i) { var t = C.palindromeTrace(s), answer = String(t.result); return spec("pal-" + i, "palindrome", "8.5", "After normalization, is “" + s + "” a palindrome?", answer, String(!t.result), "maybe", palSteps(s), "Matching outside letters allow the helper to recurse on the inner string; a mismatch returns False."); });
  mount("palindrome", "Recursive palindrome", [{ name: "phrase" }], palChallenges, function () { var s = sample(phrases), t = C.palindromeTrace(s); return spec("gen-pal", "new palindrome check", "8.5", "After normalization, is “" + s + "” a palindrome?", String(t.result), String(!t.result), "maybe", palSteps(s), "The helper compares matching pairs from the outside inward until a mismatch or the middle."); }, function (form) { var s = field(form, "phrase"); if (!s) throw Error("Enter a phrase to check."); if (C.normalize(s).length > 24) throw Error("Use at most 24 letters so every comparison fits on the stage."); return palSteps(s); });

  var dictChallenges = [spec("dict-1", "lookup", "8.6", "In {'Ana': 'B', 'John': 'A+'}, what does d['John'] return?", "A+", "B", "KeyError", dictSteps("lookup", "John", "A+"), "A key selects the value associated with it."), spec("dict-2", "missing key", "8.6", "What happens when code evaluates d['Sylvan'] for {'Ana': 'B'}?", "KeyError", "None", "False", dictSteps("lookup", "Sylvan", "A"), "Square-bracket lookup raises KeyError when the key is absent."), spec("dict-3", "membership", "8.6", "For d = {'Ana': 'B'}, what does 'B' in d test?", "False", "True", "KeyError", dictSteps("contains", "B", "A+"), "Membership on a dictionary checks keys; 'B' is a value, not a key."), spec("dict-4", "update", "8.6", "After d['Katy'] = 'A', is Katy a key?", "True", "False", "KeyError", dictSteps("set", "Katy", "A"), "Assigning a value to a new key adds a dictionary entry.")];
  mount("dictionary", "Dictionary operations", [{ name: "op" }, { name: "key" }, { name: "value" }], dictChallenges, function () {
    var key = sample(["Ana", "John", "Katy", "Mina"]), op = sample(["lookup", "set", "contains"]), old = { Ana: "B", John: "A+" };
    var expression = op === "set" ? "d['" + key + "'] = 'A'" : op === "lookup" ? "d['" + key + "']" : "'" + key + "' in d";
    var answer = op === "lookup" ? (old[key] || "KeyError") : op === "set" ? "A" : String(Object.prototype.hasOwnProperty.call(old, key));
    var wrong = op === "set" ? (old[key] || "KeyError") : answer === "True" ? "False" : "True";
    var question = op === "set" ? "After " + expression + ", what value is stored under that key?" : op === "lookup" ? "What happens when Python evaluates " + expression + "?" : "What does " + expression + " return?";
    return spec("gen-dict", "new dictionary operation", "8.6", question, answer, wrong, "None", dictSteps(op, key, "A"), "Lookup and membership use keys; assignment adds or replaces the entry and stores the assigned value.");
  }, function (form) { var op = field(form, "op"), key = field(form, "key"), value = field(form, "value"); if (!key) throw Error("Enter a key."); return dictSteps(op, key, value); });

  var wordSets = [["sun", "rain", "sun", "wind", "rain"], ["cat", "dog", "cat", "owl", "dog"], ["red", "red", "blue", "green", "red"]];
  var freqChallenges = wordSets.map(function (words, i) { var c = C.frequencies(words), best = C.mostCommon(c), answer = best.words.join(", ") + ": " + best.count; return spec("freq-" + i, "most common words", "8.7", "Which word or words are most common, and how many times?", answer, words[0] + ": 1", "all words: 1", frequencySteps(words), "Count each occurrence under its word key, then collect every key at the maximum count."); }).concat([spec("freq-4", "increment a count", "8.7", "After counting ['oak', 'elm', 'oak'], what is the count for oak?", "2", "1", "3", frequencySteps(["oak", "elm", "oak"]), "The first oak creates a key with count 1; the next oak increments it to 2.")]);
  mount("frequency", "Frequency dictionary", [{ name: "words" }], freqChallenges, function () { var words = sample(wordSets), c = C.frequencies(words), best = C.mostCommon(c), answer = best.words.join(", ") + ": " + best.count; return spec("gen-frequency", "new frequency table", "8.7", "For " + words.join(", ") + ", name the most common word(s) and count.", answer, words[0] + ": 1", "all words: 1", frequencySteps(words), "A frequency dictionary stores each distinct word as a key and its count as the value."); }, function (form) { var text = field(form, "words"), words = text.split(",").map(function (x) { return x.trim(); }).filter(Boolean); if (!words.length) throw Error("Enter one or more comma-separated words."); if (words.length > 10) throw Error("Use at most 10 words so the table fits."); return frequencySteps(words); });
  var nestedValues = [[1, [2, 3], 4], [1, [2, [3]], 4], [], [[3, 1], [4]]];
  var nestedChallenges = nestedValues.map(function (value, i) {
    var trace = C.flattenTrace(value), answer = JSON.stringify(trace.values);
    var prompt = i === 1 ? "Which recursive call returns first for " + JSON.stringify(value) + "?" : "What flattened list does " + JSON.stringify(value) + " produce?";
    var choices = i === 1 ? ["flatten([3])", "flatten([2,[3]])", "flatten([1,[2,[3]],4])"] : i === 2 ? ["[0]", "[]", "[0,1]"] : i === 3 ? [JSON.stringify(trace.values.slice().reverse()), answer, "[]"] : [answer, JSON.stringify(trace.values.slice().reverse()), "[]"];
    return { id: "nested-" + i, short: "nested list", ref: "8.8", prompt: prompt, answer: i === 1 ? choices[0] : answer, options: choices.map(function (x) { return [x, x]; }), steps: trace.rows, why: i === 1 ? "The deepest sublist reaches its base case first. Its result then returns through the waiting calls." : "Each nested list is flattened recursively. Scalar items stay in their original left-to-right order." };
  });
  mount("nested", "Nested-list flattening", [], nestedChallenges, function () {
    var a = 1 + Math.floor(Math.random() * 9), b = a % 9 + 1, c = (a + 1) % 9 + 1, value = [a, [b, [c]]], trace = C.flattenTrace(value), answer = JSON.stringify(trace.values), wrong = JSON.stringify([c, b, a]);
    return { id: "gen-nested", short: "flatten a nested list", ref: "8.8", prompt: "Flatten " + JSON.stringify(value) + ". What list is returned?", answer: answer, options: [[answer, answer], [JSON.stringify([a, [b, c]]), JSON.stringify([a, [b, c]])], [wrong, wrong]], steps: trace.rows, why: "The recursive call finishes each nested part before the outer call continues, preserving depth-first left-to-right order." };
  }, function (form) {
    var text = field(form, "nested"), value;
    if (text.length > 100) throw Error("Use at most 100 characters.");
    try { value = JSON.parse(text); } catch (_) { throw Error("Enter a nested list using JSON brackets and commas."); }
    if (!Array.isArray(value)) throw Error("Start with a list in square brackets.");
    var trace = C.flattenTrace(value);
    if (trace.rows.length > 14) throw Error("Use a list with at most 14 trace steps so every call fits on the stage.");
    return trace.rows;
  });
})();
