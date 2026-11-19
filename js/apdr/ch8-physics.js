/* APDR Chapter 8: small, DOM-free models used by the guide and lab. */
(function (root) {
  function traceMultiply(a, b) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || b < 1 || b > 8) throw new RangeError("b must be an integer from 1 to 8");
    var calls = [];
    for (var n = b; n >= 1; n--) calls.push({ argument: n, base: n === 1 });
    return { calls: calls, value: a * b };
  }

  function fibonacci(n) {
    if (!Number.isInteger(n) || n < 0 || n > 35) throw new RangeError("n must be an integer from 0 to 35");
    var values = [1, 1];
    for (var i = 2; i <= n; i++) values[i] = values[i - 1] + values[i - 2];
    return values[n];
  }

  function naiveCalls(n) {
    if (!Number.isInteger(n) || n < 0 || n > 35) throw new RangeError("n must be an integer from 0 to 35");
    if (n < 2) return 1;
    return 1 + naiveCalls(n - 1) + naiveCalls(n - 2);
  }

  function memoCalls(n) {
    if (!Number.isInteger(n) || n < 0 || n > 35) throw new RangeError("n must be an integer from 0 to 35");
    return n < 2 ? 1 : 2 * n - 1;
  }

  function normalize(text) { return String(text).toLowerCase().replace(/[^a-z]/g, ""); }

  function palindromeTrace(text) {
    var s = normalize(text), pairs = [];
    for (var i = 0; i < Math.floor(s.length / 2); i++) {
      pairs.push([s[i], s[s.length - 1 - i]]);
      if (s[i] !== s[s.length - 1 - i]) break;
    }
    return { normalized: s, pairs: pairs, result: pairs.every(function (p) { return p[0] === p[1]; }) };
  }

  function frequencies(words) {
    return words.reduce(function (counts, word) { counts[word] = (counts[word] || 0) + 1; return counts; }, {});
  }

  function mostCommon(counts) {
    var max = Math.max.apply(null, Object.keys(counts).map(function (key) { return counts[key]; }));
    return { words: Object.keys(counts).filter(function (key) { return counts[key] === max; }), count: max };
  }

  function wordsOften(counts, minimum) {
    var remaining = Object.assign({}, counts), groups = [];
    while (Object.keys(remaining).length) {
      var best = mostCommon(remaining);
      if (best.count < minimum) break;
      groups.push(best);
      best.words.forEach(function (word) { delete remaining[word]; });
    }
    return { groups: groups, remaining: remaining };
  }

  function flattenTrace(list) {
    if (!Array.isArray(list)) throw new TypeError("input must be a nested list");
    var rows = [], items = 0;
    function visit(xs, depth) {
      if (depth > 8) throw new RangeError("nesting must be at most 8 levels");
      items += xs.length;
      if (items > 24) throw new RangeError("use at most 24 list items");
      rows.push("Call flatten(" + JSON.stringify(xs) + ")");
      var result = [];
      xs.forEach(function (item) {
        if (Array.isArray(item)) result.push.apply(result, visit(item, depth + 1));
        else {
          if (!Number.isSafeInteger(item) || item < 0 || item > 99) throw new TypeError("items must be whole numbers from 0 to 99");
          rows.push("Keep " + item);
          result.push(item);
        }
      });
      rows.push("Return " + JSON.stringify(result));
      return result;
    }
    var values = visit(list, 0);
    return { rows: rows, values: values };
  }

  root.APDR8 = { traceMultiply: traceMultiply, fibonacci: fibonacci, naiveCalls: naiveCalls, memoCalls: memoCalls, normalize: normalize, palindromeTrace: palindromeTrace, frequencies: frequencies, mostCommon: mostCommon, wordsOften: wordsOften, flattenTrace: flattenTrace };
  if (typeof module !== "undefined" && module.exports) module.exports = root.APDR8;
})(typeof globalThis !== "undefined" ? globalThis : this);
