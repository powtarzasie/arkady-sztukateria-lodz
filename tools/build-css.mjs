/**
 * Builds site/assets/css/main.css (fonts + styles) and inlines it into
 * site/index.html as <style id="critical-css"> for zero render-blocking requests.
 * Idempotent — replaces a previous inline block on re-run.
 * Run: node tools/build-css.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const p = (...s) => path.join(root, ...s);

const css = (readFileSync(p('tools/fonts-local.css'), 'utf8') + '\n' + readFileSync(p('tools/main-styles.css'), 'utf8'))
  .replaceAll("url('../fonts/", "url('/assets/fonts/");
writeFileSync(p('site/assets/css/main.css'), css);

let html = readFileSync(p('site/index.html'), 'utf8');
const inlineBlock = `<style id="critical-css">\n${css}\n</style>`;
if (html.includes('id="critical-css"')) {
  html = html.replace(/<style id="critical-css">[\s\S]*?<\/style>/, inlineBlock);
} else {
  html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/main\.css">/, inlineBlock);
}
writeFileSync(p('site/index.html'), html);
console.log('main.css rebuilt + inlined into index.html (', (css.length / 1024).toFixed(1), 'KB raw )');
