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

export function PixelDownload({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="5 10 4 10 4 8 6 8 6 9 7 9 7 10 8 10 8 11 9 11 9 12 10 12 10 13 11 13 11 1 13 1 13 13 14 13 14 12 15 12 15 11 16 11 16 10 17 10 17 9 18 9 18 8 20 8 20 10 19 10 19 11 18 11 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 11 17 11 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 12 6 12 6 11 5 11 5 10" />
      <rect x="2" y="21" width="20" height="2" />
    </svg>
  );
}

export function PixelGithub({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="23 9 23 15 22 15 22 17 21 17 21 19 20 19 20 20 19 20 19 21 18 21 18 22 16 22 16 23 15 23 15 18 14 18 14 17 15 17 15 16 17 16 17 15 18 15 18 14 19 14 19 9 18 9 18 6 16 6 16 7 15 7 15 8 14 8 14 7 10 7 10 8 9 8 9 7 8 7 8 6 6 6 6 9 5 9 5 14 6 14 6 15 7 15 7 16 9 16 9 18 7 18 7 17 6 17 6 16 4 16 4 17 5 17 5 19 6 19 6 20 9 20 9 23 8 23 8 22 6 22 6 21 5 21 5 20 4 20 4 19 3 19 3 17 2 17 2 15 1 15 1 9 2 9 2 7 3 7 3 5 4 5 4 4 5 4 5 3 7 3 7 2 9 2 9 1 15 1 15 2 17 2 17 3 19 3 19 4 20 4 20 5 21 5 21 7 22 7 22 9 23 9" />
    </svg>
  );
}

export function PixelShieldCheck({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m22,10v-1h-1v-4h-1v-1h-1v-1h-4v-1h-1v-1h-4v1h-1v1h-4v1h-1v1h-1v4h-1v1h-1v4h1v1h1v4h1v1h1v1h4v1h1v1h4v-1h1v-1h4v-1h1v-1h1v-4h1v-1h1v-4h-1Zm-1,4h-1v1h-1v4h-4v1h-1v1h-4v-1h-1v-1h-4v-4h-1v-1h-1v-4h1v-1h1v-4h4v-1h1v-1h4v1h1v1h4v4h1v1h1v4Z" />
      <polygon points="17 9 17 11 16 11 16 12 15 12 15 13 14 13 14 14 13 14 13 15 12 15 12 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 11 8 11 8 10 9 10 9 11 10 11 10 12 12 12 12 11 13 11 13 10 14 10 14 9 15 9 15 8 16 8 16 9 17 9" />
    </svg>
  );
}

export function PixelBug({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="9 6 8 6 8 4 9 4 9 3 11 3 11 2 13 2 13 3 15 3 15 4 16 4 16 6 15 6 15 7 9 7 9 6" />
      <path d="M18,12V10h1V9h1V8h1V6H19V7H18V8H17V9H7V8H6V7H5V6H3V8H4V9H5v1H6v2H1v2H6v3H5v1H4v1H3v2H5V20H6V19H7v1H8v1h3v1h2V21h3V20h1V19h1v1h1v1h2V19H20V18H19V17H18V14h5V12Zm-3,6v1H13V13H11v6H9V18H8V12H9V11h6v1h1v6Z" />
    </svg>
  );
}

export function PixelMenu({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <rect x="1" y="11" width="22" height="2" />
      <rect x="1" y="19" width="22" height="2" />
      <rect x="1" y="3" width="22" height="2" />
    </svg>
  );
}

export function PixelClose({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m22,2v-1H2v1h-1v20h1v1h20v-1h1V2h-1Zm-1,19H3V3h18v18Z" />
      <polygon points="15 13 16 13 16 14 17 14 17 15 18 15 18 16 17 16 17 17 16 17 16 18 15 18 15 17 14 17 14 16 13 16 13 15 11 15 11 16 10 16 10 17 9 17 9 18 8 18 8 17 7 17 7 16 6 16 6 15 7 15 7 14 8 14 8 13 9 13 9 11 8 11 8 10 7 10 7 9 6 9 6 8 7 8 7 7 8 7 8 6 9 6 9 7 10 7 10 8 11 8 11 9 13 9 13 8 14 8 14 7 15 7 15 6 16 6 16 7 17 7 17 8 18 8 18 9 17 9 17 10 16 10 16 11 15 11 15 13" />
    </svg>
  );
}

export function PixelClock({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m22,9v-2h-1v-2h-1v-1h-1v-1h-2v-1h-2v-1h-6v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h1v-2h1v-6h-1Zm-1,6h-1v2h-1v2h-2v1h-2v1h-6v-1h-2v-1h-2v-2h-1v-2h-1v-6h1v-2h1v-2h2v-1h2v-1h6v1h2v1h2v2h1v2h1v6Z" />
      <polygon points="16 15 16 16 15 16 15 17 14 17 14 16 13 16 13 15 12 15 12 14 11 14 11 5 13 5 13 13 14 13 14 14 15 14 15 15 16 15" />
    </svg>
  );
}

export function PixelAndroid({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <rect x="5" y="10" width="1" height="2" />
      <rect x="18" y="10" width="1" height="2" />
      <path d="m22,20v-2h-1v-1h-1v-1h-1v-1h-1v-3h-1v2h-2v-1h-6v1h-2v-2h-1v3h-1v1h-1v1h-1v1h-1v2h-1v3h22v-3h-1Zm-14-2v2h-2v-2h2Zm8,0h2v2h-2v-2Z" />
    </svg>
  );
}

export function PixelSparkles({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="23 5 23 6 21 6 21 7 20 7 20 9 19 9 19 7 18 7 18 6 16 6 16 5 18 5 18 4 19 4 19 2 20 2 20 4 21 4 21 5 23 5" />
      <polygon points="23 18 23 19 21 19 21 20 20 20 20 22 19 22 19 20 18 20 18 19 16 19 16 18 18 18 18 17 19 17 19 15 20 15 20 17 21 17 21 18 23 18" />
      <path d="M15,11V10H13V9H12V8H11V6H10V4H8V6H7V8H6V9H5v1H3v1H1v2H3v1H5v1H6v1H7v2H8v2h2V18h1V16h1V15h1V14h2V13h2V11Zm-3,2v1H11v1H10v2H8V15H7V14H6V13H4V11H6V10H7V9H8V7h2V9h1v1h1v1h2v2Z" />
    </svg>
  );
}

export function PixelBolt({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m14,10v-4h1v-3h1V1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h7v4h-1v3h-1v2h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h-7Zm4,2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-5h-5v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v5h5v1Z" />
    </svg>
  );
}

export function PixelCheckCircle({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="19 9 19 10 18 10 18 11 17 11 17 12 16 12 16 13 15 13 15 14 14 14 14 15 13 15 13 16 12 16 12 17 10 17 10 16 9 16 9 15 8 15 8 14 7 14 7 13 6 13 6 12 7 12 7 11 8 11 8 12 9 12 9 13 10 13 10 14 12 14 12 13 13 13 13 12 14 12 14 11 15 11 15 10 16 10 16 9 17 9 17 8 18 8 18 9 19 9" />
      <path d="m22,9v-2h-1v-2h-1v-1h-1v-1h-2v-1h-2v-1h-6v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h1v-2h1v-6h-1Zm-2,6v2h-1v2h-2v1h-2v1h-6v-1h-2v-1h-2v-2h-1v-2h-1v-6h1v-2h1v-2h2v-1h2v-1h6v1h2v1h2v2h1v2h1v6h-1Z" />
    </svg>
  );
}

export function PixelSearch({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <path d="m22,20v-1h-1v-1h-1v-1h-1v-1h-2v-1h1v-2h1v-6h-1v-2h-1v-1h-1v-1h-1v-1h-2v-1h-6v1h-2v1h-1v1h-1v1h-1v2h-1v6h1v2h1v1h1v1h1v1h2v1h6v-1h2v-1h1v2h1v1h1v1h1v1h1v1h2v-1h1v-2h-1Zm-10-5v1h-4v-1h-2v-1h-1v-2h-1v-4h1v-2h1v-1h2v-1h4v1h2v1h1v2h1v4h-1v2h-1v1h-2Z" />
    </svg>
  );
}

export function PixelArrowRight({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="23 11 23 13 22 13 22 14 21 14 21 15 20 15 20 16 19 16 19 17 18 17 18 18 17 18 17 19 16 19 16 20 15 20 15 21 14 21 14 22 13 22 13 23 12 23 12 22 11 22 11 21 12 21 12 20 13 20 13 19 14 19 14 18 15 18 15 17 16 17 16 16 17 16 17 15 18 15 18 14 19 14 19 13 1 13 1 11 19 11 19 10 18 10 18 9 17 9 17 8 16 8 16 7 15 7 15 6 14 6 14 5 13 5 13 4 12 4 12 3 11 3 11 2 12 2 12 1 13 1 13 2 14 2 14 3 15 3 15 4 16 4 16 5 17 5 17 6 18 6 18 7 19 7 19 8 20 8 20 9 21 9 21 10 22 10 22 11 23 11" />
    </svg>
  );
}

export function PixelChevronDown({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="22 6 22 8 21 8 21 9 20 9 20 10 19 10 19 11 18 11 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 11 17 11 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 12 6 12 6 11 5 11 5 10 4 10 4 9 3 9 3 8 2 8 2 6 4 6 4 7 5 7 5 8 6 8 6 9 7 9 7 10 8 10 8 11 9 11 9 12 10 12 10 13 11 13 11 14 13 14 13 13 14 13 14 12 15 12 15 11 16 11 16 10 17 10 17 9 18 9 18 8 19 8 19 7 20 7 20 6 22 6" />
    </svg>
  );
}

export function PixelArrowDown({ className, ...props }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4 inline-block shrink-0", className)}
      {...props}
    >
      <polygon points="23 12 23 13 22 13 22 14 21 14 21 15 20 15 20 16 19 16 19 17 18 17 18 18 17 18 17 19 16 19 16 20 15 20 15 21 14 21 14 22 13 22 13 23 11 23 11 22 10 22 10 21 9 21 9 20 8 20 8 19 7 19 7 18 6 18 6 17 5 17 5 16 4 16 4 15 3 15 3 14 2 14 2 13 1 13 1 12 2 12 2 11 3 11 3 12 4 12 4 13 5 13 5 14 6 14 6 15 7 15 7 16 8 16 8 17 9 17 9 18 10 18 10 19 11 19 11 1 13 1 13 19 14 19 14 18 15 18 15 17 16 17 16 16 17 16 17 15 18 15 18 14 19 14 19 13 20 13 20 12 21 12 21 11 22 11 22 12 23 12" />
    </svg>
  );
}

export function PixelHeart({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <polygon points="23 6 23 11 22 11 22 12 21 12 21 13 20 13 20 14 19 14 19 15 18 15 18 16 17 16 17 17 16 17 16 18 15 18 15 19 14 19 14 20 13 20 13 21 11 21 11 20 10 20 10 19 9 19 9 18 8 18 8 17 7 17 7 16 6 16 6 15 5 15 5 14 4 14 4 13 3 13 3 12 2 12 2 11 1 11 1 6 2 6 2 5 3 5 3 4 4 4 4 3 10 3 10 4 11 4 11 5 13 5 13 4 14 4 14 3 20 3 20 4 21 4 21 5 22 5 22 6 23 6" />
    </svg>
  );
}

export function PixelSun({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <polygon points="17 10 17 14 16 14 16 15 15 15 15 16 14 16 14 17 10 17 10 16 9 16 9 15 8 15 8 14 7 14 7 10 8 10 8 9 9 9 9 8 10 8 10 7 14 7 14 8 15 8 15 9 16 9 16 10 17 10"/>
      <path d="m21,11v-1h1v-1h1v-2h-3v-1h-2v-2h-1V1h-2v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-2v3h-1v2h-2v1H1v2h1v1h1v1h1v2h-1v1h-1v1h-1v2h3v1h2v2h1v3h2v-1h1v-1h1v-1h2v1h1v1h1v1h2v-3h1v-2h2v-1h3v-2h-1v-1h-1v-1h-1v-2h1Zm-3,4h-1v1h-1v1h-1v1h-6v-1h-1v-1h-1v-1h-1v-6h1v-1h1v-1h1v-1h6v1h1v1h1v1h1v6Z"/>
    </svg>
  );
}

export function PixelMoon({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <polygon points="22 17 22 19 21 19 21 20 20 20 20 21 18 21 18 22 16 22 16 23 10 23 10 22 8 22 8 21 6 21 6 20 5 20 5 19 4 19 4 17 3 17 3 15 2 15 2 9 3 9 3 7 4 7 4 5 5 5 5 4 6 4 6 3 8 3 8 2 10 2 10 1 15 1 15 2 13 2 13 3 11 3 11 4 10 4 10 6 9 6 9 8 8 8 8 12 9 12 9 14 10 14 10 16 11 16 11 17 13 17 13 18 15 18 15 19 19 19 19 18 21 18 21 17 22 17"/>
    </svg>
  );
}

export function PixelBook({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <path d="M21,2V1H4V2H3V3H2V21H3v1H4v1H21V22h1V21H21V20H20V17h1V16h1V2ZM18,21H5V20H4V18H5V17H18Z"/>
    </svg>
  );
}

export function PixelLightbulb({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <polygon points="15 18 15 21 14 21 14 22 13 22 13 23 11 23 11 22 10 22 10 21 9 21 9 18 15 18"/>
      <path d="m19,5h-1v-1h-1v-1h-1v-1h-2v-1h-4v1h-2v1h-1v1h-1v1h-1v2h-1v4h1v2h1v1h1v1h1v1h1v1h6v-1h1v-1h1v-1h1v-1h1v-2h1v-4h-1v-2Zm-12,2h1v-1h1v-1h1v-1h3v1h-3v1h-1v1h-1v2h-1v-2Z"/>
    </svg>
  );
}

export function PixelCode({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <polygon points="15 4 16 4 16 6 15 6 15 9 14 9 14 12 13 12 13 14 12 14 12 17 11 17 11 20 10 20 10 21 9 21 9 20 8 20 8 18 9 18 9 15 10 15 10 12 11 12 11 10 12 10 12 7 13 7 13 4 14 4 14 3 15 3 15 4"/>
      <polygon points="23 11 23 13 22 13 22 14 21 14 21 15 20 15 20 16 19 16 19 17 17 17 17 15 18 15 18 14 19 14 19 13 20 13 20 11 19 11 19 10 18 10 18 9 17 9 17 7 19 7 19 8 20 8 20 9 21 9 21 10 22 10 22 11 23 11"/>
      <polygon points="7 7 7 9 6 9 6 10 5 10 5 11 4 11 4 13 5 13 5 14 6 14 6 15 7 15 7 17 5 17 5 16 4 16 4 15 3 15 3 14 2 14 2 13 1 13 1 11 2 11 2 10 3 10 3 9 4 9 4 8 5 8 5 7 7 7"/>
    </svg>
  );
}

export function PixelMusic({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <polygon points="23 1 23 18 22 18 22 19 21 19 21 20 17 20 17 19 16 19 16 18 15 18 15 15 16 15 16 14 17 14 17 13 20 13 20 8 18 8 18 9 15 9 15 10 11 10 11 11 9 11 9 21 8 21 8 22 7 22 7 23 3 23 3 22 2 22 2 21 1 21 1 18 2 18 2 17 3 17 3 16 6 16 6 6 8 6 8 5 11 5 11 4 15 4 15 3 18 3 18 2 21 2 21 1 23 1"/>
    </svg>
  );
}

export function PixelNotebook({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <polygon points="23 3 23 21 22 21 22 22 21 22 21 23 11 23 11 1 21 1 21 2 22 2 22 3 23 3"/>
      <polygon points="9 1 9 23 5 23 5 22 4 22 4 19 1 19 1 17 4 17 4 13 1 13 1 11 4 11 4 7 1 7 1 5 4 5 4 2 5 2 5 1 9 1"/>
    </svg>
  );
}

export function PixelPen({ className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-4 inline-block shrink-0", className)} {...props}>
      <polygon points="17 10 18 10 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 12 17 12 18 11 18 11 19 10 19 10 20 9 20 9 21 8 21 8 22 7 22 7 23 1 23 1 17 2 17 2 16 3 16 3 15 4 15 4 14 5 14 5 13 6 13 6 12 7 12 7 11 8 11 8 10 9 10 9 9 10 9 10 8 11 8 11 7 12 7 12 6 14 6 14 7 15 7 15 8 16 8 16 9 17 9 17 10"/>
      <polygon points="23 5 23 7 22 7 22 8 21 8 21 9 20 9 20 10 19 10 19 9 18 9 18 8 17 8 17 7 16 7 16 6 15 6 15 5 14 5 14 4 15 4 15 3 16 3 16 2 17 2 17 1 19 1 19 2 20 2 20 3 21 3 21 4 22 4 22 5 23 5"/>
    </svg>
  );
}
