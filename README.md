# Sztukateria Łódź — ARKADY · landing page

Premium, SEO-first landing page for **ARKADY — Pracownie Robót Sztukatorskich i Konserwacji Zabytków** (Łódź, est. 1977). Built entirely by Claude (Fable 5) in Claude Code: static HTML/CSS/vanilla JS, generative imagery (GPT Image 2) and an animated hero (Seedance 2.0 via Higgsfield).

**Live (GitHub Pages preview):** https://powtarzasie.github.io/arkady-sztukateria-lodz/

## Run locally

```bash
node server.js
# → http://localhost:4321        (page)
# → http://localhost:4321/guide  (how it was built — PL)
```

No production dependencies. Dev dependencies (`sharp`, `ffmpeg-static`, `puppeteer-core`) are only needed to regenerate assets: `npm install`, then scripts in `tools/`.

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | serve `site/` with gzip, cache headers, `/guide` route, real 404 |
| `npm run build:css` | rebuild `main.css` from `tools/*.css` and inline it into `index.html` |
| `npm run build:images` | regenerate AVIF/WebP/JPG srcset variants from `raw-assets/` (not in repo) |
| `npm run build:favicons` | regenerate favicon set from `site/assets/img/favicon.svg` |
| `node tools/build-pages.mjs` | build `dist-pages/` with GitHub Pages path prefix |

## Quality

Lighthouse: **mobile 94/100/100/100, desktop 100/100/100/100** (Perf/A11y/BP/SEO), CLS 0. Full JSON-LD layer (LocalBusiness, Service catalog, FAQPage), crawlable without JavaScript, `prefers-reduced-motion` respected.

Note: `raw-assets/` (original generated PNGs/MP4, ~70 MB) is kept out of the repo; optimized derivatives live in `site/assets/`.

Before production deploy: swap the placeholder canonical domain and verify opening hours — see `/guide`, section 4.
