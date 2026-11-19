# Graph Report - Autonomy-Technologies  (2026-11-19)

## Corpus Check
- 96 files · ~440,105 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 5, (none) 3, .ico 1)

## Summary
- 1537 nodes · 3023 edges · 79 communities (69 shown, 10 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 344 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a0c54dd6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EEI 1 lab: fields and capacitors
- Site look: design rules
- Tooling: stacked fractions
- APDR 3 lab: number formats
- APDR 12a lab: Boolean algebra
- MEI 1 lab: logic and sets
- Lab rules and APDR 12a formulas
- EEI 1 formulas
- APDR 34a lab: floating-point representation
- Lab engine (all labs)
- APDR 2 lab: computers and logic
- APDR 2 guide: lecture source
- APDR 2 guide: topics
- Home page and chapter rail
- APDR 4 lab: floating point
- MEI formula parser
- Helper notes for AI agents
- Saved question: hosting
- Saved question: learner journey
- Guide diagrams
- Hover tooltips
- Home page design brief
- Concept map
- EEI lab design brief
- Site preview picture
- Course overview: subjects and pages
- APDR 4 formulas
- APDR 3 formulas
- Graph description and orb tools
- MEI 2 lab: real numbers
- Agent instructions
- EEI 3 formula and challenge tests
- APDR 5 lab: memory
- MEI 4 lab: complex numbers
- MEI 1 formulas
- MEI 3 lab: mappings
- Heading effects and reading chip
- Lab challenge test helpers and PDF print tool
- MEI 2 formulas
- MEI 3 formulas
- Study guide rules
- EEI 2 lab: currents and resistance
- APDR 5 formulas
- Guide-to-LaTeX formula rendering
- Product truth
- APDR 2 lab: NAND gate models
- Guide diagram rendering
- Page check script
- Home page orb
- Tooling rules
- Worked-solutions rules
- EEI 2 formulas
- MEI 4 formulas: complex arithmetic
- Recently added notice
- Node.js test helpers
- Appendix rules
- EEI 3 lab: DC network experiments
- Physics test suites
- Tooling: guide checker
- APDR 7 physics: a small Python interpreter
- EEI 3 physics: DC network formulas
- APDR 6 physics: Python semantics and traces
- APDR 6 lab: Python step-by-step experiments
- APDR 7 lab: frames, lists and aliasing
- Generated lab challenge tests
- HTML parse tree for PDF conversion
- Lab challenge tests
- LaTeX HTML conversion tree
- APDR Chapter 9 lab
- GitHub Actions checks
- APDR Chapter 8 lab
- Saved progress and review schedule
- APDR Chapter 8 recursion and dictionaries
- Coordinate diagram geometry
- APDR 11 inheritance lab
- APDR Chapter 10 lab
- Fact-check log

## God Nodes (most connected - your core abstractions)
1. `fieldPlayground()` - 30 edges
2. `run()` - 30 edges
3. `Components` - 26 edges
4. `capacitorBench()` - 22 edges
5. `paint()` - 21 edges
6. `exec()` - 20 edges
7. `PyError()` - 19 edges
8. `draw()` - 18 edges
9. `networks()` - 18 edges
10. `queue()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Challenges` --references--> `reveal()`  [INFERRED]
  docs/LAB-STANDARD.md → js/nav.js
- `Formulas` --references--> `T()`  [INFERRED]
  docs/MARKUP-STANDARD.md → tools/guide-to-tex.py
- `Markup` --references--> `T()`  [INFERRED]
  docs/MARKUP-STANDARD.md → tools/guide-to-tex.py
- `Experiments` --references--> `generate()`  [INFERRED]
  docs/LAB-STANDARD.md → js/apdr/ch12-physics.js
- `Generated challenges (New challenge)` --references--> `generate()`  [INFERRED]
  docs/LAB-STANDARD.md → js/apdr/ch12-physics.js

## Import Cycles
- None detected.

## Communities (79 total, 10 thin omitted)

### Community 0 - "EEI 1 lab: fields and capacitors"
Cohesion: 0.05
Nodes (78): capacitorBench(), charged(), circuit(), draw(), grow(), guessOn(), nice(), paint() (+70 more)

### Community 1 - "Site look: design rules"
Cohesion: 0.04
Nodes (47): Answer key, Buttons, Chapter switcher and tick groups, Colors, Components, Course code square, Course-part switch, Dark mode (+39 more)

### Community 2 - "Tooling: stacked fractions"
Cohesion: 0.17
Nodes (15): atom_open(), convert(), denominator(), find(), is_close(), is_open(), match_back(), match_fwd() (+7 more)

### Community 3 - "APDR 3 lab: number formats"
Cohesion: 0.11
Nodes (47): animate(), arrow(), box(), colours(), columnsShown(), decodeStep(), digits(), drawBases() (+39 more)

### Community 4 - "APDR 12a lab: Boolean algebra"
Cohesion: 0.10
Nodes (50): animate(), arrow(), boolABC(), boolXY(), box(), colours(), drawAnf(), drawGraph() (+42 more)

### Community 5 - "MEI 1 lab: logic and sets"
Cohesion: 0.09
Nodes (39): bindStagePointer(), choose(), coords(), bit(), count(), domainRows(), domainStage(), drawSlider() (+31 more)

### Community 6 - "Lab rules and APDR 12a formulas"
Cohesion: 0.08
Nodes (27): Acceptance, Challenges, Decisions, Experiments, Files, Generated challenges (New challenge), Lab standard, Layout (+19 more)

### Community 7 - "EEI 1 formulas"
Cohesion: 0.19
Nodes (5): bench(), contributions(), field(), lineWork(), plate()

### Community 8 - "APDR 34a lab: floating-point representation"
Cohesion: 0.13
Nodes (16): challenge(), colors(), draw(), drawColumns(), drawFields(), drawLine(), x(), mix() (+8 more)

### Community 9 - "Lab engine (all labs)"
Cohesion: 0.17
Nodes (19): bitCells(), render(), wanted(), chevron(), complete(), enhanceAll(), enhanceSelect(), choose() (+11 more)

### Community 10 - "APDR 2 lab: computers and logic"
Cohesion: 0.16
Nodes (33): bits(), box(), colours(), drawAlgorithm(), drawEquivalent(), drawLogic(), drawNand(), drawTiming() (+25 more)

### Community 11 - "APDR 2 guide: lecture source"
Cohesion: 0.67
Nodes (3): APDR lecture slides: Algorithms, programming and data representation; Boolean algebra and logic, Bernhard Kainz, Computers, Algorithms, and Boolean Logic · APDR Chapter 2

### Community 12 - "APDR 2 guide: topics"
Cohesion: 0.20
Nodes (11): Algorithm, Boolean expressions, Boolean laws, De Morgan's laws, Logic gates, NAND, Physical circuits, Program language (+3 more)

### Community 13 - "Home page and chapter rail"
Cohesion: 0.05
Nodes (37): ago(), countUp(), foldBoard(), go(), light(), reach(), reroute(), route() (+29 more)

### Community 14 - "APDR 4 lab: floating point"
Cohesion: 0.11
Nodes (29): animate(), arithmeticResult(), arrow(), box(), challenge(), colours(), drawArithmetic(), drawFraction() (+21 more)

### Community 15 - "MEI formula parser"
Cohesion: 0.23
Nodes (16): bool(), compile(), atom(), expr(), power(), startsAtom(), take(), term() (+8 more)

### Community 16 - "Helper notes for AI agents"
Cohesion: 0.33
Nodes (5): APDR content rule, Autonomy Course Site, Before changing the site, Boundaries, Study materials

### Community 17 - "Saved question: hosting"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How are the static study pages hosted, and what GitHub Pages and Jekyll workflow conditions control publishing?, Source Nodes

### Community 18 - "Saved question: learner journey"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Does the graph cover the learner journey from the course home through the electrostatics and mathematics guides and labs, including local progress state and external assets?, Source Nodes

### Community 19 - "Guide diagrams"
Cohesion: 0.09
Nodes (31): arrow(), charge(), COORD(), add(), arc(), axis(), dot(), fit() (+23 more)

### Community 22 - "Concept map"
Cohesion: 0.46
Nodes (7): below(), box(), draw(), pulse(), redraw(), select(), stopPulses()

### Community 25 - "Course overview: subjects and pages"
Cohesion: 0.20
Nodes (13): Electrical Engineering I study cards, Mathematics for Engineers I study cards, Study Pages home page, Active-recall study workflow, Electrical Engineering I, Electrostatic Fields interactive lab, Electrostatic Fields study guide, GitHub Pages hosting (+5 more)

### Community 26 - "APDR 4 formulas"
Cohesion: 0.23
Nodes (10): binaryValue(), classifySingle(), decodeSingle(), float32(), fractionBits(), fractionValue(), normalizedBinary(), scientificOperation() (+2 more)

### Community 27 - "APDR 3 formulas"
Cohesion: 0.26
Nodes (10): columnSubtract(), convert(), decodeInteger(), decodeTwos(), negatePattern(), parseBase(), parseBits(), toBase() (+2 more)

### Community 28 - "Graph description and orb tools"
Cohesion: 0.20
Nodes (10): comment_above(), describe(), file_phrase(), find_parents(), from_name(), main(), patch_html(), words() (+2 more)

### Community 29 - "MEI 2 lab: real numbers"
Cohesion: 0.16
Nodes (26): binaryDraw(), bindSlider(), boundsDraw(), box(), distanceDraw(), distinct(), guess(), inductionDraw() (+18 more)

### Community 30 - "Agent instructions"
Cohesion: 0.67
Nodes (3): Local workflow, Project data, Project instructions

### Community 31 - "EEI 3 formula and challenge tests"
Cohesion: 0.25
Nodes (5): assert, fs, path, test, vm

### Community 32 - "APDR 5 lab: memory"
Cohesion: 0.26
Nodes (12): box(), challenge(), colours(), draw(), fit(), hx(), label(), line() (+4 more)

### Community 33 - "MEI 4 lab: complex numbers"
Cohesion: 0.12
Nodes (27): ang(), br(), cfmt(), ch(), gcd(), line(), mix(), node() (+19 more)

### Community 34 - "MEI 1 formulas"
Cohesion: 0.18
Nodes (6): complement(), formatInterval(), intersect(), interval(), member(), setOp()

### Community 35 - "MEI 3 lab: mappings"
Cohesion: 0.13
Nodes (35): bindSlider(), compositionDraw(), elementaryDraw(), fmt(), graphDraw(), line(), mappingDraw(), node() (+27 more)

### Community 36 - "Heading effects and reading chip"
Cohesion: 0.23
Nodes (14): decode(), frame(), decodeAll(), fit(), fitAll(), fitFormulas(), glyph(), readout() (+6 more)

### Community 37 - "Lab challenge test helpers and PDF print tool"
Cohesion: 0.13
Nodes (9): cube, args, { chromium }, fit, fs, page, path, pdf (+1 more)

### Community 39 - "MEI 3 formulas"
Cohesion: 0.14
Nodes (4): discriminant(), relationValues(), roots(), squarePreimages()

### Community 40 - "Study guide rules"
Cohesion: 0.18
Nodes (11): Acceptance, Content rules, Decisions, Files, Labs, Page structure, Practice and testing, Principles (+3 more)

### Community 41 - "EEI 2 lab: currents and resistance"
Cohesion: 0.18
Nodes (18): angle(), challenge(), draw(), marker(), text(), fmt(), getControls(), mount() (+10 more)

### Community 43 - "Guide-to-LaTeX formula rendering"
Cohesion: 0.16
Nodes (10): amap_data(), amap_label(), amap_tikz(), big_op(), grow_delims(), math(), math_text(), math_wrap() (+2 more)

### Community 45 - "Product truth"
Cohesion: 0.20
Nodes (10): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Product, Product Principles (+2 more)

### Community 46 - "APDR 2 lab: NAND gate models"
Cohesion: 0.36
Nodes (4): nand(), nandAnd(), nandCircuit(), nandOr()

### Community 47 - "Guide diagram rendering"
Cohesion: 0.14
Nodes (17): Decisions, Diagrams, Formulas, Markup, Markup and notation standard, PDF, Signs, arrow_t() (+9 more)

### Community 48 - "Page check script"
Cohesion: 0.48
Nodes (6): fail(), pass(), PATH, page-check.sh script, skip(), warn()

### Community 49 - "Home page orb"
Cohesion: 0.54
Nodes (7): draw(), frame(), kick(), load(), readColours(), reduced(), token()

### Community 50 - "Tooling rules"
Cohesion: 0.33
Nodes (6): Acceptance, Normal authoring workflow, Source and generated files, Tool changes, Tool roles, Tooling standard

### Community 51 - "Worked-solutions rules"
Cohesion: 0.40
Nodes (5): Acceptance, Exercise solutions standard, Files and source, Learning sequence, Page frame

### Community 52 - "EEI 2 formulas"
Cohesion: 0.12
Nodes (5): Acceptance, EEI Chapter 2 lab: Stationary Currents, Experiments (in chapter order), Scope and files, conductivity()

### Community 53 - "MEI 4 formulas: complex arithmetic"
Cohesion: 0.19
Nodes (11): add(), arg(), conj(), div(), exp(), fromPolar(), log(), mul() (+3 more)

### Community 54 - "Recently added notice"
Cohesion: 0.38
Nodes (9): age(), read(), remember(), seen(), show(), dismiss(), esc(), start() (+1 more)

### Community 55 - "Node.js test helpers"
Cohesion: 0.08
Nodes (11): row(), rows(), assert, test, assert, test, assert, test (+3 more)

### Community 56 - "Appendix rules"
Cohesion: 0.50
Nodes (4): Acceptance, Appendix standard, Exam sheets, Page

### Community 57 - "EEI 3 lab: DC network experiments"
Cohesion: 0.17
Nodes (32): arrow(), dot(), drawDivider(), drawKirchhoff(), drawPower(), drawSource(), drawSuper(), flow() (+24 more)

### Community 58 - "Physics test suites"
Cohesion: 0.15
Nodes (7): definitions(), fake(), assert, fs, path, test, vm

### Community 59 - "Tooling: guide checker"
Cohesion: 0.14
Nodes (13): all_nodes(), answers_of(), check(), check_appendix(), check_exercise(), check_files(), check_icons(), check_lab() (+5 more)

### Community 60 - "APDR 7 physics: a small Python interpreter"
Cohesion: 0.12
Nodes (49): BreakSig(), checkInt(), ContinueSig(), describe(), eq(), floorDiv(), iterItems(), less() (+41 more)

### Community 61 - "EEI 3 physics: DC network formulas"
Cohesion: 0.11
Nodes (3): divider(), par(), superpose()

### Community 62 - "APDR 6 physics: Python semantics and traces"
Cohesion: 0.11
Nodes (36): apply(), checkInt(), evaluate(), floatDivmod(), floorDiv(), fmtFloat(), intDivmod(), num() (+28 more)

### Community 63 - "APDR 6 lab: Python step-by-step experiments"
Cohesion: 0.16
Nodes (27): colours(), drawExpr(), drawSlice(), drawTrace(), exprSpec(), exprState(), field(), fitSize() (+19 more)

### Community 64 - "APDR 7 lab: frames, lists and aliasing"
Cohesion: 0.18
Nodes (28): applyOps(), arrow(), clip(), colours(), draw(), field(), fitSize(), fmtList() (+20 more)

### Community 65 - "Generated lab challenge tests"
Cohesion: 0.20
Nodes (10): assert, context(), defsOf(), fake(), fs, labs, path, ROOT (+2 more)

### Community 67 - "Lab challenge tests"
Cohesion: 0.21
Nodes (10): assert, context(), fake(), fs, loadExperiments(), path, ROOT, runEngine() (+2 more)

### Community 68 - "LaTeX HTML conversion tree"
Cohesion: 0.22
Nodes (6): Conv, est(), find(), inline(), main(), tex_text()

### Community 69 - "APDR Chapter 9 lab"
Cohesion: 0.67
Nodes (3): mount(), make(), paint()

### Community 70 - "GitHub Actions checks"
Cohesion: 0.12
Nodes (15): runs-on, steps, jobs, checks, name, on, pull_request, push (+7 more)

### Community 72 - "APDR Chapter 8 lab"
Cohesion: 0.17
Nodes (9): field(), integer(), mount(), buildChallenge(), live(), paint(), showSpec(), options() (+1 more)

### Community 73 - "Saved progress and review schedule"
Cohesion: 0.26
Nodes (8): exportData(), importData(), logDay(), read(), review(), stamp(), utcDay(), write()

### Community 74 - "APDR Chapter 8 recursion and dictionaries"
Cohesion: 0.20
Nodes (7): flattenTrace(), visit(), mostCommon(), naiveCalls(), normalize(), palindromeTrace(), wordsOften()

### Community 75 - "Coordinate diagram geometry"
Cohesion: 0.32
Nodes (5): coord_pieces(), axis(), fit(), tip_label(), vec()

### Community 77 - "APDR 11 inheritance lab"
Cohesion: 0.67
Nodes (3): mount(), challenge(), paint()

### Community 78 - "APDR Chapter 10 lab"
Cohesion: 0.67
Nodes (3): mount(), challenge(), paint()

## Knowledge Gaps
- **11 isolated node(s):** `PATH`, `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 460 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lab standard` connect `Lab rules and APDR 12a formulas` to `Project docs map`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `fieldPlayground()` (e.g. with `eei/ch1-lab.js` and `endDrag()`) actually correct?**
  _`fieldPlayground()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PATH`, `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EEI 1 lab: fields and capacitors` be split into smaller, more focused modules?**
  _Cohesion score 0.05303030303030303 - nodes in this community are weakly interconnected._
- **Are the 2 inferred relationships involving `run()` (e.g. with `ch7-physics.js` and `str()`) actually correct?**
  _`run()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Site look: design rules` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Are the 2 inferred relationships involving `capacitorBench()` (e.g. with `eei/ch1-lab.js` and `resize()`) actually correct?**
  _`capacitorBench()` has 2 INFERRED edges - model-reasoned connections that need verification._