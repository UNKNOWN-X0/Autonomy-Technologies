const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

test("service-worker version, shell assets and manifest links match the site", () => {
  const root = path.resolve(__dirname, "..");
  const result = spawnSync("python3", ["-I", "tools/check-offline.py"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
