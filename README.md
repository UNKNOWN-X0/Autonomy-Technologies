# From Fundamentals to AI Apocalypse

Study guides and interactive labs for the Autonomy Technologies programme at FAU Erlangen-Nürnberg, built up semester by semester for the whole degree.

**[Open the site →](https://unknown-x0.github.io/AutonomyTechnologies/)**

![From Fundamentals to AI Apocalypse hub](assets/preview.png)

> Personal study material written from the lecture notes. Not an official FAU publication; check anything exam-relevant against your course materials.

## What's inside

The home page has one section per semester. Each subject shows its module number, its course parts and, once they exist, its chapters with a study guide and a lab.

| Semester | Code | Subject | Module | Course parts | Material |
| --- | --- | --- | --- | --- | --- |
| 1 | APDR | Algorithms, programming, and data representation | 92313 | Lecture, blackboard exercise, computer exercise | Lecture 1 welcome; Chapter 2 guide and lab; Chapter 12a guide and lab; Chapter 3 guide and lab; Chapter 4 guide and lab; Chapter 34a guide and lab; Chapter 5 guide and lab; PDFs |
| 1 | MEI | Mathematics for Engineers I | 62765 | Lecture, exercise | Chapter 1: Statements, Logic, and Sets; Chapter 2: Real Numbers; Chapter 3: Mappings. Each has a guide, lab and PDF |
| 1 | EEI | Electrical Engineering I | 92315 | Lecture, exercise, tutorial | Chapter 1: Electrostatic Fields guide, lab, PDF and LaTeX source |
| 1 | MATLAB | Introduction to MATLAB | 92317 | Course (not started yet) | none yet |

The earlier Electrical Engineering and Mathematics pages were removed on 2026-10-27. The MEI Chapter 1–3 guides are based on the supplied lecture notes (printed pages 1–35) and were reviewed against them; each guide lists the slips it found in the notes. The current EEI Chapter 1 guide is a new summary based on the supplied WS 2026/27 lecture notes; the earlier guide and lab remain in git history.

## How to study with it

1. Read one section of a guide, then cover its formulas and write them out from memory.
2. Do the matching practice problems, then open **Show answer key** to check.
3. Try the same idea in the matching lab: predict, say how sure you are, then reveal. After the four fixed challenges, **New challenge** keeps generating fresh ones in most experiments, and **Explore freely** opens the sandbox at any time, where you can type your own values, rules and bit patterns.
4. Tick the exam checklist as each skill sticks, or press **Log today's review** under the checklist. Ticks and review days are saved in your browser.
5. Start each session on the home page: **Review today** lists every chapter you have started, most overdue first. The gap before a chapter is due again grows with each review: 1 day, then 1 week, then 1 month.

Every page works on phone and desktop and follows your system's light or dark mode. The study guides also print cleanly (the side menu is hidden in print).

## Repository layout

```
index.html        Home page: review schedule, semesters, subjects
apdr/ mei/ eei/   One folder per subject: each chapter's guide (the HTML is the single source), its
                  generated .tex and .pdf, its lab, and the subject's worked exercises, tutorials and appendices
about/            How to use the site, and the version log
css/  js/         Shared by every page of a kind; chapter scripts live in js/<subject>/
tests/            Physics, lab-challenge and generator tests (node --test)
tools/            Offline helpers: page-check.sh, check-guide.py, guide-to-tex.py, stack-fractions.py,
                  graph-describe.py, graph-orb.py (not loaded by the site)
docs/             The standards: MARKUP, GUIDE, LAB, APPENDIX, EXERCISE-SOLUTIONS, TOOLING
assets/           preview.png (this README's screenshot), graph-orb.json (written by graph-orb.py)
```

What a visitor sees is listed on the home page; what each file kind must contain is in [docs/](docs/) and the rules every change meets are in [STANDARDS.md](STANDARDS.md). No build step for the site. Fonts load from Google Fonts; formulas are plain HTML.

### Regenerating a guide's PDF

The HTML guide is the single source. After editing it, regenerate the LaTeX and PDF (needs TeX Live with the New Computer Modern fonts). For one guide:

```sh
python3 -I tools/guide-to-tex.py mei/ch3-mappings.html mei/ch3-mappings.tex
cd mei && latexmk -xelatex ch3-mappings.tex && latexmk -c ch3-mappings.tex
```

For every guide:

```sh
for g in */ch*.html; do
  case $g in *-lab.html|graphify-out/*) continue;; esac
  python3 -I tools/guide-to-tex.py "$g" "${g%.html}.tex"
  (cd "$(dirname "$g")" && latexmk -xelatex "$(basename "${g%.html}").tex" && latexmk -c "$(basename "${g%.html}").tex")
done
```

`tools/page-check.sh <guide>.html` does all of this for one page and checks the result; `python3 -I tools/check-guide.py <guide>.html` alone flags a PDF older than its `.tex`. Every PDF carries a faint diagonal "Made by Thanate Amornjiraporn (Focus)" watermark, set in the converter's preamble.

In the PDF, every answer block moves to an Answers section at the end, so the questions can be tried first.

## Design

The pages follow one sign system, modelled on German systematic signage: FAU blue sign fields, square subject code signs in one colour family per subject, a strict grid, no rounded corners or shadows, and motion only where something changed. [DESIGN.md](DESIGN.md) is the full system and `css/system.css` implements it; every page loads that file first. Theme, motion and text size follow your device unless you choose otherwise under Settings. Pages print without the colour fields.

## Adding pages

- **A new semester or subject:** in `index.html`, copy the `<section class="semester">` or `<li class="subject">` block (the templates are in comments there); a brand-new subject also needs its colour family in `css/system.css`. A course part with material gets the class `has`.
- **A study guide, lab, appendix or worked-solutions page:** follow its standard in [docs/](docs/), which names the reference page to copy, then run `tools/page-check.sh <page>` until it passes.
- **A release:** add an entry at the top of [about/version-log.html](about/version-log.html) and update [about/how-to-use.html](about/how-to-use.html) if a feature works differently. Commit; GitHub Pages updates the site within a minute or two.

## Hosting

The site is published by **GitHub Pages with Jekyll**, straight from the `main` branch. Every commit to `main` starts GitHub's automatic **pages-build-deployment** run (see the **Actions** tab), which builds the site and publishes it within a minute or two. Each run links to the live site.

- The pages have no Jekyll front matter, so Jekyll publishes them exactly as uploaded.
- `index.html` is the homepage. `README.md` stays on GitHub and is not used as the start page.
- `.github/workflows/jekyll-docker.yml` (**Jekyll site CI**) is a separate check: it builds the site in a Jekyll container on every push and pull request, so a broken build shows up as a failed run. It does not publish anything.

Setup (once): **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. The repository must stay public for free Pages hosting.

## Module map

- `index.html`: the hub. `<subject>/`: each subject's chapter guides (with their PDF and LaTeX) and labs.
- `js/` and `css/`: shared by every page of a kind; chapter-specific scripts live in `js/<subject>/`.
- `docs/`: the standards. `DESIGN.md` and `PRODUCT.md` stay at the root, where the design tooling reads them.
- `tools/` and `tests/`: offline helpers and checks, not loaded by the site.
- `assets/`: images.

Upload the HTML **and** its `css/` and `js/` directories together; the HTML files are not self-contained.
