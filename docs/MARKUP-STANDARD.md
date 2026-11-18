# Markup and notation standard

The one way to write maths, signs, diagrams and structure on every page of this site: guides, labs, appendices, worked solutions and tutorials. The page and the PDF then draw each thing the same way, and `tools/check-guide.py` warns where a page strays. The page standards ([guide](GUIDE-STANDARD.md), [lab](LAB-STANDARD.md), [appendix](APPENDIX-STANDARD.md), [worked solutions](EXERCISE-SOLUTIONS-STANDARD.md)) say what a page contains; this file says how it is written.

**Reference page:** [EEI Chapter 1, Electrostatic Fields](../eei/ch1-electrostatic-fields.html). **Check:** `tools/page-check.sh <page>` (runs the checker, regenerates the print copy, probes the page).

**Sections:** [Markup](#markup) · [Formulas](#formulas) · [Signs](#signs) · [Diagrams](#diagrams) · [PDF](#pdf) · [Decisions](#decisions)

## Markup

The PDF converter understands only this markup, so use it for all maths and structure:

| Purpose | Markup |
|---|---|
| Variable | `<var>E</var>`; vectors are plain variables in this course's HTML |
| Index, power | `<sub>…</sub>`, `<sup>…</sup>` (no Unicode superscript digits) |
| Fraction | `<span class="frac"><span>numerator</span><span>denominator</span></span>` |
| Square root | `<span class="sqrt"><span class="root">√</span><span class="rad">x<sup>2</sup> + y<sup>2</sup></span></span>`: the sign stretches to its radicand and a bar runs over all of it, so no brackets mark the extent. Used for every root, in running text too |
| Sum, product | `<span class="op op-sum"><span class="op-sym">∑</span><sub>k=1</sub><sup>n</sup></span>` (∏ for products, ⋃ and ⋂ for indexed unions and intersections). The site stacks the top limit, sign and bottom limit; the PDF typesets `\sum`/`\prod` |
| Integral | `<span class="op op-int"><span class="op-sym">∫</span><sub>a</sub><sup>b</sup></span>` (also ∮, ∬, ∯, ∭). The page draws one thin, slanted sign for all of them, with the upper limit beside its top end and the lower limit beside its bottom end; a closed-path or surface integral may carry only `<sub>`. Used for every sign, in running text too |
| Formula card | `<div class="eq"><strong>Title</strong><span class="formula">…</span><span class="eq-note">…</span></div>`, with one `span.formula` per relation |
| Worked example, recall check | `<div class="worked">` or `<div class="recall">`, first child `<p class="worked-title">` or `<p class="recall-title">` |
| Hidden answers | `<details class="answers"><summary>…</summary><ol>…</ol></details>` |
| Note, trap, hook, near miss | `<p class="method"><strong>Trap:</strong> …</p>` (also **Near miss:**) |
| In plain words | `<p class="plain"><strong>In plain words:</strong> …</p>` right after `p.why`; the PDF sets it in a ruled box |
| Read it as | `<span class="eq-note"><span class="say">Read it as: “…”.</span> rest of the note</span>` |
| Arrow diagram | `<div class="arrows"><figure class="amap" data-sets="X: 1, 2, 3 \| Y: a, b, c" data-map="1>a 2>b 3>c"><figcaption><strong>Bijective.</strong> …</figcaption></figure>…</div>`. `|` separates sets and the arrow groups between them (three sets for a composition); `data-rev` draws the arrows backwards for an inverse. `js/guide.js` draws it, `tools/guide-to-tex.py` draws the same data in TikZ; an input without exactly one arrow and an output reached twice are highlighted, an output never reached is greyed |
| Picture diagram | `<div class="figs"><figure class="viz" data-kind="…" …><figcaption><strong>Name.</strong> what to look at</figcaption></figure>…</div>`, right after the card it illustrates. Kinds: `venn` (`data-shade` = union, inter, diff, comp, a or b; `data-labels="A B X"`), `numline` (`data-range="lo hi"`, `data-ticks="0 1 2"` or `"1.57:π/2"`, `data-seg="lo hi ends"` with ends `o` open or `c` closed and `-inf`/`inf` for rays, `data-marks="v:label;…"`, `data-dots="-2 0 1"` for the filled points of a finite set), `bits` (`data-cells="inside\|below\|width\|above;…"`, a leading `*` marks a cell), `circle` (`data-angle` in degrees, `data-labels="horizontal\|vertical\|radius\|angle"`), `field point+` or `field point-` (optional `data-extra` = equipot or surface), `field plates`, `field slab`, `field pair` (`data-signs="+ -"`), `field vectors`, `field dipole` (lines traced from E), `shape cylinder`, `shape hemisphere`, `shape loop`, `shape axis-pair`, `shape diamond`, `shape charged-sphere`, `shape coax-cap`, `shape halfspace-line`, `shape coax-layered` (exercise geometry), `plot` (`data-xr`, `data-yr`, `data-lines="x,y x,y;…"` with the first line in the action colour, `data-shade`, `data-marks="x,y:label"` (add `:e`, `:w`, `:nw`, `:se` … to dot the point and set the label on that side, clear of the curve), `data-xticks="1 2"` or `"1:Q"` (`"1:1:r"` sets the label right of a vertical line through the tick), `data-xlabel`, `data-ylabel`; a line of four or more points is drawn as a smooth curve through them, so sample steep stretches densely), `nest` (`data-rings="ℕ: 2|ℤ: −3|…"`, innermost first), `flow` (`data-steps="Title / detail|…"`; on screens under 560px it is drawn as a stack), `pascal` (`data-rows`, `data-sum="r:k"`), `wave` (`data-signals="label:0011…;…"`, `data-mark` slot), `kmap` (`data-cells="0 0 1 1 / …"`, `data-groups="r0-1,c2-3;…"`, a column range may wrap), `wheel` (`data-bits`, `data-from`, `data-to`), `cells` (`data-cells="name\|address\|value;…"`, `data-arrows="p>x"`), venn shades `nor`, `nand`, `imp`, and `ladder` (`data-levels="top;…;bottom"`, `data-top`, `data-bottom`), `coord cyl`, `coord sph`, `coord box`, `coord disp`, `coord hollow` (fixed 3D views: a point in cylindrical or spherical coordinates with its unit vectors and area patch, the Cartesian volume element, two points and their displacement, a hollow cylinder; they take a wider column), and `scene` for any other flat drawing of a setup (`data-scene`: items such as `axis`, `tick`, `rect`, `sector`, `charge`, `wire`, `cap`, `dim` and `label` with a named side, listed in `js/guide.js`; a `path` with a line style draws the line, and with `fill` it shades the closed region, so a solution set in the plane is the tinted region with its boundary drawn dashed where it is excluded; list the shaded `path` first so lines and labels sit on top). Draw a physical arrangement with `scene` or a 3D view, never with `plot`, which is for graphs (a graph with a kink or a jump is a `scene` of `path` pieces with `axis` and `tick`, because `plot` smooths any line of four or more points), and never mark an answer the task asks the reader to find. `js/guide.js` and `tools/guide-to-tex.py` draw them from the same coordinates. In drawn labels, `e_z` or `e_{ρ0}` sets a subscript. Keep every label off lines, curves and ring edges and inside the picture; where one must cross a line, give it the `vz-halo` class (a `halo` in the PDF's `T()`). The BrowserTests check "study-guide diagram labels stay clear" enforces this |
| Table | `<div class="tw"><table>…</table></div>` with a `thead` row |
| Section reference | `<span class="sec-ref">§1.4</span>` |

## Formulas

Write formulas so they read as maths at a glance:

- **One relation per line.** Give each relation its own `span.formula`; do not chain them with semicolons or `, &nbsp;`. A connected statement ("∮ <var>E</var> · d<var>s</var> = 0 and therefore …") stays on one line.
- **Variables in `<var>`.** Mark every variable, including single letters in sub- and superscripts (<var>a</var><sub><var>k</var></sub>) and each letter of a product (<var>x</var><var>y</var>). Function names (sin, ln, log, Im), units (C, V, m, A s), roman numerals, words, hyphenated labels ("Excess-B") and code stay upright.
- **Space the relations.** Put a space either side of =, ≠, ≈, ≤, ≥, <, >, ⇒ and ⇔ at the top level of a formula. Keep limits and indices tight: <sub>k=1</sub>.
- **Space the operators in a formula card too.** In a `span.formula`, put a space either side of top-level +, −, · and × and around an ellipsis: <var>a</var><sub><var>m</var></sub> + … + <var>a</var><sub><var>n</var></sub>, never <var>a</var><sub><var>m</var></sub>+…+<var>a</var><sub><var>n</var></sub>. Inline prose such as “1+2+…+n” may stay compact. After the edit, regenerate the `.tex` and `.pdf`.
- **Stacked fractions everywhere.** Write every quotient as `span.frac` (numerator over denominator), in a `span.formula`, a worked step's `p.math-line` and running text alike; in running text it is set at 0.9 of the text size, so it opens the line only a little. The numerator is the product before the slash and the denominator the single term after it, and brackets that only grouped one side go. Keep “/” only inside exponents and limits (<var>e</var><sup>−<var>t</var>/τ</sup>, ∫ from 0 to π/2), in units (m/s, V/m), between words (and/or) and in code. A function written with a space (sin <var>x</var>/cos <var>x</var>, ln <var>x</var>/ln <var>a</var>) takes the whole function into each side. Write a log of a ratio over a constant as (1/ε) ln(<var>a</var>/<var>b</var>) stacked piece by piece, not as a fraction inside a fraction. Mark a ( ) or [ ] pair that encloses a stacked fraction in a display line with `span.delim` so it grows on screen; the PDF converter grows it with `\left`/`\right` by itself. `python3 -I tools/stack-fractions.py <page>` converts what is left and lists any function quotient to do by hand; `tools/check-guide.py` warns about every one still written with “/”.
- **One integral sign everywhere.** Every ∫, ∮, ∬, ∯ and ∭, in formula cards, worked lines, tables, notes and running text alike, uses the integral markup, even without limits: `<span class="op op-int"><span class="op-sym">∫</span><sub>a</sub><sup>b</sup></span>`. Never type a bare sign or put its limits in a loose `<sub>`/`<sup>` after it. The page then draws one thin, slanted sign (tall in display lines, shorter in running text) with the upper limit beside its top end and the lower limit beside its bottom end, as in print; the PDF sets `\int_a^b` the same way. `tools/check-guide.py` warns about any bare sign.
- **Every sum and integral states its limits** unless the range is genuinely implicit (a closed path ∮). Write ∑<sub>i=0</sub><sup>k</sup> <var>d</var><sub><var>i</var></sub><var>b</var><sup><var>i</var></sup>, never a bare Σ <var>d</var><sub><var>i</var></sub><var>b</var><sup><var>i</var></sup>. Use the n-ary signs ∑ and ∏ for operators, not the Greek letters Σ and Π. Minterm notation Σm(…) is a name, not an operator, and stays as written.
- **Diagrams read cleanly.** Every label in a picture diagram sits inside the picture, off every line, curve, arrow and ring edge, and clear of other labels: put it in an empty band or beside what it names, not on it. Where a label must cross a line (a radius on a ring edge, a long label under a circle), give it `vz-halo` on the page and `halo=True` in the PDF's `T()`. Name what a label marks: a dot at a point on a curve (a plot mark with a side, `:e`, `:nw`), a tick on a radius ruler. Write unit vectors and indexed symbols with a real subscript (`e_ρ`, `ρ_0`), never with a visible underscore. Arrows come from `arrow()`, whose head grows with the line, so a thick shaft never shows past its tip. Sample a curve densely where it bends sharply; four or more points are drawn smooth. Change a figure in `js/guide.js` and `tools/guide-to-tex.py` together, at the same coordinates.
- **Code is not a formula.** C or MATLAB lines in a card keep their own spelling and are never italicised or respaced.

Use real Unicode symbols (−, ×, ·, ≈, ε, ∫, ∮, ∯) rather than ASCII stand-ins. Do not use KaTeX, MathJax, images of formulas or external scripts. Formulas must read correctly with JavaScript off and in print.

## Signs


Every sign has one way to be written. The page and the PDF then draw it the same way everywhere, and `tools/check-guide.py` warns where a page strays (the last column), and `tools/page-check.sh` runs it with the rest of a page's checks. Code in a card (C, MATLAB, Python) is not maths: it keeps its own characters, including `*`, `'` and `-`.

| Sign | Write | Page and PDF show | Never | Checked |
|---|---|---|---|---|
| Integral ∫ ∮ ∬ ∯ ∭ | `op op-int` markup (above), limits as its `<sub>`/`<sup>` | one thin, slanted sign; limits beside its top and bottom ends; `\int_a^b` in the PDF | a bare sign; limits in a loose `<sub>` after it | yes |
| Sum, product ∑ ∏; big union, intersection ⋃ ⋂ | `op op-sum` markup, limits as its `<sub>`/`<sup>` | limits stacked over and under the sign | Σ or Π (Greek letters) as operators | yes |
| Square root √ | `sqrt` markup (above) | a sign joined to a bar over the whole radicand; `\sqrt{…}` in the PDF | a bare √; √(…) with brackets standing in for the bar | yes |
| Fraction | `span.frac` everywhere a quotient is written: formula cards, worked lines and running text; `a/b` only inside exponents and limits | numerator over denominator; in running text at 0.9 of the text size; `\dfrac` in the PDF (`\small` in running text) | `/` for a quotient outside an exponent or limit | yes; `tools/page-check.sh` fails on it |
| Brackets round a stacked fraction | `<span class="delim">(</span>` … `<span class="delim">)</span>` in worked lines | brackets as tall as the fraction; `\left( … \right)` in the PDF | — | — |
| Minus − and ± ∓ | U+2212 (−), U+00B1, U+2213 | — | a hyphen `-` as minus | yes, between numbers or brackets |
| Products · and × | `·` for a product and the dot product; `×` for the cross product, a Cartesian product and powers of ten (2.5 × 10<sup>3</sup>) | — | `*` or the letter x | yes, `*` outside code |
| Relations = ≠ ≈ < > ≤ ≥, arrows → ⇒ ⇔ ↦ ↔ | the Unicode sign, a space either side at the top level | — | `<=`, `>=`, `!=`, `->`, `=>` | yes |
| Prime ′ (complement, derivative) | U+2032, as in <var>x</var>′ and (<var>A</var> · <var>B</var>)′ | ′ in text, `'` in PDF maths | a straight apostrophe `'` | yes, in formulas |
| Index, power | `<sub>`, `<sup>`; in figure data and drawn labels, `x_{12}` or `e_ρ` | real sub- and superscripts | Unicode subscript digits ₀–₉ (the PDF font has none) or ⁴–⁹ | yes, subscript digits |
| Unit vector | `<var>e</var><sub>ρ</sub>`; `e_ρ` in figure labels | italic e with an upright index | `e_ρ` typed into text | — |
| Complex quantity (EEI notation) | `<u><var>x</var></u>`; the imaginary unit j upright, without `<var>` | an underlined italic letter; `\underline{…}` in the PDF | a combining underline character | — |
| Parallel ∥, much greater ≫ | the Unicode sign: <var>R</var><sub>1</sub> ∥ <var>R</var><sub>2</sub>, <var>R</var><sub>L</sub> ≫ <var>R</var><sub>i</sub> | `\parallel`, `\gg` in the PDF | `\|\|` or `>>` | — |
| Absolute value, length | `\|<var>x</var>\|`, `\|<var>r</var>\|` (vertical bars) | — | `abs(x)` | — |
| Infinity ∞, partial ∂, degree ° | the Unicode sign | — | `inf`, `d/dx` for a partial | — |
| Sets ∈ ∉ ⊆ ⊂ ∪ ∩ ∅ ℕ ℤ ℚ ℝ; logic ∧ ∨ ¬ ⊕ | the Unicode sign | — | `in`, `&&`, `!` outside code | — |

When a new sign needs markup of its own, add it here, teach `tools/guide-to-tex.py` the same markup, and add a check where a wrong form is easy to type.

## Diagrams

The picture diagram kinds and their data attributes are in the Markup table above (`figure.viz`, `figure.amap`). Rules that hold for every picture:

- `js/guide.js` draws it on the page and `tools/guide-to-tex.py` draws the same data in the PDF; change a kind in both, at the same coordinates.
- Every label sits inside the picture, off every line, curve, arrow and ring edge, and clear of other labels; a label that must cross a line carries `vz-halo` on the page and `halo=True` in the PDF. The BrowserTests check "study-guide diagram labels stay clear of lines and each other" enforces this on every study page.
- The caption names what to look at. A picture never carries a fact the text does not, and never marks an answer the reader is asked to find.
- A physical arrangement is a `scene` or a fixed 3D view, never a `plot`; a graph with a kink or a jump is a `scene` of `path` pieces, because `plot` smooths four or more points.

## PDF

Generate the PDF; never hand-edit it or its `.tex`:

```sh
python3 -I tools/guide-to-tex.py eei/ch1-electrostatic-fields.html eei/ch1-electrostatic-fields.tex
cd eei && latexmk -xelatex ch1-electrostatic-fields.tex && latexmk -c ch1-electrostatic-fields.tex
```

The converter guarantees:
- All hidden answers move to an Answers section at the end, grouped by origin.
- Boxes, short lists, tables and headings never split across pages.
- A section that fits on a page is never split, and longer sections break only between `h3` subtopics.

It needs TeX Live with the New Computer Modern fonts, `environ` and `tcolorbox`.

`tools/page-check.sh <page>` runs the two commands above, scans the LaTeX log for errors, missing characters and overfull boxes, and renders a contact sheet of every page at 40 dpi for the layout look.

## Decisions

Dated owner decisions that shaped the rules above; the rules themselves carry no dates.

- **2026-11-11:** every quotient is a stacked fraction, in running text too ("easier to read" than a slash). The fraction row of the Signs table and the Formulas rule follow from this.
