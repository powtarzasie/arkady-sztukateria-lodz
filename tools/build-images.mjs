/**
 * Image pipeline: raw-assets/*.png -> site/assets/img/{slug}-{w}.{avif,webp,jpg}
 * Also builds the OG image (1200x630 crop of the hero) and favicons.
 * Run: node tools/build-images.mjs [--only slug]
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RAW = path.join(root, 'raw-assets');
const OUT = path.join(root, 'site', 'assets', 'img');
mkdirSync(OUT, { recursive: true });

const MANIFEST = [
  { src: 'hero.png',       slug: 'sztukateria-lodz-rozeta-gipsowa-hero',        widths: [640, 1024, 1600, 2048] },
  { src: 'gzyms.png',      slug: 'gzymsy-sufitowe-fasety-ciagnione-lodz',       widths: [480, 800, 1200] },
  { src: 'rozeta.png',     slug: 'rozety-sufitowe-gipsowe-lodz',                widths: [480, 800, 1200] },
  { src: 'listwy.png',     slug: 'listwy-ozdobne-boazerie-scienne-lodz',        widths: [480, 800, 1200] },
  { src: 'pilaster.png',   slug: 'kolumny-pilastry-kapitele-gipsowe',           widths: [480, 800, 1200] },
  { src: 'kominek.png',    slug: 'portale-kominkowe-gipsowe',                   widths: [480, 800, 1200] },
  { src: 'elewacja.png',   slug: 'sztukateria-elewacyjna-kamienica-lodz',       widths: [480, 800, 1200] },
  { src: 'renowacja.png',  slug: 'renowacja-sztukaterii-zlocenie-detalu',       widths: [640, 1024, 1600] },
  { src: 'lodz.png',       slug: 'kamienice-lodz-piotrkowska-zmierzch',         widths: [640, 1024, 1600] },
  { src: 'palac.png',      slug: 'realizacja-salon-palacowy-sztukateria',       widths: [640, 1024, 1600] },
  { src: 'apartament.png', slug: 'realizacja-apartament-nowoczesne-sztukaterie',widths: [640, 1024, 1600] },
  { src: 'klatka.png',     slug: 'realizacja-klatka-schodowa-kamienica-lodz',   widths: [640, 1024, 1600] },
  { src: 'pracownia.png',  slug: 'pracownia-sztukatorska-arkady-lodz',          widths: [640, 1024, 1600] },
];

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const dims = {};

for (const item of MANIFEST) {
  const srcPath = path.join(RAW, item.src);
  if (!existsSync(srcPath)) { console.log(`skip (missing): ${item.src}`); continue; }
  if (only && !item.slug.includes(only)) continue;
  const meta = await sharp(srcPath).metadata();
  dims[item.slug] = { w: meta.width, h: meta.height, widths: item.widths };
  for (const w of item.widths) {
    if (w > meta.width) continue;
    const base = `${item.slug}-${w}`;
    const pipe = () => sharp(srcPath).resize({ width: w });
    await pipe().avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${base}.avif`));
    await pipe().webp({ quality: 74 }).toFile(path.join(OUT, `${base}.webp`));
    await pipe().jpeg({ quality: 78, progressive: true, mozjpeg: true }).toFile(path.join(OUT, `${base}.jpg`));
  }
  console.log(`done: ${item.slug} (${meta.width}x${meta.height})`);
}

// OG image: 1200x630 center-crop of hero
const heroPath = path.join(RAW, 'hero.png');
if (existsSync(heroPath) && (!only || 'og'.includes(only))) {
  await sharp(heroPath).resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(path.join(OUT, 'og-sztukateria-lodz-arkady.jpg'));
  console.log('done: og image');
}

writeFileSync(path.join(root, 'tools', 'image-dims.json'), JSON.stringify(dims, null, 2));
console.log('manifest written');
