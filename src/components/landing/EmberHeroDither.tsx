"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { DitherShaderProps } from "@/lib/dither";

const DitherShader = lazy(() =>
  import("@/lib/dither").then(({ DitherShader: Shader }) => ({ default: Shader })),
);

/**
 * GLSL continuous tone field for the Daily Spark Hero Ember Aura.
 *
 * Evaluates smooth radial intensity focused behind the hero phone showcase,
 * modulated by low-frequency simplex fbm noise to mimic drifting embers,
 * and softly attenuated on the left so hero typography stays at >7:1 contrast.
 */
const FIELD = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 focus = vec2(uFocus.x * aspect, 1.0 - uFocus.y);

  // Radial falloff from ember focus point
  float dist = length(p - focus);
  float glow = exp(-dist * dist * uTightness);

  // Soft drifting organic ember turbulence
  float drift = fbm(p * uScale + vec2(t * 0.02, -t * 0.015));

  // Attenuate tone under the left-side text column so typography remains razor-sharp
  float textClear = smoothstep(0.1, 0.65, uv.x);
  float bottomFade = smoothstep(0.0, 0.2, uv.y);

  float tone = uIntensity * glow * mix(0.55, 1.2, drift) * mix(0.12, 1.0, textClear) * bottomFade;
  return clamp(tone, 0.0, 1.0);
}
`;

export type EmberHeroDitherProps = Omit<
  DitherShaderProps,
  "field" | "uniforms" | "fallback"
> & {
  /** Focus center of the ember glow [x, y] in 0..1 coordinates. Default [0.65, 0.38]. */
  focus?: readonly [number, number];
  /** Peak dither density tone in [0, 1]. Default 0.75. */
  intensity?: number;
  /** Scale of noise cloud turbulence. Default 2.2. */
  scale?: number;
  /** Falloff tightness of the radial aura. Default 2.6. */
  tightness?: number;
};

/**
 * EmberHeroDither
 *
 * Ambient ordered-dither shader background for the Daily Spark landing hero,
 * built directly on the dithercn engine with Daily Spark's `--ember` theme token.
 */
export function EmberHeroDither({
  focus = [0.65, 0.38],
  intensity = 0.75,
  scale = 2.2,
  tightness = 2.6,
  palette = ["--background", "--ember"],
  matrix = "bayer8",
  className = "pointer-events-none absolute inset-0 -z-10",
  ...props
}: EmberHeroDitherProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isConstrained =
      (window.matchMedia?.("(max-width: 767px) and (pointer: coarse)")?.matches ?? false) ||
      (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false) ||
      (typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 2);

    if (isConstrained) {
      return;
    }

    const initShader = () => {
      if ("requestIdleCallback" in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
          () => setReady(true),
          { timeout: 3000 }
        );
      } else {
        setTimeout(() => setReady(true), 1200);
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
      uFocus: focus,
      uIntensity: intensity,
      uScale: scale,
      uTightness: tightness,
    }),
    [focus, intensity, scale, tightness]
  );

  const fallback = (
    <div
      className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_65%_40%,color-mix(in_srgb,var(--ember)_18%,transparent),transparent_70%)]"
      aria-hidden="true"
    />
  );

  if (!ready) {
    return fallback;
  }

  return (
    <Suspense fallback={fallback}>
      <DitherShader
        {...props}
        field={FIELD}
        palette={palette}
        matrix={matrix}
        stillTime={4.5}
        uniforms={uniforms}
        className={className}
        fallback={fallback}
      />
    </Suspense>
  );
}
