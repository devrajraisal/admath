# AdMath: Ad Campaign Calculator

A small React app for comparing digital ad campaign scenarios. Enter spend, impressions, clicks, conversions, and revenue, and AdMath calculates the standard performance metrics side by side.

I built it because I run Meta Ads campaigns as a freelance digital marketer, and I wanted one place to compare budget scenarios before spending.

## Features
- Compare up to 4 scenarios with one card each
- Metrics: CTR, CPC, CPM, conversion rate, CPA, ROAS, ROI
- ROAS comparison chart (SVG) and a "best return" summary
- Input checks, for example clicks higher than impressions
- Scenarios are saved in your browser (localStorage)
- Export all scenarios to CSV
- Works on phones and follows your light or dark mode

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

A metric shows a dash when its denominator is zero.

## Tech
- React 18 (loaded from cdnjs, no build step)
- Plain CSS with light and dark themes
- Everything is in one `index.html` file

## Run locally
Open `index.html` in a browser, or run `npx serve .` in this folder.

## Deploy on GitHub Pages
1. Open the repository **Settings > Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, then branch `main` and folder `/ (root)`.
3. Save. The site appears at `https://<your-username>.github.io/admath/`.

## Limits
- It does not connect to Meta Ads or any ad platform. You type the numbers in.
- The "sample numbers" button loads made-up values for demonstration only.

## License
MIT. See [LICENSE](LICENSE).
