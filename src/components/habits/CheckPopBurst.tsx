import React, { useEffect } from "react";

export interface CheckPopBurstProps {
  x: number;
  y: number;
  onComplete: () => void;
}

/**
 * CheckPopBurst renders an 8-particle burst in tactile ember colors
 * expanding radially from the check-in coordinate (x, y) over 450ms.
 *
 * Conforms strictly to PROJECT.md § Habit Interactions ↔ Visual Effects
 * and src/test/fixtures/contracts.tsx (resolveCheckPopBurst).
 */
export const CheckPopBurst: React.FC<CheckPopBurstProps> = ({ x, y, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 450);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      data-testid="check-pop-burst"
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          data-testid="pop-particle"
          className="absolute size-1.5 rounded-full bg-ember animate-ping motion-reduce:animate-none"
          style={{
            transform: `rotate(${i * 45}deg) translate(18px)`,
          }}
        />
      ))}
    </div>
  );
};

export default CheckPopBurst;

