/** Renders favicon PNGs + favicon.ico from favicon.svg */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const svg = readFileSync(path.join(root, 'site/assets/img/favicon.svg'));

const out = (p) => path.join(root, 'site', p);

await sharp(svg, { density: 300 }).resize(180, 180).png().toFile(out('assets/img/apple-touch-icon.png'));
await sharp(svg, { density: 300 }).resize(192, 192).png().toFile(out('assets/img/icon-192.png'));
const png32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();

// Build a single-image .ico that embeds the 32px PNG (valid since Vista)
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0);      // reserved
header.writeUInt16LE(1, 2);      // type: icon
header.writeUInt16LE(1, 4);      // count
header.writeUInt8(32, 6);        // width
header.writeUInt8(32, 7);        // height
header.writeUInt8(0, 8);         // palette
header.writeUInt8(0, 9);         // reserved
header.writeUInt16LE(1, 10);     // planes
header.writeUInt16LE(32, 12);    // bpp
header.writeUInt32LE(png32.length, 14); // size
header.writeUInt32LE(22, 18);    // offset
writeFileSync(out('favicon.ico'), Buffer.concat([header, png32]));
console.log('favicons done');
