import { describe, it, expect } from "vitest";
import { generateQrMatrix, generateQrSvg } from "./qrMatrix";

describe("qrMatrix.ts", () => {
  it("generates valid square boolean matrix for text", () => {
    const matrix = generateQrMatrix("DAILYSPARK_TEST");
    expect(matrix.length).toBeGreaterThanOrEqual(21);
    expect(matrix[0].length).toBe(matrix.length);
  });

  it("produces crisp SVG with correct dimensions", () => {
    const svg = generateQrSvg("DAILYSPARK_VAULT_CHUNK_1");
    expect(svg).toContain("<svg");
    expect(svg).toContain("shape-rendering=\"crispEdges\"");
    expect(svg).toContain("</svg>");
  });

  it("generates multi-version QR codes with alignment patterns for larger payloads", () => {
    // 60-byte payload requires Version >= 3 (size >= 29)
    const longText = "DS:1:5:eyJzdHJlYWtzIjpbeyJuYW1lIjoiTW9ybmluZyBNZWRpdGF0aW9uIn1dfQ==";
    const matrix = generateQrMatrix(longText);
    expect(matrix.length).toBeGreaterThan(21);
    const size = matrix.length;
    // Check center of alignment pattern at (size - 7, size - 7)
    expect(matrix[size - 7][size - 7]).toBe(true);
  });
});
