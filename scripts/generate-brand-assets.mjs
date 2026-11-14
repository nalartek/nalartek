import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const imagesDir = path.join(root, 'public/images');
const publicDir = path.join(root, 'public');
const NAVY = [16, 29, 50];

function decodePng(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${file}: not a PNG`);
  let pos = 8;
  let width, height, bitDepth, colorType, interlace;
  const idat = [];
  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += length + 12;
  }
  if (bitDepth !== 8 || colorType !== 2 || interlace !== 0) {
    throw new Error(`${file}: expected an 8-bit RGB non-interlaced PNG`);
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 3;
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const rowStart = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? pixels[y * stride + x - bpp] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = x >= bpp && y > 0 ? pixels[(y - 1) * stride + x - bpp] : 0;
      let value = raw[rowStart + x];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      pixels[y * stride + x] = value & 255;
    }
  }
  return { width, height, pixels };
}

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuf.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 8 + data.length);
  return out;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function encodePng({ width, height, pixels }) {
  const bpp = 3;
  const stride = width * bpp;
  const rows = [];
  const candidate = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    let bestFilter = 0;
    let bestScore = Infinity;
    let best = null;
    for (let filter = 0; filter <= 4; filter++) {
      let score = 0;
      for (let x = 0; x < stride; x++) {
        const left = x >= bpp ? pixels[y * stride + x - bpp] : 0;
        const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
        const upLeft = x >= bpp && y > 0 ? pixels[(y - 1) * stride + x - bpp] : 0;
        const value = pixels[y * stride + x];
        let filtered;
        if (filter === 0) filtered = value;
        else if (filter === 1) filtered = value - left;
        else if (filter === 2) filtered = value - up;
        else if (filter === 3) filtered = value - Math.floor((left + up) / 2);
        else filtered = value - paeth(left, up, upLeft);
        candidate[x] = filtered & 255;
        score += candidate[x] < 128 ? candidate[x] : 256 - candidate[x];
      }
      if (score < bestScore) {
        bestScore = score;
        bestFilter = filter;
        best = Buffer.from(candidate);
      }
    }
    rows.push(Buffer.from([bestFilter]), best);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function resizeArea(source, targetWidth, targetHeight) {
  const { width: sw, height: sh, pixels } = source;
  const xWeights = [];
  const yWeights = [];
  for (let x = 0; x < targetWidth; x++) {
    const start = (x * sw) / targetWidth;
    const end = ((x + 1) * sw) / targetWidth;
    const first = Math.floor(start);
    const last = Math.ceil(end);
    const weights = [];
    for (let sx = first; sx < last; sx++) {
      const weight = Math.max(0, Math.min(end, sx + 1) - Math.max(start, sx));
      if (weight > 0) weights.push([sx, weight]);
    }
    xWeights.push(weights);
  }
  for (let y = 0; y < targetHeight; y++) {
    const start = (y * sh) / targetHeight;
    const end = ((y + 1) * sh) / targetHeight;
    const first = Math.floor(start);
    const last = Math.ceil(end);
    const weights = [];
    for (let sy = first; sy < last; sy++) {
      const weight = Math.max(0, Math.min(end, sy + 1) - Math.max(start, sy));
      if (weight > 0) weights.push([sy, weight]);
    }
    yWeights.push(weights);
  }
  const out = Buffer.alloc(targetWidth * targetHeight * 3);
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      let r = 0, g = 0, b = 0, total = 0;
      for (const [sy, wy] of yWeights[y]) {
        for (const [sx, wx] of xWeights[x]) {
          const weight = wx * wy;
          const index = (sy * sw + sx) * 3;
          r += pixels[index] * weight;
          g += pixels[index + 1] * weight;
          b += pixels[index + 2] * weight;
          total += weight;
        }
      }
      const index = (y * targetWidth + x) * 3;
      out[index] = Math.round(r / total);
      out[index + 1] = Math.round(g / total);
      out[index + 2] = Math.round(b / total);
    }
  }
  return { width: targetWidth, height: targetHeight, pixels: out };
}

function crop(source, x, y, width, height) {
  const out = Buffer.alloc(width * height * 3);
  for (let row = 0; row < height; row++) {
    const from = ((y + row) * source.width + x) * 3;
    source.pixels.copy(out, row * width * 3, from, from + width * 3);
  }
  return { width, height, pixels: out };
}

function writePng(name, image) {
  const file = path.join(imagesDir, name);
  fs.writeFileSync(file, encodePng(image));
  return file;
}

function writePublicPng(name, image) {
  const file = path.join(publicDir, name);
  fs.writeFileSync(file, encodePng(image));
  return file;
}

function brandBounds(source, tolerance = 10) {
  let minX = source.width, minY = source.height, maxX = 0, maxY = 0;
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const index = (y * source.width + x) * 3;
      const distance =
        Math.abs(source.pixels[index] - NAVY[0]) +
        Math.abs(source.pixels[index + 1] - NAVY[1]) +
        Math.abs(source.pixels[index + 2] - NAVY[2]);
      if (distance > tolerance) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

function squareCropAround(source, bounds, paddingRatio = 0.1) {
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const contentSize = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) + 1;
  const size = Math.min(
    Math.round(contentSize * (1 + paddingRatio * 2)),
    Math.min(source.width, source.height)
  );
  let x = Math.round(centerX - size / 2);
  let y = Math.round(centerY - size / 2);
  x = Math.max(0, Math.min(source.width - size, x));
  y = Math.max(0, Math.min(source.height - size, y));
  return crop(source, x, y, size, size);
}

function makeIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = 6 + entries.length * 16;
  const directory = [];
  for (const { size, png } of entries) {
    const entry = Buffer.alloc(16);
    entry[0] = size === 256 ? 0 : size;
    entry[1] = size === 256 ? 0 : size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    directory.push(entry);
    offset += png.length;
  }
  return Buffer.concat([header, ...directory, ...entries.map((entry) => entry.png)]);
}

const logo = decodePng(path.join(imagesDir, 'nalartek-logo.png'));
const banner = decodePng(path.join(imagesDir, 'nalartek-banner.png'));
const logoBounds = brandBounds(logo);

console.log('Logo mark bounds:', logoBounds);

const logoSmall = writePng('nalartek-logo-128.png', resizeArea(logo, 128, 128));
const logoMedium = writePng('nalartek-logo-256.png', resizeArea(logo, 256, 256));
const logoIcon = squareCropAround(logo, logoBounds, 0.1);

const favicon16 = resizeArea(logoIcon, 16, 16);
const favicon32 = resizeArea(logoIcon, 32, 32);
const favicon48 = resizeArea(logoIcon, 48, 48);
const appleIcon = resizeArea(logoIcon, 180, 180);
const icon192 = resizeArea(logoIcon, 192, 192);
const icon512 = resizeArea(logoIcon, 512, 512);

fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  makeIco([
    { size: 16, png: encodePng(favicon16) },
    { size: 32, png: encodePng(favicon32) },
    { size: 48, png: encodePng(favicon48) },
  ])
);
writePublicPng('favicon-32.png', favicon32);
writePublicPng('apple-touch-icon.png', appleIcon);
writePublicPng('icon-192.png', icon192);
writePublicPng('icon-512.png', icon512);

const lockup = crop(banner, 560, 420, 1440, 600);
const lockup1440 = writePng('nalartek-banner-lockup-1440.png', lockup);
const lockup720 = writePng('nalartek-banner-lockup-720.png', resizeArea(lockup, 720, 300));
const ogCropHeight = Math.round((banner.width * 630) / 1200);
const ogImage = writePng(
  'nalartek-og.png',
  resizeArea(
    crop(banner, 0, Math.round((banner.height - ogCropHeight) / 2), banner.width, ogCropHeight),
    1200,
    630
  )
);

for (const file of [
  logoSmall,
  logoMedium,
  path.join(publicDir, 'favicon.ico'),
  path.join(publicDir, 'favicon-32.png'),
  path.join(publicDir, 'apple-touch-icon.png'),
  path.join(publicDir, 'icon-192.png'),
  path.join(publicDir, 'icon-512.png'),
  lockup1440,
  lockup720,
  ogImage,
]) {
  console.log(`${path.relative(root, file)}: ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
}

fs.rmSync(path.join(publicDir, 'favicon.svg'), { force: true });
