import React from "react";

export interface AnimatedCircularProgressBarProps {
  value: number;
  max?: number;
  min?: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

/**
 * AnimatedCircularProgressBar renders an accessible circular SVG progress gauge
 * indicating completion fraction (e.g. 1/5 done) with smooth stroke transitions.
 *
 * Conforms to PROJECT.md § Progress Surfaces ↔ Habit Store
 * and contracts.tsx:ReferenceAnimatedCircularProgressBar.
 */
export const AnimatedCircularProgressBar: React.FC<AnimatedCircularProgressBarProps> = ({
  value,
  max = 100,
  min = 0,
  gaugePrimaryColor = "var(--ember, #8B5CF6)",
  gaugeSecondaryColor = "rgba(255,255,255,0.1)",
  size = 100,
  strokeWidth = 10,
  children,
}) => {
  const normalizedMax = Math.max(min + 1, max);
  const clamped = Math.min(normalizedMax, Math.max(min, value));
  const percentage = ((clamped - min) / (normalizedMax - min)) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      data-testid="animated-circular-progress"
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={normalizedMax}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugeSecondaryColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          data-testid="circular-progress-indicator"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugePrimaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
};

export default AnimatedCircularProgressBar;

