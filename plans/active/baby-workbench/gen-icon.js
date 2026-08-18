// 生成 192x192 PNG 图标（红色背景 + 白色婴儿车轮廓）
// 运行: node gen-icon.js
const fs = require('fs');
const zlib = require('zlib');

const SIZE = 192;

// 创建原始像素数据 (RGBA)
const raw = Buffer.alloc(SIZE * SIZE * 4);

// 红色背景
const R = 0xff, G = 0x6b, B = 0x6b;
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4;
    raw[i] = R; raw[i + 1] = G; raw[i + 2] = B; raw[i + 3] = 255;
  }
}

// 画婴儿车: 车顶 + 车身 + 轮子
const cx = SIZE / 2, cy = SIZE / 2;

// 车顶弧线 (白色半圆)
for (let y = 40; y < 90; y++) {
  for (let x = 55; x < 137; x++) {
    const dx = (x - cx) / 41, dy = (y - 65) / 25;
    if (dx * dx + dy * dy < 1) {
      const i = (y * SIZE + x) * 4;
      raw[i] = 255; raw[i + 1] = 255; raw[i + 2] = 255;
    }
  }
}

// 车身 (白色矩形)
for (let y = 90; y < 130; y++) {
  for (let x = 60; x < 132; x++) {
    const i = (y * SIZE + x) * 4;
    raw[i] = 255; raw[i + 1] = 255; raw[i + 2] = 255;
  }
}

// 左轮子
function drawWheel(wx, wy) {
  for (let y = wy - 15; y <= wy + 15; y++) {
    for (let x = wx - 15; x <= wx + 15; x++) {
      const dx = x - wx, dy = y - wy;
      if (dx * dx + dy * dy < 225) {
        const i = (y * SIZE + x) * 4;
        raw[i] = 255; raw[i + 1] = 255; raw[i + 2] = 255;
      }
    }
  }
}
drawWheel(72, 150);
drawWheel(120, 150);

// PNG 编码
function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeData));
  return Buffer.concat([len, typeData, crc]);
}

const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // color type (RGBA)
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const rawWithFilter = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
  rawWithFilter[y * (SIZE * 4 + 1)] = 0;
  raw.copy(rawWithFilter, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}

const compressed = zlib.deflateSync(rawWithFilter);

const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0))
]);

fs.writeFileSync('apple-touch-icon.png', png);
console.log('Generated apple-touch-icon.png (' + png.length + ' bytes)');
