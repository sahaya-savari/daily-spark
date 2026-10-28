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
});
