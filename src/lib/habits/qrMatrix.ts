/**
 * Lightweight Pure TypeScript QR Code Matrix Generator (Byte Mode, Version 1 to 6)
 * 100% offline, 0 KB external dependency, zero CDNs.
 */

// Galois Field GF(256) tables with primitive polynomial 0x11d
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 0x11d;
    }
  }
  GF_LOG[0] = 0;
})();

function gfMultiply(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMultiply(poly[j], root);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsCalculateEcc(data: Uint8Array, eccCount: number): Uint8Array {
  const gen = rsGeneratorPoly(eccCount);
  const remainder = new Uint8Array(eccCount);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < eccCount - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMultiply(gen[eccCount - j - 1], factor);
    }
    remainder[eccCount - 1] = gfMultiply(gen[0], factor);
  }

  return remainder;
}

// Table of QR parameters for Version 1..6, Low error correction (L)
const VERSION_PARAMS = [
  { version: 1, size: 21, dataCap: 19, eccCount: 7 },
  { version: 2, size: 25, dataCap: 34, eccCount: 10 },
  { version: 3, size: 29, dataCap: 55, eccCount: 15 },
  { version: 4, size: 33, dataCap: 80, eccCount: 20 },
  { version: 5, size: 37, dataCap: 108, eccCount: 26 },
  { version: 6, size: 41, dataCap: 136, eccCount: 36 },
];

export function generateQrMatrix(text: string): boolean[][] {
  const enc = new TextEncoder();
  const rawBytes = enc.encode(text);

  // Pick smallest fitting version
  let chosen = VERSION_PARAMS[VERSION_PARAMS.length - 1];
  for (const vp of VERSION_PARAMS) {
    if (rawBytes.length + 3 <= vp.dataCap) {
      chosen = vp;
      break;
    }
  }

  const { size, dataCap, eccCount } = chosen;
  const bitStream: number[] = [];

  function appendBits(val: number, length: number) {
    for (let i = length - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  // Byte mode indicator: 0100
  appendBits(0b0100, 4);
  // Character count indicator: 8 bits for v1-9
  appendBits(rawBytes.length, 8);
  // Data bytes
  for (let i = 0; i < rawBytes.length; i++) {
    appendBits(rawBytes[i], 8);
  }

  // Terminator (up to 4 zero bits)
  const maxBits = dataCap * 8;
  const padZeros = Math.min(4, maxBits - bitStream.length);
  for (let i = 0; i < padZeros; i++) bitStream.push(0);

  // Align to byte boundary
  while (bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }

  // Pad with alternating 0xEC and 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitStream.length < maxBits) {
    appendBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data byte array
  const dataBytes = new Uint8Array(dataCap);
  for (let i = 0; i < dataCap; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitStream[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // Calculate ECC codewords
  const eccBytes = rsCalculateEcc(dataBytes, eccCount);

  // Full sequence of codewords
  const allCodewords = new Uint8Array(dataCap + eccCount);
  allCodewords.set(dataBytes, 0);
  allCodewords.set(eccBytes, dataCap);

  // Initialize empty matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean) {
    matrix[r][c] = val;
    reserved[r][c] = true;
  }

  // Place 7x7 Finder Pattern with 1px border
  function placeFinder(row: number, col: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBlack =
          r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        setModule(row + r, col + c, isBlack);
      }
    }
    // Separators
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          const rr = row + r;
          const cc = col + c;
          if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
            setModule(rr, cc, false);
          }
        }
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Place 5x5 Alignment Pattern for QR Version 2 through 6 (size > 21)
  function placeAlignment(row: number, col: number) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const dist = Math.max(Math.abs(r), Math.abs(c));
        const isBlack = dist === 2 || dist === 0;
        setModule(row + r, col + c, isBlack);
      }
    }
  }

  if (size > 21) {
    placeAlignment(size - 7, size - 7);
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const isDark = i % 2 === 0;
    setModule(6, i, isDark);
    setModule(i, 6, isDark);
  }

  // Dark module
  setModule(size - 8, 8, true);

  // Reserve format information areas
  function markReserved(r: number, c: number) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      reserved[r][c] = true;
    }
  }

  for (let i = 0; i < 9; i++) {
    markReserved(8, i);
    markReserved(i, 8);
    markReserved(8, size - 1 - i);
    markReserved(size - 1 - i, 8);
  }

  // Flatten all codewords into bits
  const finalBits: number[] = [];
  for (let i = 0; i < allCodewords.length; i++) {
    for (let b = 7; b >= 0; b--) {
      finalBits.push((allCodewords[i] >> b) & 1);
    }
  }

  // Place data bits in zig-zag 2-column paths
  let bitIdx = 0;
  let upward = true;

  for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol--; // Skip timing column

    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (let c = rightCol; c >= rightCol - 1; c--) {
        if (!reserved[r][c]) {
          const bitVal = bitIdx < finalBits.length ? finalBits[bitIdx] : 0;
          // Apply standard Mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = (bitVal === 1) !== mask;
          bitIdx++;
        }
      }
    }
    upward = !upward;
  }

  // Format bits for L-quality mask 0: 111011111000100
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
  // Place top-left format info
  const formatCoordsTopLeft: Array<[number, number]> = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = formatCoordsTopLeft[i];
    matrix[r][c] = formatBits[i] === 1;
  }

  // Place second format copy (split bottom-left and top-right)
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 8 + i] = formatBits[7 + i] === 1;
  }

  return matrix;
}

/**
 * Renders the QR matrix as an SVG string.
 */
export function generateQrSvg(text: string, fg = "#000000", bg = "#FFFFFF"): string {
  const matrix = generateQrMatrix(text);
  const size = matrix.length;
  const padding = 2;
  const total = size + padding * 2;

  let rects = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${c + padding}" y="${r + padding}" width="1" height="1" fill="${fg}" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">
    <rect width="${total}" height="${total}" fill="${bg}" />
    ${rects}
  </svg>`;
}
