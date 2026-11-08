"use client";

import { useEffect, useMemo, useState } from "react";
import { DitherShader, type DitherShaderProps } from "@/lib/dither";

/**
 * GLSL continuous ambient field for the overall Daily Spark background.
 *
 * Combines gentle low-frequency simplex noise with a soft, expansive radial
 * presence across the page. Attenuated to a whisper so foreground content,
 * cards, and typography maintain clear contrast (>7:1).
 */
const FIELD = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // Slow, serene ambient drift
  vec2 drift = vec2(t * 0.008, -t * 0.006);
  float n1 = snoise(p * uScale + drift);
  float n2 = snoise(p * (uScale * 1.8) - drift * 0.7);
  float noise = 0.6 * n1 + 0.4 * n2;

  // Soft atmospheric top-right and bottom-left warmth fading cleanly to pure pitch black
  float distTop = length(p - vec2(aspect * 0.85, 0.95));
  float glowTop = exp(-distTop * distTop * 2.8);

  float distBottom = length(p - vec2(aspect * 0.15, 0.05));
  float glowBottom = exp(-distBottom * distBottom * 3.2);

  float aura = glowTop * 0.75 + glowBottom * 0.5;
  float atmosphere = smoothstep(0.08, 0.75, aura);
  float tone = uIntensity * (0.4 + 0.6 * noise) * atmosphere;

  return clamp(tone, 0.0, 1.0);
}
`;

export type SiteDitherBackgroundProps = Omit<
  DitherShaderProps,
  "field" | "uniforms" | "fallback"
> & {
  intensity?: number;
  scale?: number;
};

/**
 * SiteDitherBackground
 *
 * Full-page atmospheric ordered-dither shader background powered by dithercn.
 * Positioned fixed in the background behind all layout content with zero pointer interception.
 */
export function SiteDitherBackground({
  intensity = 0.20,
  scale = 1.6,
  palette = ["--background", "--ember"],
  matrix = "bayer8",
  className = "fixed inset-0 pointer-events-none -z-20 overflow-hidden",
  ...props
}: SiteDitherBackgroundProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isConstrained =
      (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false) ||
      (typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 2);

    if (isConstrained) {
      return;
    }

    const initShader = () => {
      if ("requestIdleCallback" in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
          () => setReady(true),
          { timeout: 3500 }
        );
      } else {
        setTimeout(() => setReady(true), 1500);
      }
    };

    if (document.readyState === "complete") {
      initShader();
    } else {
      window.addEventListener("load", initShader, { once: true });
    }
  }, []);

  const uniforms = useMemo(
    () => ({
      uIntensity: intensity,
      uScale: scale,
    }),
    [intensity, scale]
  );

  if (!ready) {
    return (
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-[radial-gradient(ellipse_80%_60%_at_80%_15%,rgba(236,137,76,0.08),transparent_75%)]"
        aria-hidden="true"
      />
    );
  }

  return (
    <DitherShader
      {...props}
      field={FIELD}
      palette={palette}
      matrix={matrix}
      stillTime={4.5}
      uniforms={uniforms}
      className={className}
      fallback={
        <div
          className="fixed inset-0 pointer-events-none -z-20 bg-[radial-gradient(ellipse_80%_60%_at_80%_15%,rgba(236,137,76,0.08),transparent_75%)]"
          aria-hidden="true"
        />
      }
    />
  );
}
