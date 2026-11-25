# Contributing

Thanks for helping. This is a personal study site, so the most useful contribution is telling us about a mistake.

## Report a problem

- **A wrong formula, result or explanation:** open a [content error](https://github.com/UNKNOWN-X0/Autonomy-Technologies/issues/new?template=content-error.yml) issue with the page, the section and what it should say. A source (lecture slide, sheet, textbook page) helps most.
- **Something broken on the site:** open a [bug report](https://github.com/UNKNOWN-X0/Autonomy-Technologies/issues/new?template=bug-report.yml) with the page, the browser and what you saw.
- **An idea:** open a [feature request](https://github.com/UNKNOWN-X0/Autonomy-Technologies/issues/new?template=feature-request.yml).
- **A security problem:** see [SECURITY.md](SECURITY.md); do not open a public issue.

## Send a change

1. Read [README.md](README.md) (Development) and the standard for the kind of page you change in [docs/](docs/); [STANDARDS.md](STANDARDS.md) says what done means.
2. Make the change on a branch. The HTML page is the single source: never edit a `.tex` or `.pdf` by hand.
3. Run the checks:

   ```sh
   node --test tests/*.test.js
   tools/page-check.sh <subject>/<page>.html
   ```

   `page-check.sh` regenerates the page's `.tex` and `.pdf`, runs the page checker and probes the page in Chromium and WebKit.
4. Add a version-log entry (`about/version-log.html`) when students will see the change.
5. Open a pull request against `main`; the Checks workflow must pass.

By contributing you agree that code is licensed under the [MIT License](LICENSE) and study content under [CC BY-NC-SA 4.0](LICENSE-CONTENT.md). Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).
