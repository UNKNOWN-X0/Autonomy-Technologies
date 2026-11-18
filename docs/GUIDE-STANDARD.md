# Study guide standard

What "done" means for a study guide on this site: one chapter of one subject, written from the lecture notes, as a web page with a generated PDF. How the maths, signs and diagrams are written is in [MARKUP-STANDARD.md](MARKUP-STANDARD.md); [DESIGN.md](../DESIGN.md) covers the visual system and [PRODUCT.md](../PRODUCT.md) who the site is for.

**Reference guide:** [EEI Chapter 1, Electrostatic Fields](../eei/ch1-electrostatic-fields.html). Copy its structure and markup, not its physics. **Check:** `tools/page-check.sh <subject>/ch<N>-<topic>.html`.

**Sections:** [Principles](#principles) · [Files](#files) · [Page structure](#page-structure) · [Topic sections](#topic-sections) · [Practice](#practice-and-testing) · [Content](#content-rules) · [Labs](#labs) · [Acceptance](#acceptance) · [Updating](#updating-a-guide) · [Decisions](#decisions)

## Principles

Each rule below serves one of these study principles, taken from the ultimate-study skill (Make It Stick, A Mind for Numbers, How to Become a Straight-A Student, The Study Skills Handbook).

| Principle | What it means for a guide |
|---|---|
| Retrieve, don't reread | The guide asks questions before it explains, and every section ends with a recall check whose answers stay hidden until asked. |
| Space it out | The study plan schedules returns on day 1, day 3, about day 7, and about two weeks later. Self-check ticks only count when done on a later day. |
| Mix it up | Practice problems are shuffled across sections, so the student has to choose the method, not just apply the last one read. |
| Calibrate | Every answer names the section to revisit. The self-check ties each skill to concrete problems, so a tick has evidence behind it. |
| Chunk and solve cold | Derivations are listed for rebuilding on blank paper. Worked examples show why each step comes next, and the guide says to attempt problems before looking. |
| Desirable difficulty | Exam-style problems chain several sections under time pressure. Hints reveal one step at a time, not whole solutions. |

## Files

Chapter numbers may include a lowercase letter suffix (for example, `12a` or `34a`); use that label consistently in filenames.

| Item | Rule |
|---|---|
| Location | `<subject>/ch<N>-<topic>.html`, with `<subject>` the lower-case subject code (`eei`, `mei`, `apdr`, `matlab`) and `<topic>` a short kebab-case slug. The `.pdf` and `.tex` sit beside it with the same stem. |
| Storage key | `<body data-key="<subject><course number>-ch<N>">`, for example `eei1-ch1`. Never change it once published, because saved ticks and review days live under it. |
| Subject class | `<body class="s-<subject>-<course number>">`, matching the hub entry. |
| Shared assets | Load `../css/system.css`, `../css/guide.css`, `../js/guide.js` and `../js/tooltip.js`. Add a hover tooltip to any element with a `data-tip` attribute; keep it short and supplementary, never the only place information lives. Put chapter-specific styling into `css/guide.css` only if every guide can use it; there are no per-chapter stylesheets. |
| Hub entry | One `<li class="chapter">` in the subject's list in `index.html`, with `data-key` equal to the guide's key, `data-total` equal to its number of checklist items plus the number of lab experiments, and a link to the guide (and the lab, when there is one). It also carries `data-added="YYYY-MM-DD"`, the day the guide went online, which `js/whatsnew.js` reads for the "Recently added" notice; the checker fails without it. |
| Generated files | The `.tex` and `.pdf` are generated from the HTML by `tools/guide-to-tex.py` and LaTeX. Never edit them by hand. The converter adds a faint diagonal "Made by Thanate Amornjiraporn (Focus)" watermark to every PDF page. |
| Browser test | The workspace smoke suite finds every page under `mei/`, `apdr/` and `eei/` on disk; nothing to register. A page elsewhere needs a row in `BrowserTests/tests/smoke.spec.js`. |

## Page structure

The page contains these blocks in this order. Ids are fixed because the contents rail, the checker and the PDF converter rely on them.

| Order | Block | Id | Required content |
|---|---|---|---|
| 1 | Sign header | — | Subject code, chapter title as `h1`, course line `Subject · Module <number> · Chapter <N>`, empty review meta line. |
| 2 | Standfirst and downloads | — | One or two sentences on what the chapter builds; links to the PDF and the LaTeX source. |
| 3 | Start from memory | `cold-start` | At least 4 prompts the student answers before reading, with short answers hidden in a `details.answers`. |
| 4 | How to use this guide | `plan` | The dated study plan (day 0, 1, 3, about 7, about 14 and before the exam), each step naming the parts of this guide to use; plus the "when stuck" rule. |
| 5 | How the chapter fits together | `route` | A concept map (`div.cmap[data-cmap]`, loaded with `../js/concept-map.js`): the chapter's ideas in three columns (measured, defined, derived), each `li.cm-node` with `data-id`, `data-deps` (the ids it rests on), `data-sec`, a title with its section, a formula, and a `.cm-why` line "Rests on: …" plus the reason. Then a table matching question types to the tool that answers them. Without JavaScript and in the PDF every node shows its "Rests on" line. |
| 6 | Topic sections | `sec-<N><M>` | One per numbered section of the notes (`sec-11` for 1.1, `sec-110` for 1.10), in the notes' order. See [Topic sections](#topic-sections). |
| 7 | Formula map and units | `formula-map` | Every core relation with its SI unit, then a "Check every answer" box covering units, signs and limiting cases. |
| 8 | Derive it cold | `derivations` | The chapter's derivations as a list, each ending with a `sec-ref` to where it is worked. |
| 9 | Explain it | `explain` | At least 6 "why" questions answered aloud, with model answers hidden. |
| 10 | Mixed practice | `practice` | See [Practice and testing](#practice-and-testing). |
| 11 | Exam-style problems | `exam` | At least 2 multi-part problems, each with its own hidden worked answer. |
| 12 | Slips in the notes | `slips` | Only when verified slips exist, headed exactly "Slips in the notes". See [Content rules](#content-rules). |
| 13 | Self-check | `checklist` | See [Practice and testing](#practice-and-testing). |
| 14 | Source note | — | "Personal study guide based on … written in my own words; no lecture pages or figures are reproduced. Not an official FAU publication; check course details against the current notes. Made by <strong>Thanate Amornjiraporn (Focus)</strong>." The lab carries the same note. |

The contents rail (`nav.toc`) lists blocks 4 and 6–13 in the same order, once in the desktop list and once in the mobile `details.mobile-toc`. The two lists must be identical.

## Topic sections

Each topic section is self-contained, and its parts appear in this order:

1. **`h2` with the notes' number and title**, for example `1.9 Voltage`.
2. **Why it matters**, in one or two sentences, connecting to the previous section where possible.
3. **In plain words** (`p.plain`, starting **In plain words:**): two to four sentences with an everyday picture of the idea, before any symbols. Name the new terms in bold here, in words only, so the formula cards that follow put symbols on ideas the student already holds.
4. **Formula cards** (`div.eq`) for every relation the student must know, each with a bold title, the formula and an `eq-note` giving conditions, units or sign conventions. The note of every card that introduces notation starts with a **Read it as** line (`span.say`), saying the formula aloud in words: “the image of f is the set of all f(x) as x runs through X”. A table of relations also counts.
5. **Explanation** in short paragraphs or lists. Where the idea is about how elements of sets are paired (mappings, injective and surjective, inverses, composition), add arrow diagrams (`div.arrows`, one `figure.amap` per case) right after the cards: one case that has the property and one that just fails it, each with a caption naming what to look at. Give every topic that has a picture a picture diagram (`div.figs`) after its card: sets as Venn diagrams, intervals and bounds on a number line, bit patterns as labelled cells, angles on the unit circle, fields as field lines, hierarchies as a ladder. The caption names what to look at; the picture never carries a fact the text does not. When the notes derive a result, show the derivation as numbered steps; it also appears in the derivation list.
6. **At least one worked example** for any section with calculations: numbered steps, numbers carried with units, and a sanity check at the end.
7. **Traps** (`p.method` starting **Trap:**, **Sign check:** or **Memory hook:**) for the mistakes students typically make in this section, and one **Near miss:** an example that almost satisfies the definition or rule and fails, with the reason and the fix.
8. **Recall check** (`div.recall`) as the last block: at least 2 questions about this section only, answered from memory, with one hidden answer per question.

Long sections split into subtopics with `h3`. In the PDF each subtopic moves to the next page whole if it does not fit, so keep each subtopic shorter than a page.

## Practice and testing

| Part | Rule |
|---|---|
| Mixed practice: size | At least 20 problems, and at least one for every topic section with exercisable content. The intro states the number. |
| Mixed practice: order | Interleaved. At most two problems in a row from the same section; a new problem type never comes straight after its worked example. |
| Mixed practice: variety | Mix numeric problems, sign and direction questions, "what happens if" scaling questions, limit and consistency checks, and short conceptual questions. Avoid reusing a worked example's numbers. |
| Mixed practice: answers | One hidden answer per problem, in the same order. Each answer gives the key working (not just the number), states direction or sign where relevant, and ends with a `span.sec-ref` naming the section or sections to revisit. Problems themselves carry no `sec-ref`, because that would give away the method. |
| Numbers | Use the constants stated in the practice intro. Re-derive every answer independently before publishing, and round to three significant figures unless the data justify more. |
| Explain it | Questions start with "Why" or "When" and test understanding, not recall of a formula. Model answers are two or three sentences. |
| Exam-style problems | Each chains at least two sections, has 3–5 parts that build on each other, carries a time budget (about 20 minutes), and its worked answer, in a `details.answers`, has one numbered step per part and names the sections it chains in `span.sec-ref`s. |
| Self-check | One checkbox per skill (about 12–18 per chapter). Each item names the practice problems that prove the skill, as `(3, 18, 29)`, plus one item for the derivation list and one for the exam problems. `data-k` values are short, unique and never renamed. |

## Content rules

- **Source.** The current lecture notes are the authority for scope, notation, sign conventions and symbols. Write in your own words; do not copy text passages, figures or exercise sheets.
- **Going beyond the notes.** A result the notes do not state, such as the field-line refraction rule in EEI 1.11, may be added only when it follows directly from the notes' own relations. Say so in the text: "(This rule follows directly from …; the notes only mention …)".
- **Notation.** Use the notes' symbols (σ<sub>A</sub>, ϱ<sub>V</sub>, φ<sub>e</sub>, <var>U</var><sub>12</sub> = φ<sub>1</sub> − φ<sub>2</sub>). Where the notes are inconsistent, follow the definition and point to the slips list.
- **Slips list.** List only issues checked against the notes, with printed page numbers. Every place where the guide silently corrects the notes gets an entry. Word uncertain ones as uncertain ("probably", "reads as … ; for the next step to follow it must be …"). Distinguish errors from notation clashes. Never list a slip found only by text extraction without checking the rendered page.
- **Honesty.** No invented statistics, exam claims or "this always comes up". The self-check is framed as chapter learning goals, not an exam specification.
- **Language.** Plain, direct English for a first-semester student. Define each symbol on first use, keep sentences short, and prefer "you" for instructions. Use British spelling consistently within a guide.

## Labs

A chapter may have a lab beside its guide: predict-then-reveal experiments built on the shared engine. Labs follow [LAB-STANDARD.md](LAB-STANDARD.md). Two things touch the guide itself: each matching section ends, before its recall check, with a `<p class="lab-link">` to its experiment, and the hub's `data-total` counts the lab's experiments as well as the checklist.

Appendix pages (reference material outside the chapters) follow [APPENDIX-STANDARD.md](APPENDIX-STANDARD.md).

## Acceptance

A guide is done when all of the following hold:

1. `tools/page-check.sh <guide>.html` passes. It runs `tools/check-guide.py` (structure and block order, recall and answer counts, section references, interleaving, contents links, local links, the hub's `data-total`, a current `.tex`, and the Signs rules), regenerates the `.tex` and `.pdf` with a clean LaTeX log (no errors, missing characters or overfull boxes), renders a contact sheet, and probes the page in Chromium and WebKit at 390, 1288 and 1440 px in light and dark. Review every checker warning: each one is fixed or has a reason.
2. Look at the contact sheet: no split boxes, no stranded headings, no page holding only a line or two.
3. Look at the probe screenshots at 390 px in both themes: the recall, worked and answer blocks read well, tables scroll inside their frame, and nothing is cut off. The BrowserTests diagram-label check passes (it runs in `scripts/verify.sh`).
4. Every picture diagram is looked at in the browser and, zoomed in, in the PDF: no label on a line or cut off at an edge, arrowheads sharp, curves smooth.
5. `scripts/verify.sh Education/Autonomy-Technologies` passes from the workspace (tests, scaffold, graph, the smoke tests for this project).
6. Every practice answer, worked example and exam answer has been re-derived independently, and every slip claim has been checked against the rendered notes.

## Updating a guide

- **Notes change** (new term, renumbered sections, corrected formulas): update the affected topic sections, practice answers and slips list, then rerun the acceptance steps. Keep every `data-k` and the storage key unchanged.
- **Adding problems:** append them to the end of the list so existing problem numbers stay valid, then update the count in the intro, the study plan and the self-check references.
- **Adding or removing a checklist item:** update `data-total` in `index.html` in the same change. The checker fails until the two match.

## Decisions

Dated owner decisions that shaped the rules above; the rules themselves carry no dates.

- **2026-11-04:** every topic section opens with an "In plain words" paragraph before any symbols, after the owner found the guides hard to follow without another book.
- **2026-11-11:** quotients are stacked fractions everywhere; see the [markup standard](MARKUP-STANDARD.md#decisions).
