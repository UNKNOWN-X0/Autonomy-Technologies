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
| apdr/ch12a-boolean-algebra.html | 5a852c79bbab | 2026-11-18 | Pass; OBDD sizes, Post-class counts and K-map covers recomputed |
| js/apdr/ch12-lab.js | ea2623f1040f | 2026-11-18 | Pass; OBDD sizes, Post-class counts and K-map covers recomputed |
| apdr/ch12a-boolean-algebra-lab.html | 745f928d5340 | 2026-11-18 | Pass; OBDD sizes, Post-class counts and K-map covers recomputed |
| apdr/ch8-recursion-dictionaries.html | c0f3a3c2c72a | 2026-11-19 | Pass; source and answers checked against all 46 slides; documented corrections for slides 13, 19, 32, 34 and 40–43 |
| js/apdr/ch8-physics.js | 7fc5afd9cd54 | 2026-11-19 | Pass; multiplication, Fibonacci, palindrome, frequency and nested-list models checked |
| js/apdr/ch8-lab.js | 68d72ac235bf | 2026-11-19 | Pass; fixed and generated challenge answers, explanations and input limits checked |
| apdr/ch8-recursion-dictionaries-lab.html | b37c20dd43d3 | 2026-11-19 | Pass; six experiment links, script wiring, hub counts and rendered layout checked |
| apdr/ch9-testing-debugging.html | fd7b8e3c641f | 2026-11-19 | Pass; source, exception semantics, all practice answers and both exam solutions checked against 35 slides |
| js/apdr/ch9-lab.js | 1c5b7a31015d | 2026-11-19 | Pass; all 24 challenge answers and explanations checked against the lecture |
| apdr/ch9-testing-debugging-lab.html | 3a863ea9dce2 | 2026-11-19 | Pass; six experiment links, stage wiring and guide references checked |
| apdr/ch10-object-oriented-programming.html | db104e1ed936 | 2026-11-19 | Pass; all 21 slides, worked examples, 20 practice answers and both exam solutions checked |
| js/apdr/ch10-lab.js | 8b70dfdcc534 | 2026-11-19 | Pass; all 24 challenge answers and explanations checked |
| apdr/ch10-object-oriented-programming-lab.html | 6ee8fdd3e2f4 | 2026-11-19 | Pass; six experiment links, stage wiring and guide references checked |
| apdr/ch11-classes-inheritance.html | 5051b524fada | 2026-11-19 | Pass; all 22 slides, inheritance traces, 20 practice answers and both exam solutions checked; documented malformed source examples and Rabbit root edge case |
| js/apdr/ch11-lab.js | 6f7057cbd9c5 | 2026-11-19 | Pass; all 24 challenge answers and explanations checked |
| apdr/ch11-classes-inheritance-lab.html | a9ba8ee1091d | 2026-11-19 | Pass; six experiment links, guide references and Dog example input verified; fixed malformed quoted value |
| eei/ch1-electrostatic-fields.html | 7970d8196aef | 2026-11-18 | Pass; all 38 practice and both exam answers recomputed; fixed: uniqueness theorem was called the reason field lines cannot cross (the reason is that E has one direction at each point) |
| js/eei/ch1-lab.js | fa04095b9acb | 2026-11-18 | Pass, no errors found |
| eei/ch1-electrostatic-fields-lab.html | c5f857947918 | 2026-11-18 | Pass, no errors found |
| eei/ch2-stationary-currents.html | 6b74416c71cc | 2026-11-18 | Pass, no errors found |
| js/eei/ch2-lab.js | cf43492bbb80 | 2026-11-18 | Pass, no errors found |
| eei/ch2-stationary-currents-lab.html | b8d7a71b26cb | 2026-11-18 | Pass, no errors found |
| eei/ch3-dc-networks.html | d9c879826cf5 | 2026-11-18 | Pass; node systems, bridge and exam answers recomputed |
| js/eei/ch3-lab.js | 676198ec1501 | 2026-11-18 | Pass; node systems, bridge and exam answers recomputed |
| eei/ch3-dc-networks-lab.html | e0cc7bab7d8f | 2026-11-18 | Pass; node systems, bridge and exam answers recomputed |
