const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const Search = require("../js/search.js");

test("search folds accents and matches every word by prefix", () => {
  assert.equal(Search.prefixMatch("electric field", "Électrical engineering and field strength"), true);
  assert.equal(Search.prefixMatch("electric magnetic", "Electric field"), false);
});

test("search ranks title, kind and current course in that order", () => {
  const index = [
    ["mei/a.html", "eei/b.html", "mei/c.html"],
    [
      [0, "sec-1", "MEI", "ULP spacing"],
      [1, "sec-2", "EEI", "ULP spacing"],
      [2, "sec-3", "MEI", "ULP spacing"],
    ],
    [
      [0, "p", "Practice ULP", ""],
      [1, "d", "Floating spacing", "ULP spacing"],
      [2, "s", "ULP spacing", ""],
    ],
  ];
  assert.deepEqual(Search.search(index, "ulp", "MEI").map((r) => r.entry[2]), ["ULP spacing", "Practice ULP", "Floating spacing"]);
});

test("the committed index matches the authored pages", () => {
  const root = path.resolve(__dirname, "..");
  const result = spawnSync("python3", ["-I", "tools/build-search.py", "--check"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
