# Project instructions

This file follows the [Project AGENTS standard](../../STANDARDS.md#project-agents-standard)
and supplements the shared rules in [workspace AGENTS.md](../../AGENTS.md). It records
verified project-specific facts. See [ADD-ONS.md](../../ADD-ONS.md)
for the complete workspace add-on inventory and upkeep notes; it is a catalog,
not a separate workflow guide.

## Project data

- **Graphify:** This repository has a persistent index at `graphify-out/graph.json`. Follow the workspace [Graphify graph standard](../../STANDARDS.md#graphify-graph-standard).
- **Archify:** Diagrams for this repository belong in its `.archify/` folder. Follow the workspace [Archify diagram standard](../../STANDARDS.md#archify-diagram-standard); HTML diagrams are snapshots.
- **Standards:** [STANDARDS.md](STANDARDS.md) holds this project's rules, lessons, checks, and definition of done; [DESIGN.md](DESIGN.md) is the visual authority and [PRODUCT.md](PRODUCT.md) the product truth. Study guides, labs, worked solutions, and the authoring tools each have a standard under [docs/](docs/). Read them before changing a page, the hub, the rail, or a lab.

## Local workflow

- **Tests:** `node --test tests/*.test.js` (registered in the workspace `scripts/test-all.sh`, so **Test: all projects** and `scripts/verify.sh Education/AutonomyTechnologies` run it).
- **Pages:** the HTML is the single source. After changing a page, `python3 -I tools/stack-fractions.py <page>` for any quotient still written with "/", then `tools/page-check.sh <page>` (regenerates the `.tex` and `.pdf`, checks the page, probes it) must pass. Never commit a `.tex` or `.pdf` you did not regenerate.
- **Graph refresh:** `graphify update . && python3 -I tools/graph-describe.py && python3 tools/graph-orb.py && touch graphify-out/graph.json` (or `scripts/refresh-graph.sh` from the Developer workspace). The second step writes the plain-English node notes, the third the 3D layout for the home-page orb, and the touch keeps `graph.json` newer than that output so the staleness check stays quiet; plain `graphify update .` drops the first two. Hand-written community names live in `graphify-out/.graphify_labels.json` (STANDARDS.md, Graph).
- **Browser checks:** the workspace smoke suite finds every page under `mei/`, `apdr/`, and `eei/` on disk; `page-check.sh` runs the probe for one page, and `npm run labs` in `BrowserTests` plays every lab (about 40 minutes; run after a lab change). Probe scripts and screenshots go in the session scratchpad, never in the repository.
- **Shared working tree:** another agent session may be editing this repository at the same time. Before committing, read `git diff` hunk by hunk and stage only your own changes, and say what you left out.
- **Releases:** a change students can see adds an entry at the top of `about/version-log.html`; `about/how-to-use.html` describes the current features.
