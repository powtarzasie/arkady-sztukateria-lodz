/**
 * Builds dist-pages/ — a copy of site/ rewritten for GitHub Pages,
 * where the site lives under /<REPO>/ instead of the domain root.
 * Rewrites root-absolute /assets/... and /favicon.ico references
 * (HTML + CSS) to /<REPO>/-prefixed ones. Run: node tools/build-pages.mjs
 */
import { cpSync, readFileSync, writeFileSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = 'arkady-sztukateria-lodz';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(root, 'site');
const DIST = path.join(root, 'dist-pages');

rmSync(DIST, { recursive: true, force: true });
cpSync(SRC, DIST, { recursive: true });

const prefix = `/${REPO}`;
const rewrite = (rel) => {
  const f = path.join(DIST, rel);
  let s = readFileSync(f, 'utf8');
  s = s.replaceAll('"/assets/', `"${prefix}/assets/`)
       .replaceAll("'/assets/", `'${prefix}/assets/`)
       .replaceAll(', /assets/', `, ${prefix}/assets/`)   // srcset/imagesrcset entries
       .replaceAll('url(/assets/', `url(${prefix}/assets/`)
       .replaceAll('href="/favicon.ico"', `href="${prefix}/favicon.ico"`)
       .replaceAll('href="/guide"', `href="${prefix}/guide/"`)
       .replaceAll('href="/">', `href="${prefix}/">`);
  writeFileSync(f, s);
  console.log('rewritten:', rel);
};

['index.html', '404.html', path.join('guide', 'index.html'), path.join('assets', 'css', 'main.css')].forEach(rewrite);
console.log('dist-pages ready for', prefix);
