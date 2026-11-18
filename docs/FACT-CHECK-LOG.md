# Fact-check log

Pages and lab scripts whose content has been checked against the facts: every definition, rule, worked example, practice answer, exam answer, "slips in the notes" claim and lab challenge (prompt, keyed answer, explanation). Numbers were recomputed, not just read.

**How to use it:** a row holds the file's git blob hash at the time of the check. If `git hash-object <file>` still prints that hash, the file has not changed and needs no second look. If it differs, only the edit since then needs checking; add a new row when done. Script-only edits (for example a new `<script>` tag) change the hash without touching content: check the diff and re-record.

```sh
# list checked files that changed since their check
while IFS='|' read -r _ f h _; do f=$(echo $f); h=$(echo $h); [ -f "$f" ] && [ "$(git hash-object "$f" | cut -c1-12)" != "$h" ] && echo "changed: $f"; done < <(grep '^| [a-z]' docs/FACT-CHECK-LOG.md)
```

| File | Blob | Checked | Result |
|---|---|---|---|
| mei/ch1-statements-logic-sets.html | c7830bb0485f | 2026-11-18 | Pass, no errors found |
| js/mei/ch1-lab.js | e4026b841e58 | 2026-11-18 | Pass, no errors found |
| mei/ch2-real-numbers.html | 57b303423b55 | 2026-11-18 | Pass, no errors found |
| js/mei/ch2-lab.js | fecd7d8ce3ea | 2026-11-18 | Pass, no errors found |
| mei/ch3-mappings.html | 52187c61460d | 2026-11-18 | Pass, no errors found |
| js/mei/ch3-lab.js | ea937395f1b7 | 2026-11-18 | Pass, no errors found |
| mei/ch4-complex-numbers.html | 076860fc4d6f | 2026-11-18 | Pass, no errors found |
| js/mei/ch4-lab.js | f44639451f8d | 2026-11-18 | Pass, no errors found |
| mei/ch1-statements-logic-sets-lab.html | 14788c22b6d3 | 2026-11-18 | Pass; footer page range fixed to 1–11 to match the guide |
| mei/ch2-real-numbers-lab.html | 12792e5c05be | 2026-11-18 | Pass |
| mei/ch3-mappings-lab.html | 44203fef40ef | 2026-11-18 | Pass |
| mei/ch4-complex-numbers-lab.html | 5fae6e75a783 | 2026-11-18 | Pass |
| apdr/ch2-computers.html | e59f2b85b99d | 2026-11-18 | Pass, no errors found |
| js/apdr/ch2-lab.js | fa150f9e449b | 2026-11-18 | Pass, no errors found |
| apdr/ch2-computers-lab.html | 783894f08f69 | 2026-11-18 | Pass, no errors found |
| apdr/ch3-data-representation.html | 91fd975fb7ab | 2026-11-18 | Pass, no errors found |
| js/apdr/ch3-lab.js | 3eb6515a0fbf | 2026-11-18 | Pass, no errors found |
| apdr/ch3-data-representation-lab.html | 81f6f2e0380f | 2026-11-18 | Pass, no errors found |
| apdr/ch34a-integer-and-floating-point.html | b84f5b2fc185 | 2026-11-18 | Pass, no errors found |
| js/apdr/ch34-lab.js | 2c099865cd67 | 2026-11-18 | Pass, no errors found |
| apdr/ch34a-integer-and-floating-point-lab.html | b02acd7a4a49 | 2026-11-18 | Pass, no errors found |
| apdr/ch4-floating-point-numbers.html | 220ae2ba84f8 | 2026-11-18 | Pass, no errors found |
| js/apdr/ch4-lab.js | 9125950cb3e3 | 2026-11-18 | Pass, no errors found |
| apdr/ch4-floating-point-numbers-lab.html | ca9bb154e731 | 2026-11-18 | Pass, no errors found |
| apdr/ch5-memory-organisation.html | 22d02a1e679b | 2026-11-18 | Pass, no errors found |
| js/apdr/ch5-lab.js | 1729b778334b | 2026-11-18 | Pass, no errors found |
| apdr/ch5-memory-organisation-lab.html | cc9916107222 | 2026-11-18 | Pass, no errors found |
| apdr/ch6-branching-and-iteration.html | 001cf7198fb1 | 2026-11-18 | Pass; Python results re-run in Python 3 |
| js/apdr/ch6-lab.js | 93a879b5e5c8 | 2026-11-18 | Pass; Python results re-run in Python 3 |
| apdr/ch6-branching-and-iteration-lab.html | 2be95e2d663b | 2026-11-18 | Pass; Python results re-run in Python 3 |
| apdr/ch7-functions-tuples-lists.html | 0c4f0adee920 | 2026-11-18 | Pass; Python results re-run in Python 3 |
| js/apdr/ch7-lab.js | 49c208979c62 | 2026-11-18 | Pass; Python results re-run in Python 3 |
| apdr/ch7-functions-tuples-lists-lab.html | 7382bbd45340 | 2026-11-18 | Pass; Python results re-run in Python 3 |
