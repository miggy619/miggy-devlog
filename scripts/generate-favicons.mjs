// One-shot favicon generator. Reads public/miggydev-mark.png, writes:
//   public/icon-16.png  (16×16, bicubic)
//   public/icon-32.png  (32×32, bicubic)
//   src/app/favicon.ico (multi-size 16+32, PNG-embedded)
//
// Run: node scripts/generate-favicons.mjs
// Sharp is already in node_modules via Next.js — no new dep added.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public/miggydev-mark.png");
const OUT16 = path.join(ROOT, "public/icon-16.png");
const OUT32 = path.join(ROOT, "public/icon-32.png");
const OUT_ICO = path.join(ROOT, "src/app/favicon.ico");

async function makePng(size) {
  return sharp(SRC)
    .resize(size, size, { kernel: sharp.kernel.cubic, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function pngsToIco(images) {
  const numImages = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * numImages;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  const entries = [];
  let offset = dirSize;
  for (const img of images) {
    const e = Buffer.alloc(entrySize);
    e.writeUInt8(img.size === 256 ? 0 : img.size, 0);
    e.writeUInt8(img.size === 256 ? 0 : img.size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(img.data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += img.data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const png16 = await makePng(16);
const png32 = await makePng(32);

fs.writeFileSync(OUT16, png16);
fs.writeFileSync(OUT32, png32);

const ico = pngsToIco([
  { size: 16, data: png16 },
  { size: 32, data: png32 },
]);
fs.writeFileSync(OUT_ICO, ico);

console.log("wrote:", OUT16, OUT32, OUT_ICO);
console.log("ico size:", ico.length, "bytes");
