# Tooling standard

This standard describes the authoring and verification tools for the AutonomyTechnologies course site. It complements the content standards: [markup](MARKUP-STANDARD.md), [guide](GUIDE-STANDARD.md), [lab](LAB-STANDARD.md), [appendix](APPENDIX-STANDARD.md), and [worked solutions](EXERCISE-SOLUTIONS-STANDARD.md).

## Tool roles

| Tool | Role | Inputs and outputs |
|---|---|---|
| `tools/page-check.sh` | Run a page's whole acceptance pipeline | Regenerates the `.tex` and `.pdf` from the HTML, scans the LaTeX log, renders a contact sheet, runs the checker (errors and a quotient written with "/" fail), and runs the workspace probe. Prints PASS/FAIL/SKIP; `--no-pdf` and `--no-probe` skip steps. It is the one explicit generation command; the checker itself stays read-only. |
| `tools/guide-to-tex.py` | Convert a course page to printable LaTeX | Reads one HTML source and writes one `.tex` file at the explicit destination. Appendix equation cards can include a local raster image with its caption; LaTeX resolves the image path from the subject folder. The HTML remains authoritative. |
| `latexmk -xelatex` | Build the printable copy | Reads the generated `.tex` and writes the `.pdf`; run from the subject folder so relative assets resolve. |
| `tools/stack-fractions.py` | Turn quotients written with “/” into stacked fractions | Rewrites the named pages in place (`--list` only shows the changes) and lists function quotients such as sin x/cos x to convert by hand; regenerate the `.tex` and `.pdf` afterwards. |
| `tools/print-sheet.cjs` | Print an exam sheet (`<main data-print="sheet">`) to its A4 PDF with Chromium | `node tools/print-sheet.cjs <page> [--fit]`: `--fit` writes the largest fitting `--pt` per side into the page; fails when a side overflows or the PDF has more pages than sides. Uses the workspace BrowserTests Playwright install; `tools/page-check.sh` runs it for sheet pages. |
| `tools/check-guide.py` | Validate a guide, lab, appendix, exercise, or tutorial page against the applicable standard | Reads the page and linked project files; prints errors and warnings. Exit 0 means no errors; warnings still need review. |
| `node --test` | Check pure subject calculations, lab challenge data, and generators | Reads the `tests/` suite and shared JavaScript modules; makes no site build output. |
| BrowserTests smoke suite | Check static routes and shared browser behaviors | Lives in the workspace `BrowserTests/`; it finds every page under `mei/`, `apdr/` and `eei/` on disk, and `scripts/verify.sh Education/Autonomy-Technologies` runs this project's subset. |
| BrowserTests probe (`npm run probe -- <page>`) | The Interface change standard matrix for one page | Chromium and WebKit at 390, 1288 and 1440 px, light and dark; overflow and errors per combination; screenshots in the session scratchpad. `page-check.sh` runs it. |

The tools are local authoring and verification helpers. The published site is static HTML, CSS, JavaScript, and generated PDFs; `tools/` is not loaded by the site. GitHub Pages serves the static files as they are (`.nojekyll`). The CI workflow (`.github/workflows/checks.yml`) runs the unit tests and the page checker without the PDF-age checks; it does not replace the local `tools/page-check.sh` run or the browser checks.

## Source and generated files

- Edit HTML as the single source for guides, labs, appendices, exercises, and tutorials. Never hand-edit generated `.tex` or `.pdf` files.
- Keep generated `.tex` and `.pdf` beside their HTML source with the same stem. Regenerate both whenever the source changes.
- Shared figure markup and math conversions must render consistently in `js/guide.js` and `tools/guide-to-tex.py`; update both renderers when changing a shared diagram or notation.
- Keep converter and checker behavior aligned with the page types and markup described by the content standards. A rule that can be checked reliably belongs in `tools/check-guide.py`; subjective content review remains a human acceptance step.
- Do not add a dependency for a small helper. Prefer the Python standard library and existing project or workspace tools. If a new runtime dependency is necessary, document its purpose and exact local setup in `README.md` and record the setup change in the workspace log.

## Normal authoring workflow

From the repository root, one command runs the pipeline for a page:

```sh
tools/page-check.sh eei/ch1-electrostatic-fields.html
```

It is the same as running these by hand:

```sh
python3 -I tools/guide-to-tex.py eei/ch1-electrostatic-fields.html eei/ch1-electrostatic-fields.tex
(cd eei && latexmk -xelatex ch1-electrostatic-fields.tex && latexmk -c ch1-electrostatic-fields.tex)
python3 -I tools/check-guide.py eei/ch1-electrostatic-fields.html
```

Use the matching subject path and filename for the page being changed. For a batch, enumerate only intended source pages and skip `*-lab.html`; do not rebuild unrelated outputs. Then run the checks required by that page's content standard, such as `node --test`, BrowserTests, and the workspace graph refresh after code changes.

## Tool changes

Before changing a tool, identify every page type and caller it serves. Preserve existing source files and unrelated working-tree changes. Make the smallest change that keeps the tool's input/output contract stable.

- Converter changes must preserve HTML source authority, explicit source/destination paths, UTF-8 handling, page structure, answers handling, and supported figure/math rendering. Appendix card images must resolve from the subject folder and stay within the text measure. Keep rendered geometry in step with the browser renderer.
- Checker changes must report the affected page clearly, distinguish errors from warnings, and fail with a nonzero exit only for errors. Add checks only when the required fact is deterministic from repository files.
- A new tool must have a clear purpose, documented invocation, bounded inputs and outputs, useful failure messages, and one focused self-check or test when its logic is non-trivial.
- Do not make a checker silently rewrite pages or generated files. Keep validation read-only; make generation an explicit command.

## Acceptance

1. The relevant page checker exits 0 and every warning has been reviewed.
2. Generated TeX is current with the HTML, and the PDF builds without LaTeX errors or missing-character messages.
3. The PDF is visually inspected when the page's content standard requires it; a successful compiler exit alone does not verify layout.
4. Required page tests and browser checks pass as specified in the relevant content standard.
5. The final diff contains only intended tool, documentation, and generated-file changes; existing user edits remain intact.
