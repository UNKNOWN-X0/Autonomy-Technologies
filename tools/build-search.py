#!/usr/bin/env python3
"""Build the small client-side study search index from the authored HTML pages."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
PAGES = ("apdr", "mei", "eei")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Element:
    def __init__(self, tag, attrs):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return " ".join(c.text() if isinstance(c, Element) else c for c in self.children)


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("document", [])
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Element(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def descendants(node):
    for child in node.children:
        if isinstance(child, Element):
            yield child
            yield from descendants(child)


def clean(text):
    return re.sub(r"\s+", " ", text).strip()



def build():
    pages, page_ids, entries, sections = [], {}, [], []

    def add(ref, kind, title, snippet=""):
        title = clean(title)
        if title:
            kind = {"section": "s", "definition": "d", "worked example": "e", "formula": "f", "practice problem": "p", "exam problem": "x", "exercise problem": "q"}[kind]
            entries.append([ref, kind, title[:52], clean(snippet)[:32] if snippet else ""])

    for folder in PAGES:
        for path in sorted((ROOT / folder).glob("*.html")):
            parser = PageParser()
            parser.feed(path.read_text(encoding="utf-8"))
            body = next((n for n in descendants(parser.root) if n.tag == "body"), None)
            if not body:
                continue
            code = next((clean(n.text()) for n in descendants(body) if "code" in n.attrs.get("class", "").split()), folder.upper())
            for section in (n for n in descendants(body) if n.tag == "section" and n.attrs.get("id")):
                anchor = section.attrs["id"]
                section_text = clean(section.text())
                if not section_text:
                    continue
                page = path.relative_to(ROOT).as_posix()
                if page not in page_ids:
                    page_ids[page] = len(pages)
                    pages.append(page)
                ref = len(sections)
                sections.append([page_ids[page], anchor, code, ""])
                for heading in (n for n in descendants(section) if n.tag in ("h2", "h3", "h4")):
                    title = clean(heading.text())
                    if not title:
                        continue
                    kind = "exercise problem" if anchor.startswith("task-") and heading.tag == "h3" else "section"
                    if anchor == "practice" and heading.tag == "h3": kind = "practice problem"
                    if anchor == "exam" and heading.tag == "h3": kind = "exam problem"
                    add(ref, kind, title)
                for title_node in (n for n in descendants(section) if "worked-title" in n.attrs.get("class", "").split()):
                    add(ref, "worked example", title_node.text())
                for eq in (n for n in descendants(section) if "eq" in n.attrs.get("class", "").split()):
                    title = next((n.text() for n in descendants(eq) if n.tag == "strong"), "")
                    if title: add(ref, "formula", title, eq.text())
                for paragraph in (n for n in descendants(section) if n.tag == "p"):
                    text = clean(paragraph.text())
                    if len(text) > 500: continue
                    strong = next((n for n in descendants(paragraph) if n.tag == "strong"), None)
                    if not strong: continue
                    term = clean(strong.text()).strip(" .:;—–")
                    after = text.split(term, 1)[-1] if term else ""
                    if term and len(term) < 80 and re.search(r"\b(?:is|are|means|denotes|refers to|called)\b", after, re.I):
                        add(ref, "definition", term, text)
                for problem_list in (n for n in descendants(section) if n.tag in ("ol", "ul") and "problems" in n.attrs.get("class", "").split()):
                    kind = "exam problem" if anchor == "exam" else "practice problem"
                    for item in (n for n in problem_list.children if isinstance(n, Element) and n.tag == "li"):
                        text = clean(item.text())
                        label = next((n.text() for n in descendants(item) if n.tag == "strong"), "")
                        add(ref, kind, label or text[:100], text)
                if anchor == "formula-map":
                    for row in (n for n in descendants(section) if n.tag == "tr"):
                        cells = [n for n in descendants(row) if n.tag in ("th", "td")]
                        if cells: add(ref, "formula", cells[0].text(), row.text())
    return json.dumps([pages, sections, entries], ensure_ascii=False, separators=(",", ":")) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if the committed index differs from the pages")
    args = parser.parse_args()
    target = ROOT / "assets/search.json"
    output = build()
    if args.check:
        if not target.exists() or target.read_text(encoding="utf-8") != output:
            raise SystemExit("assets/search.json is stale; run python3 -I tools/build-search.py")
    else:
        target.write_text(output, encoding="utf-8")


if __name__ == "__main__":
    main()
