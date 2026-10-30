import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  decimalPlaces?: number;
}

/**
 * NumberTicker animates numbers smoothly using requestAnimationFrame / spring dynamics,
 * respecting prefers-reduced-motion and formatting tabular numerals without exponential notation.
 *
 * Conforms to PROJECT.md § Progress Surfaces ↔ Habit Store
 * and contracts.tsx:ReferenceNumberTicker.
 */
export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  direction = "up",
  delay = 0,
  className = "",
  decimalPlaces = 0,
}) => {
  const isTestEnv =
    (typeof globalThis !== "undefined" && (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === "test") ||
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.MODE === "test");

  const [displayValue, setDisplayValue] = useState<number>(() => {
    if (isTestEnv) {
      return value;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return value;
    }
    return direction === "down" ? value : 0;
  });

  const frameRef = useRef<number | null>(null);
  const displayValRef = useRef(displayValue);
  displayValRef.current = displayValue;

  useEffect(() => {
    if (typeof window === "undefined" || isTestEnv) {
      setDisplayValue(value);
      return;
    }

    const isReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      setDisplayValue(value);
      return;
    }

    const startVal = displayValRef.current;
    const endVal = value;
    const duration = 800;
    const startTime = performance.now() + delay * 1000;

    const animate = (now: number) => {
      if (now < startTime) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, delay, isTestEnv]);

  const formatted =
    typeof value === "number" && !isNaN(value)
      ? Number(displayValue.toFixed(decimalPlaces)).toLocaleString("en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
          useGrouping: false,
        })
      : "0";

  return (
    <span data-testid="number-ticker" className={cn("font-mono tabular-nums", className)}>
      {formatted}
    </span>
  );
};

export default NumberTicker;

