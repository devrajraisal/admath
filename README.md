# AdMath: Ad Campaign Calculator

**Live demo:** https://devrajraisal.github.io/admath/

A small React app for comparing digital ad campaign scenarios. Enter spend, impressions, clicks, conversions, and revenue, and AdMath calculates the standard performance metrics side by side.

I built it because I run Meta Ads campaigns as a freelance digital marketer, and I wanted one place to compare budget scenarios before spending.

## Features

- Compare up to 4 scenarios with one card each
- Metrics: CTR, CPC, CPM, conversion rate, CPA, ROAS, ROI
- ROAS comparison chart (SVG) and a "best return" summary
- Input checks: negative or non-numeric values are explained, and so are clicks higher than impressions
- Scenarios are saved in your browser (localStorage)
- Export all scenarios to CSV
- Works on phones, follows your light or dark mode, and has labelled inputs for screen readers
- Private: everything runs in your browser. The built page also carries a Content Security Policy that blocks all network requests

## Formulas

| Metric | Formula |
| --- | --- |
| CTR | clicks / impressions x 100 |
| CPC | spend / clicks |
| CPM | spend / impressions x 1000 |
| Conversion rate | conversions / clicks x 100 |
| CPA | spend / conversions |
| ROAS | revenue / spend |
| ROI | (revenue - spend) / spend x 100 |

A metric shows a dash until every number it needs has been entered, and when a denominator is zero. An empty box means "not entered", which is different from typing 0. This way a missing spend never makes CPC look like 0, as if the clicks were free.

## Run it

You need Node.js 20 or newer.

```bash
git clone https://github.com/devrajraisal/admath.git
cd admath
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type check and build into `dist` |
| `npm run preview` | Serve the build locally |
| `npm run typecheck` | Run the TypeScript compiler |
| `npm run lint` | Run the linter |
| `npm test` | Run the tests |

## Project structure

```
src/
  lib/          Calculations, CSV export, saved data, formatting (no React)
  components/   Scenario card, input field, ROAS chart
  App.tsx       State and page layout
legacy/         The first version, a single HTML file
```

## Design decisions

- **Hand-checked tests.** The formula tests use the two sample scenarios, whose results can be worked out on paper (for example example A has a ROAS of 4.8 and an ROI of 380%).
- **Honest results.** Every metric is `null` when it cannot be worked out, so the screen shows a dash and never `NaN`, `Infinity`, or a misleading 0.
- **Spreadsheet safe export.** Spreadsheet programs run text that starts with `=`, `+`, `-`, or `@` as a formula, even inside quotes. A scenario name is typed by the person, so such text is saved with a leading apostrophe. A test covers it.
- **Saved data is checked.** Whatever is read from localStorage is cleaned before use, so broken or old data cannot crash the app. Data saved by the first version still opens.
- **No outside scripts.** React is bundled into the app, so the page does not load code from a CDN.

## Tests

The suite has 62 tests covering the formulas, input parsing, CSV export, saved data, and the full interface with Testing Library.

```bash
npm test
```

## Deploy on GitHub Pages

The repository includes a workflow that builds the app and publishes it. Turn it on once:

1. Open **Settings > Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`, or run **Deploy to GitHub Pages** from the Actions tab.

The site appears at `https://devrajraisal.github.io/admath/`.

## Limits

- It does not connect to Meta Ads or any ad platform. You type the numbers in.
- The "sample numbers" button loads made-up values for demonstration only.
- The interface is tested in a simulated browser. I have not tested it by hand in every browser.

## License

MIT. See [LICENSE](LICENSE).
