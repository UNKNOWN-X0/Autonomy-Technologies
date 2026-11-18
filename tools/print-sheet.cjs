#!/usr/bin/env node
// Print an exam sheet (<main data-print="sheet">, docs/APPENDIX-STANDARD.md, Exam sheets) to its A4 PDF with Chromium.
//   node tools/print-sheet.cjs <subject>/<page>.html [--fit]
// Every section.sheet-side is one A4 side; its type size is the --pt custom property in its style attribute.
// --fit finds, for each side, the largest size (in steps of 0.05pt) at which its cards still fit the side's columns,
// and writes it back into the HTML, so the page stays the single source. Without --fit a side that overflows fails.
// Playwright and its Chromium come from the workspace BrowserTests install (no extra download or payment).
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require(path.join(__dirname, "../../../BrowserTests/node_modules/playwright"));

const args = process.argv.slice(2);
const fit = args.includes("--fit");
const page = args.find((a) => !a.startsWith("--"));
if (!page || !fs.existsSync(page)) {
  console.error("usage: node tools/print-sheet.cjs <subject>/<page>.html [--fit]");
  process.exit(2);
}
const src = path.resolve(page);
const pdf = src.replace(/\.html$/, ".pdf");

(async () => {
  const browser = await chromium.launch();
  // Heading animations must not change the text or its metrics during printing.
  const tab = await browser.newPage({ viewport: { width: 794, height: 1123 }, reducedMotion: "reduce" });
  await tab.goto("file://" + src, { waitUntil: "networkidle" });
  await tab.emulateMedia({ media: "print", colorScheme: "light" });
  // measure only in the real print face: fonts.ready alone can resolve before a web font is even requested
  await tab.evaluate(async () => {
    const face = getComputedStyle(document.querySelector(".sheet-side")).getPropertyValue("--f-sheet").split(",")[0].trim();
    if (face) await Promise.all(["400", "700", "italic 400"].map((w) => document.fonts.load(`${w} 10px ${face}`)));
    await document.fonts.ready;
  });
  const ids = await tab.$$eval("main[data-print='sheet'] section.sheet-side", (s) => s.map((x) => x.id));
  if (!ids.length) throw new Error("no section.sheet-side inside <main data-print=\"sheet\">");

  // true when the side's cards need more columns than the side has, i.e. they spill past its right edge
  const overflows = (id, pt) =>
    tab.evaluate(([id, pt]) => {
      const side = document.getElementById(id);
      if (pt) side.style.setProperty("--pt", pt + "pt");
      const cards = side.querySelector(".sheet-cards");
      return cards.scrollWidth > cards.clientWidth + 1 || cards.scrollHeight > cards.clientHeight + 1;
    }, [id, pt]);

  const sizes = {};
  for (const id of ids) {
    if (fit) {
      let lo = 4, hi = 14; // in hundredths: binary search on a 0.05pt grid
      if (await overflows(id, lo)) throw new Error(`${id} overflows even at ${lo}pt: cut content`);
      while (hi - lo > 0.05 + 1e-9) {
        const mid = Math.round(((lo + hi) / 2) * 20) / 20;
        if (mid <= lo || mid >= hi) break;
        if (await overflows(id, mid)) hi = mid; else lo = mid;
      }
      await overflows(id, lo);
      sizes[id] = lo;
    } else if (await overflows(id, null)) {
      console.error(`FAIL ${id}: the cards overflow the side; run with --fit or cut content`);
      process.exitCode = 1;
    }
    sizes[id] = sizes[id] || (await tab.evaluate((id) => getComputedStyle(document.getElementById(id)).getPropertyValue("--pt").trim(), id));
  }

  if (fit) {
    let html = fs.readFileSync(src, "utf8");
    for (const id of ids) {
      const re = new RegExp(`(<section id="${id}"[^>]*style="--pt: )[0-9.]+pt`);
      if (!re.test(html)) throw new Error(`${id} needs style="--pt: …pt" in the HTML so --fit can write its size`);
      html = html.replace(re, `$1${sizes[id]}pt`);
    }
    fs.writeFileSync(src, html);
  }

  await tab.pdf({ path: pdf, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  const pages = (fs.readFileSync(pdf, "latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  for (const id of ids) console.log(`${id}: ${sizes[id]}${String(sizes[id]).endsWith("pt") ? "" : "pt"}`);
  console.log(`pages: ${pages} (sides: ${ids.length})`);
  if (pages !== ids.length) {
    console.error("FAIL the PDF must have exactly one page per side");
    process.exitCode = 1;
  }
  await browser.close();
})().catch((e) => {
  console.error("FAIL " + e.message);
  process.exit(1);
});
