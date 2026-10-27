"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";

const DEFAULT_SPARK_COLORS = [
  "oklch(0.755 0.135 52.1)", // Sunlit apricot / ember
  "oklch(0.85 0.12 70)",     // Warm gold glow
  "oklch(0.978 0.004 56.4)",  // Pearl highlight
  "oklch(0.769 0.087 60.2)",  // Brass
  "oklch(0.755 0.135 52.1)",  // Ember
];

const BAND_HALF = 18;
const SWEEP_START = -BAND_HALF;
const SWEEP_END = 100 + BAND_HALF;

const sweepEase = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

function buildGradient(pos: number, colors: string[], textColor: string) {
  const bandStart = pos - BAND_HALF;
  const bandEnd = pos + BAND_HALF;

  if (bandStart >= 100) {
    return `linear-gradient(90deg, ${textColor}, ${textColor})`;
  }
  const n = colors.length;
  const parts: string[] = [];

  if (bandStart > 0) {
    parts.push(`${textColor} 0%`, `${textColor} ${bandStart.toFixed(2)}%`);
  }

  colors.forEach((c, i) => {
    const pct = n === 1 ? pos : bandStart + (i / (n - 1)) * BAND_HALF * 2;
    parts.push(`${c} ${pct.toFixed(2)}%`);
  });

  if (bandEnd < 100) {
    parts.push(`transparent ${bandEnd.toFixed(2)}%`, `transparent 100%`);
  }

  return `linear-gradient(90deg, ${parts.join(", ")})`;
}

function measureWidths(el: HTMLElement, texts: string[]) {
  const ghost = el.cloneNode() as HTMLElement;
  Object.assign(ghost.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    width: "auto",
    whiteSpace: "nowrap",
  });
  el.parentElement!.appendChild(ghost);
  const widths = texts.map((t) => {
    ghost.textContent = t;
    return ghost.getBoundingClientRect().width;
  });
  ghost.remove();
  return widths;
}

export interface DiaTextRevealProps
  extends Omit<
    HTMLMotionProps<"span">,
    "ref" | "children" | "style" | "animate" | "transition" | "color"
  > {
  text: string | string[];
  colors?: string[];
  textColor?: string;
  duration?: number;
  delay?: number;
  repeat?: boolean;
  repeatDelay?: number;
  startOnView?: boolean;
  once?: boolean;
  className?: string;
  fixedWidth?: boolean;
}

export function DiaTextReveal({
  text,
  colors = DEFAULT_SPARK_COLORS,
  textColor = "currentColor",
  duration = 1.6,
  delay = 0.1,
  repeat = false,
  repeatDelay = 1,
  startOnView = true,
  once = false,
  className,
  fixedWidth = false,
  ...props
}: DiaTextRevealProps) {
  const texts = Array.isArray(text) ? text : [text];
  const isMulti = texts.length > 1;
  const prefersReducedMotion = useReducedMotion();

  const spanRef = useRef<HTMLSpanElement>(null);
  const optsRef = useRef({
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
  });
  optsRef.current = {
    colors,
    textColor,
    duration,
    delay,
    repeat,
    repeatDelay,
    texts,
  };

  const indexRef = useRef(0);
  const hasPlayedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const playRef = useRef<() => void>(null!);
  const stopRef = useRef<(() => void) | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredWidths, setMeasuredWidths] = useState<number[]>([]);

  const sweepPos = useMotionValue(SWEEP_START);

  const backgroundImage = useTransform(sweepPos, (pos) =>
    buildGradient(pos, optsRef.current.colors, optsRef.current.textColor),
  );

  const isInView = useInView(spanRef, { once, amount: 0.1 });

  useEffect(() => {
    const el = spanRef.current;
    if (!el || !isMulti) return;
    setMeasuredWidths(measureWidths(el, texts));
  }, [Array.isArray(text) ? text.join("\0") : text]);

  playRef.current = () => {
    const { duration: dur, delay: dly, repeat: rep, repeatDelay: repDly, texts: txts } =
      optsRef.current;

    sweepPos.set(SWEEP_START);

    const controls = animate(sweepPos, SWEEP_END, {
      duration: dur,
      delay: dly,
      ease: sweepEase,
      onComplete() {
        if (!rep) return;
        timerRef.current = setTimeout(() => {
          const next = (indexRef.current + 1) % txts.length;
          indexRef.current = next;
          setActiveIndex(next);
          playRef.current();
        }, repDly * 1000);
      },
    });

    stopRef.current = () => controls.stop();
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      sweepPos.set(SWEEP_END);
      return;
    }
    if (startOnView && !isInView) return;
    if (once && hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    playRef.current();

    return () => {
      stopRef.current?.();
      clearTimeout(timerRef.current);
    };
  }, [isInView, startOnView, once, prefersReducedMotion, sweepPos]);

  const fixedW =
    isMulti && fixedWidth && measuredWidths.length > 0
      ? Math.max(...measuredWidths)
      : undefined;

  const animatedW =
    isMulti && !fixedWidth && measuredWidths[activeIndex] != null
      ? measuredWidths[activeIndex]
      : undefined;

  return (
    <motion.span
      ref={spanRef}
      className={cn("inline-block align-bottom leading-[100%] text-inherit", className)}
      style={{
        transform: "translateY(-2px)",
        color: "transparent",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        backgroundSize: "100% 100%",
        backgroundImage,
        ...(isMulti && {
          overflow: "hidden",
          whiteSpace: "nowrap",
          verticalAlign: "text-center",
          ...(fixedW != null && { width: fixedW }),
        }),
      }}
      animate={animatedW != null ? { width: animatedW } : undefined}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {texts[activeIndex]}
    </motion.span>
  );
}
