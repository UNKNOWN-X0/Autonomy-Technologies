# Appendix standard

What "done" means for an appendix: reference material that belongs to no chapter, such as a formula collection or a coordinate-system summary, as a web page with a generated PDF. Written under the [markup and notation standard](MARKUP-STANDARD.md); the frame is the worked pages' frame ([exercise solutions standard](EXERCISE-SOLUTIONS-STANDARD.md)).

**Reference page:** [EEI Appendix A, Coordinate systems](../eei/appendix-a-coordinate-systems.html). **Check:** `tools/page-check.sh <subject>/appendix-<letter>-<topic>.html`.

## Page

Reference material that belongs to no chapter, such as a formula collection, goes in an appendix at `<subject>/appendix-<letter>-<topic>.html` (`eei/appendix-a-coordinate-systems.html`). It uses the worked pages' frame (rail with the brand, sign header, downloads, source note; no Guide | Lab switch) and sections `#sec-a1`, `#sec-a2`, … of formula cards, tables and figures under the [markup and notation standard](MARKUP-STANDARD.md). It has no recall checks, practice or hidden answers, so its PDF has no Answers section. Rearrange and explain the source in your own words and redraw its figures; never reproduce its table or pictures. On the hub it is a row in the subject's Appendix tab: `<a href="…" data-added="YYYY-MM-DD" data-no="A" data-note="what it covers">Appendix A: Topic</a>`, with `data-added` the day it went online (read by the "Recently added" notice; the checker fails without it). `tools/check-guide.py` recognises the file name; the workspace smoke suite finds the page on disk.

## Acceptance

1. `tools/page-check.sh <page>` passes: the checker exits 0 with every warning reviewed, the `.tex` and `.pdf` are regenerated with a clean LaTeX log, and the probe reports every engine, width and theme clean.
2. Look at the contact sheet (no split boxes, no stranded headings) and the probe screenshots (tables scroll inside their frame; figures sit inside the measure), and zoom into each figure in the PDF.
3. Every formula and figure was checked against the source and redrawn, not reproduced.
