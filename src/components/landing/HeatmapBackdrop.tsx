import React, { useMemo } from "react";

/**
 * Ambient rounded-tile matrix backdrop inspired by habit activity heatmaps.
 * Generates deterministic tiles with varying sunlit apricot / smoked slate opacities.
 */
export const HeatmapBackdrop = React.memo(function HeatmapBackdrop() {
  const rows = 12;
  const cols = 24;

  const cells = useMemo(() => {
    const list: number[] = [];
    let seed = 42;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        seed = (seed * 9301 + 49297) % 233280;
        const rand = seed / 233280;
        // Distribute activity density more prominently in the center-right behind the demo phone
        const distFromCenter = Math.hypot((c - 16) / cols, (r - 6) / rows);
        const threshold = 1 - distFromCenter * 0.8;
        if (rand < 0.45) {
          list.push(0); // empty dark tile
        } else if (rand < 0.65) {
          list.push(1); // faint ember
        } else if (rand < 0.85 && threshold > 0.4) {
          list.push(2); // medium apricot
        } else if (threshold > 0.5) {
          list.push(3); // bright sunlit apricot
        } else {
          list.push(1);
        }
      }
    }
    return list;
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden max-w-full [contain:strict] [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black_25%,transparent_80%)]"
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${cols * 34} ${rows * 34}`}
        className="w-full max-w-[1100px] h-auto opacity-60"
        aria-hidden="true"
      >
        {cells.map((level, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = c * 34;
          const y = r * 34;
          const fill =
            level === 0
              ? "rgba(255, 255, 255, 0.03)"
              : level === 1
              ? "color-mix(in srgb, var(--ember) 16%, transparent)"
              : level === 2
              ? "color-mix(in srgb, var(--ember) 45%, transparent)"
              : "color-mix(in srgb, var(--ember) 85%, transparent)";
          const stroke =
            level === 0
              ? "rgba(255, 255, 255, 0.04)"
              : level === 1
              ? "color-mix(in srgb, var(--ember) 22%, transparent)"
              : level === 2
              ? "color-mix(in srgb, var(--ember) 55%, transparent)"
              : "color-mix(in srgb, var(--ember) 90%, transparent)";
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={24}
              height={24}
              rx={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
          );
        })}
      </svg>
    </div>
  );
});
