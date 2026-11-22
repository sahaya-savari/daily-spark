import React from "react";
import { cn } from "@/lib/utils";
import {
  CalendarCheck2,
  CheckSquare,
  Plus,
  BarChart3,
  Settings,
  Calendar,
  Flame,
  Star,
  Check,
  Lock,
  Trophy,
  Download,
  ShieldCheck,
  X,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Search,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  Heart,
  Sun,
  Moon,
  BookOpen,
  Lightbulb,
  Code2,
  Music,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ArrowLeft,
  Trash2,
  Archive,
  RotateCcw,
  Play,
  Pause,
  Minus,
  Bell,
  Share2,
  AlertTriangle,
  Upload,
  QrCode,
  Smartphone,
  Palette,
  Sliders,
  Database,
  Info,
  Menu,
  Bug,
} from "lucide-react";
import {
  createMaterialIcon,
  type MaterialIconProps,
} from "./material-icon";

export type PixelIconProps = MaterialIconProps;

function createLucideIcon(
  IconComponent: React.ComponentType<{
    className?: string;
    size?: number | string;
    strokeWidth?: number;
  }>
) {
  return function WrappedIcon({ className, size, ...props }: MaterialIconProps) {
    return (
      <IconComponent
        className={cn("inline-block shrink-0", className)}
        size={size ?? 18}
        strokeWidth={2}
        {...(props as Record<string, unknown>)}
      />
    );
  };
}

// Brand-specific vector paths
export const MaterialBugReport = createMaterialIcon(
  "M19 8h-1.81a5.985 5.985 0 0 0-1.82-1.96l.93-.93a.996.996 0 1 0-1.41-1.41l-1.47 1.47C12.83 5.06 12.18 5 11.5 5s-1.33.06-1.92.17L8.11 3.7a.996.996 0 1 0-1.41 1.41l.93.93C6.75 6.64 6 7.74 5.81 9H4a1 1 0 1 0 0 2h1.53c-.02.33-.03.66-.03 1s.01.67.03 1H4a1 1 0 1 0 0 2h1.81c.67 1.54 1.87 2.79 3.39 3.44L8.11 20.3a.996.996 0 1 0 1.41 1.41l1.47-1.47c.67.12 1.35.18 2.02.18.67 0 1.35-.06 2.02-.18l1.47 1.47a.996.996 0 1 0 1.41-1.41l-1.11-1.86c1.52-.65 2.72-1.9 3.39-3.44H20a1 1 0 1 0 0-2h-1.53c.02-.33.03-.66.03-1s-.01-.67-.03-1H20a1 1 0 1 0 0-2z"
);
export const MaterialAndroid = createMaterialIcon(
  "M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h4v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 4.26 6 6.01 6 8h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"
);
export const MaterialGithub = createMaterialIcon(
  "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
);
export const MaterialGitlab = createMaterialIcon(
  "M22.65 14.39L20.6 8.07a.92.92 0 0 0-.35-.45.9.9 0 0 0-.58-.12.9.9 0 0 0-.5.22.92.92 0 0 0-.27.52l-1.46 4.47H6.56l-1.46-4.47a.92.92 0 0 0-.27-.52.9.9 0 0 0-.5-.22.9.9 0 0 0-.58.12.92.92 0 0 0-.35.45L1.35 14.39a.84.84 0 0 0 .3.94l10.05 7.3a.58.58 0 0 0 .6 0l10.05-7.3a.84.84 0 0 0 .3-.94z"
);
export const MaterialFdroid = createMaterialIcon(
  "M16 3a2 2 0 0 0-2 2v1H10V5a2 2 0 0 0-4 0v1H5a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-1V5a2 2 0 0 0-2-2zm-8 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM5 18a1 1 0 0 0-1 1v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1a1 1 0 0 0-1-1H5z"
);
export const MaterialMenu = createMaterialIcon("M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z");

// Export modern, crisp Lucide vector icons
export const PixelHome = createLucideIcon(CalendarCheck2);
export const PixelCheckList = createLucideIcon(CheckSquare);
export const PixelPlus = createLucideIcon(Plus);
export const PixelChart = createLucideIcon(BarChart3);
export const PixelSettings = createLucideIcon(Settings);
export const PixelCalendar = createLucideIcon(Calendar);
export const PixelFire = createLucideIcon(Flame);
export const PixelStar = createLucideIcon(Star);
export const PixelCheck = createLucideIcon(Check);
export const PixelLock = createLucideIcon(Lock);
export const PixelTrophy = createLucideIcon(Trophy);
export const PixelDownload = createLucideIcon(Download);
export const PixelGithub = MaterialGithub;
export const PixelGitlab = MaterialGitlab;
export const PixelFdroid = MaterialFdroid;
export const PixelShieldCheck = createLucideIcon(ShieldCheck);
export const PixelBug = createLucideIcon(Bug);
export const PixelMenu = createLucideIcon(Menu);
export const PixelClose = createLucideIcon(X);
export const PixelClock = createLucideIcon(Clock);
export const PixelAndroid = createLucideIcon(Smartphone);
export const PixelSparkles = createLucideIcon(Sparkles);
export const PixelBolt = createLucideIcon(Zap);
export const PixelCheckCircle = createLucideIcon(CheckCircle2);
export const PixelSearch = createLucideIcon(Search);
export const PixelArrowRight = createLucideIcon(ArrowRight);
export const PixelChevronDown = createLucideIcon(ChevronDown);
export const PixelArrowDown = createLucideIcon(ArrowDown);
export const PixelHeart = createLucideIcon(Heart);
export const PixelSun = createLucideIcon(Sun);
export const PixelMoon = createLucideIcon(Moon);
export const PixelBook = createLucideIcon(BookOpen);
export const PixelLightbulb = createLucideIcon(Lightbulb);
export const PixelCode = createLucideIcon(Code2);
export const PixelMusic = createLucideIcon(Music);
export const PixelNotebook = createLucideIcon(BookOpen);
export const PixelPen = createLucideIcon(Pencil);
export const PixelChevronLeft = createLucideIcon(ChevronLeft);
export const PixelChevronRight = createLucideIcon(ChevronRight);
export const PixelChevronUp = createLucideIcon(ChevronUp);
export const PixelArrowLeft = createLucideIcon(ArrowLeft);
export const PixelTrash = createLucideIcon(Trash2);
export const PixelArchive = createLucideIcon(Archive);
export const PixelRotateCcw = createLucideIcon(RotateCcw);
export const PixelPlay = createLucideIcon(Play);
export const PixelPause = createLucideIcon(Pause);
export const PixelMinus = createLucideIcon(Minus);
export const PixelBell = createLucideIcon(Bell);
export const PixelShare = createLucideIcon(Share2);
export const PixelAlertTriangle = createLucideIcon(AlertTriangle);
export const PixelCog = createLucideIcon(Settings);
export const PixelUpload = createLucideIcon(Upload);
export const PixelQrCode = createLucideIcon(QrCode);
export const PixelSmartphone = createLucideIcon(Smartphone);
export const PixelPalette = createLucideIcon(Palette);
export const PixelTune = createLucideIcon(Sliders);
export const PixelStorage = createLucideIcon(Database);
export const PixelInfo = createLucideIcon(Info);
