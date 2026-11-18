# Appendix standard

What "done" means for an appendix: reference material that belongs to no chapter, such as a formula collection or a coordinate-system summary, as a web page with a generated PDF. Written under the [markup and notation standard](MARKUP-STANDARD.md); the frame is the worked pages' frame ([exercise solutions standard](EXERCISE-SOLUTIONS-STANDARD.md)).

**Reference page:** [EEI Appendix A, Coordinate systems](../eei/appendix-a-coordinate-systems.html). **Check:** `tools/page-check.sh <subject>/appendix-<letter>-<topic>.html`.

## Page

Reference material that belongs to no chapter, such as a formula collection, goes in an appendix at `<subject>/appendix-<letter>-<topic>.html` (`eei/appendix-a-coordinate-systems.html`). It uses the worked pages' frame (rail with the brand, sign header, downloads, source note; no Guide | Lab switch) and sections `#sec-a1`, `#sec-a2`, … of formula cards, tables and figures under the [markup and notation standard](MARKUP-STANDARD.md). It has no recall checks, practice or hidden answers, so its PDF has no Answers section. Rearrange and explain the source in your own words and redraw its figures; never reproduce its table or pictures. On the hub it is a row in the subject's Appendix tab: `<a href="…" data-added="YYYY-MM-DD" data-no="A" data-note="what it covers">Appendix A: Topic</a>`, with `data-added` the day it went online (read by the "Recently added" notice; the checker fails without it). `tools/check-guide.py` recognises the file name; the workspace smoke suite finds the page on disk.

## Exam sheets

An exam sheet is an appendix built for an exam that allows one sheet of notes: <main data-print="sheet"> makes `tools/guide-to-tex.py` set the PDF as two dense A4 sides instead of the guide layout (5 mm margins, ruled columns, no title page, contents or running header; the watermark stays). Each `section.sheet-side` (`#sec-b1`, `#sec-b2`, …) is one side, with its type size in `data-pt` and its columns in `data-cols` (default 4); each `div.eq` in it is one card: a bold title, then formula lines, short paragraphs, lists or small tables. The source note becomes one small line under the last side's rule.

- **Fill each side.** Raise `data-pt` until one more step pushes a side onto an extra page, then keep the largest size that fits: the PDF must stay exactly as many pages as there are sides.
- **One formula per line.** Two relations on one `span.formula` wrap mid-formula in a narrow column; give each its own line.
- **Simplest true wording.** Every rule in the fewest words that still say it correctly, with the condition that makes it true (a ≠ 0, x ≥ −1, both sides ≥ 0).
- **Check by printing.** Look at both sides at 100 % zoom: no stranded card titles (the converter keeps a title with its first lines), no clipped tables, every fraction legible.

## Acceptance

1. `tools/page-check.sh <page>` passes: the checker exits 0 with every warning reviewed, the `.tex` and `.pdf` are regenerated with a clean LaTeX log, and the probe reports every engine, width and theme clean.
2. Look at the contact sheet (no split boxes, no stranded headings) and the probe screenshots (tables scroll inside their frame; figures sit inside the measure), and zoom into each figure in the PDF.
3. Every formula and figure was checked against the source and redrawn, not reproduced.
