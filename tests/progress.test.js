const test = require("node:test");
const assert = require("node:assert");
const P = require("../js/progress.js");

function store(init) {
  const m = Object.assign({}, init);
  return {
    get length() { return Object.keys(m).length; },
    key: (i) => Object.keys(m)[i],
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
  };
}

test("logDay re-reads the log, so a day another tab logged survives (#1)", () => {
  const s = store({ "x-log": JSON.stringify({ days: ["2026-11-02"] }) });
  // a guide tab that loaded on 11-01 would only know ["2026-11-01"]; logDay never writes that stale copy
  P.logDay(s, "x", "2026-11-03");
  assert.deepStrictEqual(JSON.parse(s.getItem("x-log")).days, ["2026-11-02", "2026-11-03"]);
  P.logDay(s, "x", "2026-11-03");
  assert.strictEqual(JSON.parse(s.getItem("x-log")).days.length, 2, "a day is logged once");
});

test("logDay repairs a broken log", () => {
  const s = store({ "x-log": "not json" });
  assert.deepStrictEqual(P.logDay(s, "x", "2026-11-03").days, ["2026-11-03"]);
});

test("prune drops renamed guide keys and keeps lab keys (#7)", () => {
  const checks = { truth: true, statement: true, "lab-sets": true };
  assert.strictEqual(P.prune(checks, ["truth-tables", "statement"]), true);
  assert.deepStrictEqual(checks, { statement: true, "lab-sets": true });
  assert.strictEqual(P.prune(checks, ["statement"]), false);
});

test("count splits guide and lab ticks and caps each part", () => {
  assert.deepStrictEqual(P.count({ a: true, b: false, "lab-1": true }, 5, 2), { guideDone: 1, labDone: 1, done: 2 });
  // left-over keys can never push a part past its size
  assert.deepStrictEqual(P.count({ a: 1, b: 1, c: 1, d: 1, "lab-1": 1, "lab-2": 1, "lab-3": 1 }, 5, 2), { guideDone: 3, labDone: 2, done: 5 });
  assert.deepStrictEqual(P.count({}, 0, 0), { guideDone: 0, labDone: 0, done: 0 });
});

test("review: new, due without days, then the 1/7/30-day gaps", () => {
  assert.strictEqual(P.review([], 0, "2026-11-10").state, "new");
  assert.deepStrictEqual(P.review([], 3, "2026-11-10"), { state: "due", since: null, gap: 1, weight: 1 });
  assert.strictEqual(P.review(["2026-11-10"], 1, "2026-11-10").state, "fresh");
  assert.strictEqual(P.review(["2026-11-09"], 1, "2026-11-10").state, "due");
  assert.strictEqual(P.review(["2026-11-08"], 1, "2026-11-10").state, "overdue");
  const two = P.review(["2026-11-01", "2026-11-04"], 1, "2026-11-10");
  assert.strictEqual(two.gap, 7);
  assert.strictEqual(two.state, "fresh");
  const many = P.review(["2026-09-01", "2026-09-02", "2026-09-03", "2026-10-01"], 1, "2026-11-10");
  assert.strictEqual(many.gap, 30);
  assert.strictEqual(many.state, "due");
});

test("review counts calendar days across a clock change", () => {
  // Europe/Berlin leaves summer time on 2026-10-25; dates are compared as UTC days, so this is 2 days, not 1.96
  assert.strictEqual(P.review(["2026-10-24"], 1, "2026-10-26").since, 2);
});

test("review sorts days, so the newest day counts wherever it is stored", () => {
  assert.strictEqual(P.review(["2026-11-10", "2026-11-01"], 1, "2026-11-10").since, 0);
});

test("signature changes only with progress keys", () => {
  const s = store({ "x-checks": "{}", "hub-tabs": "{}" });
  const a = P.signature(s);
  s.setItem("hub-tabs", '{"a":1}');
  assert.strictEqual(P.signature(s), a);
  s.setItem("x-checks", '{"a":true}');
  assert.notStrictEqual(P.signature(s), a);
});

test("stamp is the local calendar date", () => {
  assert.strictEqual(P.stamp(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
});

test("export then import into another browser merges ticks, days and lab answers (#4)", () => {
  const phone = store({
    "x-checks": JSON.stringify({ a: true, "lab-1": true }),
    "x-log": JSON.stringify({ days: ["2026-11-01"] }),
    "x-lab": JSON.stringify({ c1: "sure" }),
    "site-settings": JSON.stringify({ theme: "dark" }),
  });
  const file = JSON.parse(JSON.stringify(P.exportData(phone)));
  assert.deepStrictEqual(Object.keys(file.data).sort(), ["x-checks", "x-lab", "x-log"], "settings are not progress");
  const laptop = store({
    "x-checks": JSON.stringify({ b: true, a: false }),
    "x-log": JSON.stringify({ days: ["2026-11-03"] }),
    "x-lab": JSON.stringify({ c1: "guess" }),
  });
  assert.strictEqual(P.importData(laptop, file), 2, "checks and log change; the lab answers here already win");
  assert.deepStrictEqual(JSON.parse(laptop.getItem("x-checks")), { b: true, a: true, "lab-1": true });
  assert.deepStrictEqual(JSON.parse(laptop.getItem("x-log")).days, ["2026-11-01", "2026-11-03"]);
  assert.deepStrictEqual(JSON.parse(laptop.getItem("x-lab")), { c1: "guess" }, "answers here win");
  assert.strictEqual(P.importData(laptop, file), 0, "importing twice changes nothing");
});

test("import rejects a file that is not a backup, and skips foreign keys", () => {
  const s = store({});
  assert.throws(() => P.importData(s, { hello: 1 }));
  assert.throws(() => P.importData(s, null));
  assert.strictEqual(P.importData(s, { site: "autonomy-technologies", data: { "site-settings": { theme: "x" }, "y-log": { days: ["bad", "2026-11-01"] } } }), 1);
  assert.strictEqual(s.getItem("site-settings"), null);
  assert.deepStrictEqual(JSON.parse(s.getItem("y-log")).days, ["2026-11-01"]);
});
