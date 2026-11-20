#!/usr/bin/env python3
"""Check that offline assets and service-worker cache version match the site."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def check():
    errors = []
    log = (ROOT / "about/version-log.html").read_text(encoding="utf-8")
    worker = (ROOT / "sw.js").read_text(encoding="utf-8")
    latest = re.search(r"<h2[^>]*>\s*(\d+\.\d+)", log)
    version = re.search(r'const VERSION = "([^"]+)";', worker)
    if not latest:
        errors.append("about/version-log.html has no leading version entry")
    if not version:
        errors.append("sw.js has no VERSION constant")
    if latest and version and latest.group(1) != version.group(1):
        errors.append("sw.js VERSION %s does not match the latest log version %s" % (version.group(1), latest.group(1)))

    shell = re.search(r"const SHELL = \[(.*?)\];", worker, re.S)
    cached = set(re.findall(r'"(\./[^"\n]+)"', shell.group(1))) if shell else set()
    if not shell:
        errors.append("sw.js has no SHELL cache list")
    required = {"./offline.html", "./manifest.webmanifest", "./assets/search.json", "./assets/fonts/hanken-grotesk-latin.woff2", "./js/progress.js"}
    required.update("./" + path.relative_to(ROOT).as_posix() for folder in (ROOT / "css", ROOT / "js") for path in folder.glob("*.css" if folder.name == "css" else "*.js"))
    for path in sorted(required - cached):
        errors.append("sw.js SHELL is missing %s" % path)
    for path in sorted(cached):
        if not (ROOT / path[2:]).is_file():
            errors.append("sw.js SHELL entry does not exist: %s" % path)

    pages = [ROOT / "index.html", ROOT / "offline.html"]
    for folder in ("about", "apdr", "mei", "eei"):
        pages.extend((ROOT / folder).glob("*.html"))
    for page in pages:
        if not re.search(r'<link\b[^>]*rel="manifest"[^>]*>', page.read_text(encoding="utf-8")):
            errors.append("%s has no web app manifest link" % page.relative_to(ROOT))
    return errors


def main():
    errors = check()
    if errors:
        print("\n".join("ERROR: " + error for error in errors), file=sys.stderr)
        return 1
    print("offline version, shell assets and manifest links are current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
