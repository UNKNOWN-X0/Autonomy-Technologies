#!/bin/bash
# One command for a page's acceptance: the authoring pipeline and every check a script can run.
#   tools/page-check.sh <subject>/<page>.html [--no-pdf] [--no-probe]
# For a guide, appendix, exercise or tutorial page it regenerates the .tex and .pdf from the HTML (the HTML is
# the single source), scans the LaTeX log, renders a contact sheet of the PDF pages, runs tools/check-guide.py
# (which fails on errors; a quotient still written with "/" also fails here), then the workspace browser probe.
# For a lab page it checks the lab through its guide and probes the lab. Prints PASS/FAIL/SKIP; exit 1 on any FAIL.
# Afterwards, look at the contact sheet and the probe screenshots: layout is judged by eye, not by exit code.
set -u
cd "$(dirname "$0")/.." || exit 1
export PATH="$HOME/.nvm/versions/node/v22.23.4/bin:/Library/TeX/texbin:$PATH"
fails=0
pass() { printf "PASS  %s\n" "$1"; }
warn() { printf "WARN  %s\n" "$1"; }
skip() { printf "SKIP  %s\n" "$1"; }
fail() { printf "FAIL  %s\n" "$1"; fails=$((fails + 1)); }

pdf=1; probe=1; page=""
for a in "$@"; do
  case "$a" in
    --no-pdf) pdf=0 ;;
    --no-probe) probe=0 ;;
    -*) echo "unknown option: $a" >&2; exit 2 ;;
    *) page=${a#./} ;;
  esac
done
[ -n "$page" ] && [ -f "$page" ] || { echo "usage: tools/page-check.sh <subject>/<page>.html [--no-pdf] [--no-probe]" >&2; exit 2; }
out=${CLAUDE_SCRATCHPAD:-${TMPDIR:-/tmp}}/page-check/${page%.html}; case "$out" in /*) ;; *) out=$PWD/$out ;; esac
mkdir -p "$out"
echo "== $page"

case "$page" in
  *-lab.html)
    guide=${page%-lab.html}.html
    [ -f "$guide" ] || { fail "lab has no guide beside it ($guide)"; exit 1; }
    skip "pdf: labs have no print copy"
    checked=$guide ;;
  *)
    checked=$page
    if [ $pdf = 1 ]; then
      dir=$(dirname "$page"); stem=$(basename "${page%.html}")
      if python3 -I tools/guide-to-tex.py "$page" "${page%.html}.tex" >"$out/convert.log" 2>&1; then
        pass "tex: regenerated ${page%.html}.tex"
      else fail "tex: converter failed (see $out/convert.log)"; fi
      if (cd "$dir" && latexmk -xelatex -interaction=nonstopmode -halt-on-error "$stem.tex" >"$out/latexmk.log" 2>&1); then
        log="$dir/$stem.log"
        errs=$(grep -c '^!' "$log" 2>/dev/null); miss=$(grep -c 'Missing character' "$log" 2>/dev/null); over=$(grep -c 'Overfull \\hbox' "$log" 2>/dev/null)
        cp "$log" "$out/xelatex.log" 2>/dev/null
        [ "${errs:-0}" = 0 ] && [ "${miss:-0}" = 0 ] && pass "pdf: built, no LaTeX errors or missing characters" \
          || fail "pdf: $errs error(s), $miss missing character line(s) (see $out/xelatex.log)"
        [ "${over:-0}" = 0 ] && pass "pdf: no overfull boxes" || warn "pdf: $over overfull box(es); look at those pages on the contact sheet (grep Overfull $out/xelatex.log)"
        (cd "$dir" && latexmk -c "$stem.tex" >/dev/null 2>&1)
        if command -v gs >/dev/null; then
          rm -f "$out"/page-*.png
          gs -q -dNOPAUSE -dBATCH -sDEVICE=png16m -r40 -sOutputFile="$out/page-%03d.png" "${page%.html}.pdf" 2>/dev/null
          python3 - "$out" <<'PY' && pass "pdf: contact sheet at $out/contact-sheet.png" || warn "pdf: contact sheet not built (Pillow missing?)"
import glob, math, sys
from PIL import Image
out = sys.argv[1]
pages = sorted(glob.glob(f"{out}/page-*.png"))
if not pages: sys.exit(1)
ims = [Image.open(p) for p in pages]
w, h = max(i.width for i in ims), max(i.height for i in ims)
cols = min(6, len(ims)); rows = math.ceil(len(ims) / cols)
sheet = Image.new("RGB", (cols * (w + 8) + 8, rows * (h + 8) + 8), "#888")
for n, im in enumerate(ims):
    sheet.paste(im, (8 + (n % cols) * (w + 8), 8 + (n // cols) * (h + 8)))
sheet.save(f"{out}/contact-sheet.png")
for p in pages:
    import os; os.remove(p)
PY
        else skip "pdf: contact sheet (Ghostscript not installed)"; fi
      else fail "pdf: latexmk failed (see $out/latexmk.log)"; fi
    else
      skip "pdf: --no-pdf (check-guide will still fail on a stale .tex)"
    fi ;;
esac

# check-guide: errors fail; the "/" quotient warning fails too, because the Signs rule is firm. Other warnings are shown.
cg=$(python3 -I tools/check-guide.py "$checked" 2>&1); rc=$?
echo "$cg" | sed -n '2,$p' | sed 's/^/      /'
if [ $rc != 0 ]; then fail "check-guide: errors (above)"
elif echo "$cg" | grep -q 'written with "/"'; then fail "check-guide: quotients still written with \"/\" (run python3 -I tools/stack-fractions.py $checked)"
else pass "check-guide: $(echo "$cg" | head -1 | sed 's/^[^:]*: //')"; fi

if [ $probe = 1 ]; then
  if (cd ../../BrowserTests && CLAUDE_SCRATCHPAD="${CLAUDE_SCRATCHPAD:-${TMPDIR:-/tmp}}" npm run probe --silent -- "/Education/AutonomyTechnologies/$page" >"$out/probe.log" 2>&1); then
    pass "probe: all 12 engine/theme/width combinations clean ($(grep '^screenshots:' "$out/probe.log" | sed 's/screenshots: //'))"
  else fail "probe: $(grep -E 'combinations|^FAIL' "$out/probe.log" | head -3 | tr '\n' ' ')(see $out/probe.log)"; fi
else skip "probe: --no-probe"; fi

echo; [ $fails = 0 ] && echo "Page check passed. Now look at the contact sheet and the probe screenshots." || echo "Page check: $fails failure(s)."
exit $((fails > 0))
