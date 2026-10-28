import React from "react";
import { cn } from "@/lib/utils";

export interface PixelIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function PixelHome({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m22,11v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h3v10h1v1h4v-7h6v7h4v-1h1v-10h3v-1h-1Zm-3,0h-1v10h-1v-6h-1v-1h-8v1h-1v6h-1v-10h-1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h2v1h1v1h1v1h1v1h1v1h1v1h1v1Z" />
    </svg>
  );
}

export function PixelCheckList({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <rect x="9" y="18" width="14" height="2" />
      <rect x="9" y="12" width="14" height="2" />
      <rect x="9" y="6" width="14" height="2" />
      <polygon points="7 15 8 15 8 17 7 17 7 18 6 18 6 19 5 19 5 20 4 20 4 21 3 21 3 20 2 20 2 19 1 19 1 17 2 17 2 18 3 18 3 19 4 19 4 18 5 18 5 17 6 17 6 16 7 16 7 15" />
      <polygon points="8 9 8 11 7 11 7 12 6 12 6 13 5 13 5 14 4 14 4 15 3 15 3 14 2 14 2 13 1 13 1 11 2 11 2 12 3 12 3 13 4 13 4 12 5 12 5 11 6 11 6 10 7 10 7 9 8 9" />
      <polygon points="8 3 8 5 7 5 7 6 6 6 6 7 5 7 5 8 4 8 4 9 3 9 3 8 2 8 2 7 1 7 1 5 2 5 2 6 3 6 3 7 4 7 4 6 5 6 5 5 6 5 6 4 7 4 7 3 8 3" />
    </svg>
  );
}

export function PixelPlus({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="23 11 23 13 13 13 13 23 11 23 11 13 1 13 1 11 11 11 11 1 13 1 13 11 23 11" />
    </svg>
  );
}

export function PixelChart({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="22 5 22 12 21 12 21 8 19 8 19 9 18 9 18 10 17 10 17 11 16 11 16 12 15 12 15 13 14 13 14 14 13 14 13 13 12 13 12 12 11 12 11 11 10 11 10 10 9 10 9 11 8 11 8 12 7 12 7 13 6 13 6 11 7 11 7 10 8 10 8 9 9 9 9 8 10 8 10 9 11 9 11 10 12 10 12 11 13 11 13 12 14 12 14 11 15 11 15 10 16 10 16 9 17 9 17 8 18 8 18 7 19 7 19 6 15 6 15 5 22 5" />
      <polygon points="23 18 23 20 2 20 2 19 1 19 1 4 3 4 3 18 23 18" />
    </svg>
  );
}

export function PixelSettings({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m21,10v-1h-1v-2h1v-2h-1v-1h-1v-1h-2v1h-2v-1h-1V1h-4v2h-1v1h-2v-1h-2v1h-1v1h-1v2h1v2h-1v1H1v4h2v1h1v2h-1v2h1v1h1v1h2v-1h2v1h1v2h4v-2h1v-1h2v1h2v-1h1v-1h1v-2h-1v-2h1v-1h2v-4h-2Zm0,3h-1v1h-1v1h-1v2h1v2h-2v-1h-2v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-2v1h-2v-2h1v-2h-1v-1h-1v-1h-1v-2h1v-1h1v-1h1v-2h-1v-2h2v1h2v-1h1v-1h1v-1h2v1h1v1h1v1h2v-1h2v2h-1v2h1v1h1v1h1v2Z" />
      <path d="m16,10v-1h-1v-1h-1v-1h-4v1h-1v1h-1v1h-1v4h1v1h1v1h1v1h4v-1h1v-1h1v-1h1v-4h-1Zm-1,4h-1v1h-4v-1h-1v-4h1v-1h4v1h1v4Z" />
    </svg>
  );
}

export function PixelCalendar({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <rect x="6" y="1" width="2" height="6" />
      <rect x="9" y="4" width="6" height="2" />
      <rect x="16" y="1" width="2" height="6" />
      <path d="M22,5V4H19V6h2V9H3V6H5V4H2V5H1V22H2v1H22V22h1V5ZM21,21H3V11H21Z" />
    </svg>
  );
}

export function PixelFire({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m19,13v-3h-1v-1h-1v-3h-1v-2h-1v-1h-1v-1h-1v-1h-2v1h1v2h-1v2h-1v1h-1v1h-1v1h-1v1h-1v3h1v2h-1v-1h-1v-2h-1v2h-1v3h1v2h1v1h1v1h1v1h1v1h8v-1h1v-1h1v-1h1v-2h1v-5h-1Zm-2,7h-1v1h-2v1h-4v-1h-1v-4h1v-1h1v-1h1v-1h1v-3h-1v-1h-1v-1h1v1h2v2h1v5h-1v2h1v-1h1v-1h1v3Z" />
    </svg>
  );
}

export function PixelStar({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="23 8 23 10 22 10 22 11 21 11 21 12 20 12 20 13 19 13 19 14 18 14 18 19 19 19 19 23 17 23 17 22 15 22 15 21 13 21 13 20 11 20 11 21 9 21 9 22 7 22 7 23 5 23 5 19 6 19 6 14 5 14 5 13 4 13 4 12 3 12 3 11 2 11 2 10 1 10 1 8 8 8 8 6 9 6 9 4 10 4 10 2 11 2 11 1 13 1 13 2 14 2 14 4 15 4 15 6 16 6 16 8 23 8" />
    </svg>
  );
}

export function PixelCheck({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="22 4 22 6 21 6 21 7 20 7 20 8 19 8 19 9 18 9 18 10 17 10 17 11 16 11 16 12 15 12 15 13 14 13 14 14 13 14 13 15 12 15 12 16 11 16 11 17 10 17 10 18 8 18 8 17 7 17 7 16 6 16 6 15 5 15 5 14 4 14 4 13 3 13 3 12 2 12 2 10 4 10 4 11 5 11 5 12 6 12 6 13 7 13 7 14 8 14 8 15 10 15 10 14 11 14 11 13 12 13 12 12 13 12 13 11 14 11 14 10 15 10 15 9 16 9 16 8 17 8 17 7 18 7 18 6 19 6 19 5 20 5 20 4 22 4" />
    </svg>
  );
}

export function PixelLock({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m21,12v-1h-3v-6h-1v-2h-1v-1h-2v-1h-4v1h-2v1h-1v2h-1v6h-3v1h-1v10h1v1h18v-1h1v-10h-1Zm-6-1h-6v-6h1v-1h4v1h1v6Z" />
    </svg>
  );
}

export function PixelTrophy({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5ZM5,12v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1h-2v-1h-1Zm16-3h-1v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3Z" />
    </svg>
  );
}
