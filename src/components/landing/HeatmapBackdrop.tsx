import { useMemo } from "react";

/**
 * Ambient rounded-tile matrix backdrop inspired by habit activity heatmaps.
 * Generates deterministic tiles with varying sunlit apricot / smoked slate opacities.
 */
export function HeatmapBackdrop() {
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
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,black_25%,transparent_80%)]"
      aria-hidden="true"
    >
      <div
        className="grid gap-2.5 opacity-60 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((level, i) => (
          <div
            key={i}
            className={`size-5 rounded-[6px] sm:size-7 md:size-8 ${
              level === 0
                ? "border border-white/[0.03] bg-surface/35"
                : level === 1
                ? "border border-ember/15 bg-ember/15"
                : level === 2
                ? "border border-ember/30 bg-ember/45 shadow-[0_0_12px_rgba(242,149,89,0.2)]"
                : "border border-ember/50 bg-ember/80 shadow-[0_0_18px_rgba(242,149,89,0.35)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
