# Graph Report - AutonomyTechnologies  (2026-11-16)

## Corpus Check
- 72 files · ~308,388 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 4, (none) 2)

## Summary
- 1155 nodes · 2221 edges · 57 communities (46 shown, 11 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 236 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41f20646`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EEI 1 lab: fields and capacitors
- Site look: design rules
- Guide checker, fraction stacker and graph notes
- APDR 3 lab: number formats
- APDR 12a lab: Boolean algebra
- MEI 1 lab: logic and sets
- Lab rules and APDR 12a formulas
- EEI 1 formulas
- Website publishing
- Lab engine (all labs)
- APDR 2 lab: computers and logic
- APDR 2 guide: lecture source
- APDR 2 guide: topics
- index.js
- APDR 4 lab: floating point
- compile
- Helper notes for AI agents
- Saved question: hosting
- Saved question: learner journey
- Guide diagrams
- Hover tooltips
- Home page design brief
- Concept map
- EEI lab design brief
- Site preview picture
- Study Pages project guide
- APDR 4 formulas
- APDR 3 formulas
- APDR 34a lab: integers and floats
- MEI 2 lab: real numbers
- Project instructions
- Formula tests (APDR 2 and 3, MEI 3)
- APDR 5 lab: memory
- check-guide.py
- MEI 1 formulas
- MEI 3 lab: mappings
- Heading effects and reading chip
- Lab question and MEI tests
- MEI 2 formulas
- MEI 3 formulas
- Study guide standard
- EEI 2 lab: currents and resistance
- APDR 5 formulas
- EEI 1 formula tests
- Product
- apdr/ch2-physics.js
- PDF converter core and graph notes
- page-check.sh
- Home page orb
- Tooling standard
- Exercise solutions standard
- EEI 2 formulas
- Lab question generator tests
- EEI 2 formula tests
- Appendix standard

## God Nodes (most connected - your core abstractions)
1. `fieldPlayground()` - 30 edges
2. `Components` - 25 edges
3. `capacitorBench()` - 22 edges
4. `paint()` - 21 edges
5. `draw()` - 18 edges
6. `networks()` - 18 edges
7. `queue()` - 18 edges
8. `update()` - 18 edges
9. `interfaceBench()` - 17 edges
10. `check()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Experiments` --references--> `generate()`  [INFERRED]
  docs/LAB-STANDARD.md → js/apdr/ch12-physics.js
- `Challenges` --references--> `reveal()`  [INFERRED]
  docs/LAB-STANDARD.md → js/nav.js
- `Markup` --references--> `T()`  [INFERRED]
  docs/MARKUP-STANDARD.md → tools/guide-to-tex.py
- `Formulas` --references--> `T()`  [INFERRED]
  docs/MARKUP-STANDARD.md → tools/guide-to-tex.py
- `Code` --references--> `route()`  [INFERRED]
  STANDARDS.md → js/index.js

## Import Cycles
- None detected.

## Communities (57 total, 11 thin omitted)

### Community 0 - "EEI 1 lab: fields and capacitors"
Cohesion: 0.05
Nodes (78): capacitorBench(), charged(), circuit(), draw(), grow(), guessOn(), nice(), paint() (+70 more)

### Community 1 - "Site look: design rules"
Cohesion: 0.04
Nodes (46): Answer key, Buttons, Chapter switcher and tick groups, Colors, Components, Course code square, Course-part switch, Dark mode (+38 more)

### Community 2 - "Guide checker, fraction stacker and graph notes"
Cohesion: 0.09
Nodes (25): comment_above(), describe(), file_phrase(), find_parents(), from_name(), main(), patch_html(), words() (+17 more)

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
Nodes (28): Acceptance, Challenges, Decisions, Experiments, Files, Generated challenges (New challenge), Lab standard, Layout (+20 more)

### Community 7 - "EEI 1 formulas"
Cohesion: 0.19
Nodes (5): bench(), contributions(), field(), lineWork(), plate()

### Community 8 - "Website publishing"
Cohesion: 0.14
Nodes (13): runs-on, steps, jobs, build, name, branches, branches, name (+5 more)

### Community 9 - "Lab engine (all labs)"
Cohesion: 0.17
Nodes (20): bitCells(), render(), wanted(), chevron(), complete(), enhanceAll(), enhanceSelect(), choose() (+12 more)

### Community 10 - "APDR 2 lab: computers and logic"
Cohesion: 0.16
Nodes (33): bits(), box(), colours(), drawAlgorithm(), drawEquivalent(), drawLogic(), drawNand(), drawTiming() (+25 more)

### Community 11 - "APDR 2 guide: lecture source"
Cohesion: 0.67
Nodes (3): APDR lecture slides: Algorithms, programming and data representation; Boolean algebra and logic, Bernhard Kainz, Computers, Algorithms, and Boolean Logic · APDR Chapter 2

### Community 12 - "APDR 2 guide: topics"
Cohesion: 0.20
Nodes (11): Algorithm, Boolean expressions, Boolean laws, De Morgan's laws, Logic gates, NAND, Physical circuits, Program language (+3 more)

### Community 13 - "index.js"
Cohesion: 0.05
Nodes (37): ago(), countUp(), foldBoard(), go(), light(), reach(), reroute(), route() (+29 more)

### Community 14 - "APDR 4 lab: floating point"
Cohesion: 0.11
Nodes (29): animate(), arithmeticResult(), arrow(), box(), challenge(), colours(), drawArithmetic(), drawFraction() (+21 more)

### Community 15 - "compile"
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
Nodes (32): arrow(), charge(), COORD(), add(), arc(), axis(), dot(), fit() (+24 more)

### Community 22 - "Concept map"
Cohesion: 0.46
Nodes (7): below(), box(), draw(), pulse(), redraw(), select(), stopPulses()

### Community 25 - "Study Pages project guide"
Cohesion: 0.20
Nodes (13): Electrical Engineering I study cards, Mathematics for Engineers I study cards, Study Pages home page, Active-recall study workflow, Electrical Engineering I, Electrostatic Fields interactive lab, Electrostatic Fields study guide, GitHub Pages hosting (+5 more)

### Community 26 - "APDR 4 formulas"
Cohesion: 0.23
Nodes (10): binaryValue(), classifySingle(), decodeSingle(), float32(), fractionBits(), fractionValue(), normalizedBinary(), scientificOperation() (+2 more)

### Community 27 - "APDR 3 formulas"
Cohesion: 0.26
Nodes (10): columnSubtract(), convert(), decodeInteger(), decodeTwos(), negatePattern(), parseBase(), parseBits(), toBase() (+2 more)

### Community 28 - "APDR 34a lab: integers and floats"
Cohesion: 0.14
Nodes (16): challenge(), colors(), draw(), drawColumns(), drawFields(), drawLine(), x(), mix() (+8 more)

### Community 29 - "MEI 2 lab: real numbers"
Cohesion: 0.16
Nodes (26): binaryDraw(), bindSlider(), boundsDraw(), box(), distanceDraw(), distinct(), guess(), inductionDraw() (+18 more)

### Community 30 - "Project instructions"
Cohesion: 0.67
Nodes (3): Local workflow, Project data, Project instructions

### Community 32 - "APDR 5 lab: memory"
Cohesion: 0.26
Nodes (12): box(), challenge(), colours(), draw(), fit(), hx(), label(), line() (+4 more)

### Community 33 - "check-guide.py"
Cohesion: 0.10
Nodes (14): all_nodes(), answers_of(), check(), check_appendix(), check_exercise(), check_files(), check_lab(), check_smoke() (+6 more)

### Community 34 - "MEI 1 formulas"
Cohesion: 0.18
Nodes (6): complement(), formatInterval(), intersect(), interval(), member(), setOp()

### Community 35 - "MEI 3 lab: mappings"
Cohesion: 0.13
Nodes (35): bindSlider(), compositionDraw(), elementaryDraw(), fmt(), graphDraw(), line(), mappingDraw(), node() (+27 more)

### Community 36 - "Heading effects and reading chip"
Cohesion: 0.23
Nodes (14): decode(), frame(), decodeAll(), fit(), fitAll(), fitFormulas(), glyph(), readout() (+6 more)

### Community 37 - "Lab question and MEI tests"
Cohesion: 0.18
Nodes (6): context(), fake(), loadExperiments(), ROOT, runEngine(), cube

### Community 39 - "MEI 3 formulas"
Cohesion: 0.14
Nodes (4): discriminant(), relationValues(), roots(), squarePreimages()

### Community 40 - "Study guide standard"
Cohesion: 0.18
Nodes (11): Acceptance, Content rules, Decisions, Files, Labs, Page structure, Practice and testing, Principles (+3 more)

### Community 41 - "EEI 2 lab: currents and resistance"
Cohesion: 0.18
Nodes (18): angle(), challenge(), draw(), marker(), text(), fmt(), getControls(), mount() (+10 more)

### Community 45 - "Product"
Cohesion: 0.20
Nodes (10): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Product, Product Principles (+2 more)

### Community 46 - "apdr/ch2-physics.js"
Cohesion: 0.36
Nodes (4): nand(), nandAnd(), nandCircuit(), nandOr()

### Community 47 - "PDF converter core and graph notes"
Cohesion: 0.06
Nodes (38): Decisions, Diagrams, Formulas, Markup, Markup and notation standard, PDF, Signs, amap_data() (+30 more)

### Community 48 - "page-check.sh"
Cohesion: 0.48
Nodes (6): fail(), pass(), PATH, page-check.sh script, skip(), warn()

### Community 49 - "Home page orb"
Cohesion: 0.54
Nodes (7): draw(), frame(), kick(), load(), readColours(), reduced(), token()

### Community 50 - "Tooling standard"
Cohesion: 0.33
Nodes (6): Acceptance, Normal authoring workflow, Source and generated files, Tool changes, Tool roles, Tooling standard

### Community 51 - "Exercise solutions standard"
Cohesion: 0.40
Nodes (5): Acceptance, Exercise solutions standard, Files and source, Learning sequence, Page frame

### Community 52 - "EEI 2 formulas"
Cohesion: 0.12
Nodes (5): Acceptance, EEI Chapter 2 lab: Stationary Currents, Experiments (in chapter order), Scope and files, conductivity()

### Community 53 - "Lab question generator tests"
Cohesion: 0.38
Nodes (5): context(), defsOf(), fake(), labs, ROOT

### Community 56 - "Appendix standard"
Cohesion: 0.67
Nodes (3): Acceptance, Appendix standard, Page

## Knowledge Gaps
- **11 isolated node(s):** `PATH`, `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow`, `Jekyll site CI`, `LaTeX, Pandoc, and KaTeX publishing pipeline` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 350 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `GitHub Pages hosting` (2× useful, score=1.999999899) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lab standard` connect `Lab rules and APDR 12a formulas` to `STANDARDS.md`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `fieldPlayground()` (e.g. with `eei/ch1-lab.js` and `endDrag()`) actually correct?**
  _`fieldPlayground()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PATH`, `Study Pages preview showing Electrical Engineering 1 and Mathematics for Engineers I course cards`, `Active-recall study workflow` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EEI 1 lab: fields and capacitors` be split into smaller, more focused modules?**
  _Cohesion score 0.05303030303030303 - nodes in this community are weakly interconnected._
- **Are the 2 inferred relationships involving `capacitorBench()` (e.g. with `eei/ch1-lab.js` and `resize()`) actually correct?**
  _`capacitorBench()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Site look: design rules` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Are the 5 inferred relationships involving `paint()` (e.g. with `draw()` and `draw()`) actually correct?**
  _`paint()` has 5 INFERRED edges - model-reasoned connections that need verification._