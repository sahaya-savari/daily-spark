import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get hex color code for a list color value
 */
export const getColorFromListColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    fire: '#ff6b35',
    ocean: '#0ea5e9',
    forest: '#22c55e',
    sunset: '#f97316',
    purple: '#a855f7',
    rose: '#ec4899',
  };
  return colorMap[color] || '#ff6b35';
};
