# Project standards

The rules every change to the course site has to meet, and how to check them. Each fact lives in one file:

| File | Owns |
|---|---|
| [PRODUCT.md](PRODUCT.md) | What the site is, who it serves, what it must never claim |
| [DESIGN.md](DESIGN.md) | The visual system: tokens, type, components, motion, named rules |
| **STANDARDS.md** (this file) | Engineering rules, lessons from past mistakes, checks, definition of done |
| [docs/MARKUP-STANDARD.md](docs/MARKUP-STANDARD.md) | How maths, signs, diagrams and structure are written on every page, and the PDF pipeline |
| [docs/GUIDE-STANDARD.md](docs/GUIDE-STANDARD.md) · [docs/LAB-STANDARD.md](docs/LAB-STANDARD.md) · [docs/APPENDIX-STANDARD.md](docs/APPENDIX-STANDARD.md) · [docs/EXERCISE-SOLUTIONS-STANDARD.md](docs/EXERCISE-SOLUTIONS-STANDARD.md) | What a study guide, a lab, an appendix, and a worked-solutions page must contain |
| [docs/TOOLING-STANDARD.md](docs/TOOLING-STANDARD.md) | The authoring and verification tools and how to change them |
| [README.md](README.md) | What a visitor or contributor needs first: what is inside, how to study, how to add a page |
| [AGENTS.md](AGENTS.md) | Agent-only facts: index locations, refresh and test commands, boundaries |

When two files disagree, the owner above wins and the other is fixed. The workspace [Code change](../../STANDARDS.md#code-change-standard) and [Interface change](../../STANDARDS.md#interface-change-standard) standards apply underneath these.

## Invariants

- **The HTML is the single source.** Every `.tex` and `.pdf` is generated from its page by `tools/guide-to-tex.py` and `latexmk`; never edit them by hand, and never commit one you did not regenerate.
- **Static and dependency-free.** Plain HTML, CSS, and classic JavaScript served as files; no build step or package install. Tests run on Node's own runner.
- **Progress stays in the browser.** Checklist progress and settings live in `localStorage` under the page's `data-key`; nothing is sent anywhere.
- **Every page links the site icon** in its `<head>`: `assets/favicon.svg` (SVG), `assets/favicon-32.png` (32px PNG, which Safari uses for the tab) and `assets/apple-touch-icon.png`, with `../` from a subject or `about/` folder. A GitHub Pages project site has no `/favicon.ico` at the domain root, so a page without them shows the browser's blank globe; `tools/check-guide.py` fails a guide, lab, appendix or worked page that misses one. Redraw the icon by editing `assets/favicon.svg` and rendering the PNGs and `favicon.ico` from it.
- **Every student-facing page has a smoke row** in the workspace `BrowserTests/tests/smoke.spec.js` (study pages under `mei/`, `apdr/`, `eei/` are found on disk; anything elsewhere is listed by hand).

## Code

How the hub, the rail, and the labs are built, and what a change must respect.

- **Hub states.** `js/index.js` returns early when nothing is started (`if (!started)`), so a feature every visitor should see is called before that return. A chapter counts as started once its `<key>-log` has a study day. The workspace smoke test "hub renders for a first visit and with progress" loads the hub both ways; a new feature for every visitor adds its own assertion there.
- **Headings and scripts.** `js/hud.js` (loaded by `js/settings.js`) runs after DOMContentLoaded, after `guide.js` and `nav.js` have read heading text. Anything that changes headings or adds UI near them stays outside the `h2` element.
- **Hub route stops.** Route stops are pseudo-elements on each row's `.no` (number), not on the row, so they stay level with the number when a phone row stacks its buttons; `route()` ends the lit stretch on that number too. The lit line is `.subjects::after`, which paints after every child, so anything that must sit on top of it (the `.route-stop` at a subject tile) needs its own `z-index`. A row type added to a subject's panels (like `.part-item`) gets `.no::before` stops in the same selector list as chapters.
- **Hub tabs and folding.** `js/index.js` builds the course-part tabs first, then the subject folds, which fold `.part-panels` (whatever tab is open) and relabel on the `parttab` event. Only subjects with more than one part get tabs. Exercise rows use `li.part-item`, never `li.chapter`: progress, the radar, and the route count every `li.chapter`.
- **Rail Chapters list.** `js/nav.js` reads the hub and builds the list as nested `details`: this page's subject first and open, one fold per kind (`chapter` shows as Lectures, then each `data-tab` kind) with a count, and only the fold holding this page open. Open folds are saved in localStorage `nav-folds` only when the reader toggles them (opening a fold in code fires its own `toggle`, which is skipped), and `reveal()` scrolls the rail or sheet, never the page. A field added to the parsed list needs a new `nav-chapters-<n>` cache key, or old tabs keep the stale shape.
- **Rail instrument.** The readout, stations, reticle, and group counts (`instrument()` in `js/nav.js`) count only the links inside the rail's own `ol` (`stations`): `links` also holds a second copy of the entries elsewhere in the rail, which doubled every count once. The reticle is an `li.rail-lock` appended to that `ol` and placed from `lit()`, so anything that moves an entry (folding, resizing) must call `lit()`.
- **Recently added.** `js/whatsnew.js` (loaded by `js/settings.js`, like `hud.js`) fetches `index.html` itself, never the live hub document, because `js/index.js` rebuilds the exercise links into rows and drops their attributes. It lists every chapter row and hub link with `data-added` from the last 14 days that `whats-new-seen` (localStorage, the hrefs dismissed) does not hold, newest first, five at most (three on a phone). `tools/check-guide.py` fails a page whose hub entry has no `data-added`; set it to the day the page goes online. The lab player in BrowserTests hides the notice, which would otherwise cover controls at phone width.
- **Lab engine in Node.** `tests/` run `js/lab.js` and the lab scripts in a stand-in DOM without timers, so top-level code in them guards browser-only calls (`typeof setTimeout === "function"`) and must not throw when an element is missing.
- **Wrapped controls.** `js/lab.js` wraps each `.controls select` in `span.cselect`, so CSS written as `.field-row > select` or `:has(> select)` must also name `> .cselect`. Lab code keeps reading and setting the hidden native select; set `.value` and the button label follows.
- **One control style.** Control boxes are styled once in the shared block at the end of `css/lab.css`; an older, more specific rule (such as `.controls .own input`) silently wins over it, so delete old box styles instead of adding overrides.
- **Stacked fractions.** Every quotient is a `span.frac`, in running text too ([MARKUP-STANDARD Signs](docs/MARKUP-STANDARD.md#signs)). After writing or changing a page, run `python3 -I tools/stack-fractions.py <page>` (it skips exponents, limits, units, words, and code), stack the function quotients it lists by hand (sin x/cos x, ln x/ln a, tan α₁/tan α₂: the whole function goes into each side), then regenerate the `.tex` and `.pdf`. `tools/check-guide.py` warns about any slash quotient left.

## Graph

- **Community names** in `graphify-out/.graphify_labels.json` are written by hand in plain words ("EEI 1 lab: fields and capacitors"), because the owner reads the graph page. They survive refreshes while a community keeps most of its members; a new or reshaped community falls back to a file or function name. After a refresh, `tools/graph-describe.py` lists every community with no name in that file; name each one there and run `graphify cluster-only .` (no LLM labelling: it would need a paid backend), then `python3 -I tools/graph-describe.py`.
- **Node notes.** `tools/graph-describe.py` gives every node a plain-English note on graph.html (hover and the node panel), from the code comment above it, its name, and a hand-written description of its file; the workspace refresh runs it after each update. When it prints "add a plain description to FILES", add the new file to its `FILES` table; a well-connected node with a vague note gets a line in `OVERRIDES`. A clear comment above a new function is the best source.

## Lessons

- **Stale Safari cache.** When a change the owner reports as missing renders in Playwright WebKit, ask for a reload with ⌘⌥R before debugging further.
- **Measure, do not eyeball.** Sideways overflow and the left and right gaps of measure-capped blocks are measured (the probe reports overflow; gaps from the screenshots), not judged from a thumbnail.

## Checks

In this order, for the parts a change touches:

1. **Page:** `tools/page-check.sh <page>` for every guide, lab, appendix, exercise, or tutorial page changed. It regenerates the `.tex` and `.pdf`, scans the LaTeX log, renders a contact sheet, runs `tools/check-guide.py` (errors and a quotient written with "/" fail; review the warnings), and probes the page in both engines at three widths and two themes. Then look at the contact sheet and the screenshots.
2. **Project:** `scripts/verify.sh Education/Autonomy-Technologies` from the workspace: the tests, scaffold drift, graph freshness, and the smoke tests for this project.
3. **Labs:** after a lab change, the lab player from the workspace `BrowserTests`: `npm run labs` (about 40 minutes for every lab in both engines; `npx playwright test --project labs-chromium --grep <lab file>` for one lab in one engine). Not part of verify.sh.
4. **Graph:** `scripts/refresh-graph.sh --changed` from the workspace after code changes; then the Graph section above.
5. **Hub or shared code** (`js/`, `css/`): probe `index.html` and one guide, one lab and one worked page, because every page shares them.

## Definition of done

- The invariants hold and the change meets the workspace Code change standard; an interface change also meets the Interface change standard.
- Every check above that applies ran, or the report says which did not and why.
- A release that changes what students see adds an entry at the top of `about/version-log.html`, and `about/how-to-use.html` still describes the current features.
- README, PRODUCT, DESIGN, and the `docs/` standards that describe the changed behavior were updated in the same change.
