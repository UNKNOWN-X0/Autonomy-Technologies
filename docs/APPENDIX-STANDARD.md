# Appendix standard

What "done" means for an appendix: reference material that belongs to no chapter, such as a formula collection or a coordinate-system summary, as a web page with a generated PDF. Written under the [markup and notation standard](MARKUP-STANDARD.md); the frame is the worked pages' frame ([exercise solutions standard](EXERCISE-SOLUTIONS-STANDARD.md)).

**Reference page:** [EEI Appendix A, Coordinate systems](../eei/appendix-a-coordinate-systems.html). **Check:** `tools/page-check.sh <subject>/appendix-<letter>-<topic>.html`.

## Page

Reference material that belongs to no chapter, such as a formula collection, goes in an appendix at `<subject>/appendix-<letter>-<topic>.html` (`eei/appendix-a-coordinate-systems.html`). It uses the worked pages' frame (rail with the brand, sign header, downloads, source note; no Guide | Lab switch) and sections `#sec-a1`, `#sec-a2`, … of formula cards, tables and figures under the [markup and notation standard](MARKUP-STANDARD.md). It has no recall checks, practice or hidden answers, so its PDF has no Answers section. Rearrange and explain the source in your own words and redraw its figures; never reproduce its table or pictures. On the hub it is a row in the subject's Appendix tab: `<a href="…" data-added="YYYY-MM-DD" data-no="A" data-note="what it covers">Appendix A: Topic</a>`, with `data-added` the day it went online (read by the "Recently added" notice; the checker fails without it). `tools/check-guide.py` recognises the file name; the workspace smoke suite finds the page on disk.

## Exam sheets

An exam sheet is an appendix built for an exam that allows one sheet of notes, named in order: Exam Sheet I, II, …, at `<subject>/appendix-<letter>-exam-sheet-<roman>.html`. Its PDF is printed from the page by Chromium, not converted to LaTeX, because a dense sheet needs flexible packing and real tables: `node tools/print-sheet.cjs <page> --fit`.

- **Markup.** `<main data-print="sheet">`; one `section.sheet-side` per printed side (`#sec-b1`, `#sec-b2`, …) with an `h2`, an optional `p.sheet-meta` line and a `div.sheet-cards` of cards; each card is a `div.eq.sheet-card` with a bold title first, then formula lines, short paragraphs, lists or ruled tables (`div.tw > table`). The source note sits inside the last side, under its heading. The page loads `../css/sheet.css` after `guide.css`, and the condensed print face (IBM Plex Sans Condensed) from Google Fonts. The only download is the PDF; there is no `.tex`.
- **Layout.** `css/sheet.css` flows the cards in responsive columns on screen; in print every side is one A4 page in four ruled columns with equal 4 mm margins and 3 mm column gaps, and its type size is the `--pt` value in the side's `style` attribute.
- **Keep related material together.** Cards do not split across columns; divide long topics into coherent formula families. Lists keep their markers inside the column, clear of its rule.
- **Fill each side.** `--fit` finds, for each side, the largest size in 0.05 pt steps at which its cards still fit, and writes it into the HTML; without `--fit` the tool fails when a side overflows. The PDF must have exactly one page per side. Content decides the size: if a side drops below about 6.5 pt, cut or move material rather than print smaller.
- **Content.** Side 1 is the rules, side 2 the question types and reusable solving methods, with conditions and checks. Every rule in the fewest words that still say it correctly, with the condition that makes it true (a ≠ 0, x ≥ −1, both sides ≥ 0); one formula per formula line.
- **Print extras.** Each side carries the same faint diagonal author watermark as the other PDFs. A sourced quote may use spare column space, in a print-only `figure.sheet-quote`, without displacing study content onto another page.
- **Check by looking.** `tools/page-check.sh` prints the PDF, renders a contact sheet and runs the checker and probe; then read both sides at 100 % zoom: no stranded card titles, no clipped tables, every fraction legible.

## Acceptance

1. `tools/page-check.sh <page>` passes: the checker exits 0 with every warning reviewed, the `.tex` and `.pdf` are regenerated with a clean LaTeX log, and the probe reports every engine, width and theme clean.
2. Look at the contact sheet (no split boxes, no stranded headings) and the probe screenshots (tables scroll inside their frame; figures sit inside the measure), and zoom into each figure in the PDF.
3. Every formula and figure was checked against the source and redrawn, not reproduced.
