import React from "react";
import {
  MaterialAdd,
  MaterialArchive,
  MaterialArrowBack,
  MaterialArrowForward,
  MaterialBarChart,
  MaterialBolt,
  MaterialBook,
  MaterialCalendarToday,
  MaterialCheck,
  MaterialCheckCircle,
  MaterialChecklist,
  MaterialChevronDown,
  MaterialChevronLeft,
  MaterialChevronRight,
  MaterialChevronUp,
  MaterialClock,
  MaterialClose,
  MaterialCode,
  MaterialDelete,
  MaterialDownload,
  MaterialFlame,
  MaterialHeart,
  MaterialHome,
  MaterialIconProps,
  MaterialLightbulb,
  MaterialLock,
  MaterialMoon,
  MaterialMusic,
  MaterialNotifications,
  MaterialPalette,
  MaterialPause,
  MaterialPen,
  MaterialPlayArrow,
  MaterialQrCode,
  MaterialRemove,
  MaterialRestore,
  MaterialSearch,
  MaterialSettings,
  MaterialShare,
  MaterialShieldCheck,
  MaterialSmartphone,
  MaterialSparkles,
  MaterialStar,
  MaterialStorage,
  MaterialSun,
  MaterialTrophy,
  MaterialTune,
  MaterialInfo,
  MaterialUpload,
  MaterialWarning,
  createMaterialIcon,
} from "./material-icon";

export type PixelIconProps = MaterialIconProps;

// Additional Material Design icons
export const MaterialMenu = createMaterialIcon("M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z");
export const MaterialArrowDownward = createMaterialIcon("M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z");
export const MaterialBugReport = createMaterialIcon(
  "M19 8h-1.81a5.985 5.985 0 0 0-1.82-1.96l.93-.93a.996.996 0 1 0-1.41-1.41l-1.47 1.47C12.83 5.06 12.18 5 11.5 5s-1.33.06-1.92.17L8.11 3.7a.996.996 0 1 0-1.41 1.41l.93.93C6.75 6.64 6 7.74 5.81 9H4a1 1 0 1 0 0 2h1.53c-.02.33-.03.66-.03 1s.01.67.03 1H4a1 1 0 1 0 0 2h1.81c.67 1.54 1.87 2.79 3.39 3.44L8.11 20.3a.996.996 0 1 0 1.41 1.41l1.47-1.47c.67.12 1.35.18 2.02.18.67 0 1.35-.06 2.02-.18l1.47 1.47a.996.996 0 1 0 1.41-1.41l-1.11-1.86c1.52-.65 2.72-1.9 3.39-3.44H20a1 1 0 1 0 0-2h-1.53c.02-.33.03-.66.03-1s-.01-.67-.03-1H20a1 1 0 1 0 0-2z"
);
export const MaterialAndroid = createMaterialIcon(
  "M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h4v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 4.26 6 6.01 6 8h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"
);
export const MaterialGithub = createMaterialIcon(
  "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
);

// Map Pixel* names directly to official Google Material Design Icons
export const PixelHome = MaterialHome;
export const PixelCheckList = MaterialChecklist;
export const PixelPlus = MaterialAdd;
export const PixelChart = MaterialBarChart;
export const PixelSettings = MaterialSettings;
export const PixelCalendar = MaterialCalendarToday;
export const PixelFire = MaterialFlame;
export const PixelStar = MaterialStar;
export const PixelCheck = MaterialCheck;
export const PixelLock = MaterialLock;
export const PixelTrophy = MaterialTrophy;
export const PixelDownload = MaterialDownload;
export const PixelGithub = MaterialGithub;
export const PixelShieldCheck = MaterialShieldCheck;
export const PixelBug = MaterialBugReport;
export const PixelMenu = MaterialMenu;
export const PixelClose = MaterialClose;
export const PixelClock = MaterialClock;
export const PixelAndroid = MaterialAndroid;
export const PixelSparkles = MaterialSparkles;
export const PixelBolt = MaterialBolt;
export const PixelCheckCircle = MaterialCheckCircle;
export const PixelSearch = MaterialSearch;
export const PixelArrowRight = MaterialArrowForward;
export const PixelChevronDown = MaterialChevronDown;
export const PixelArrowDown = MaterialArrowDownward;
export const PixelHeart = MaterialHeart;
export const PixelSun = MaterialSun;
export const PixelMoon = MaterialMoon;
export const PixelBook = MaterialBook;
export const PixelLightbulb = MaterialLightbulb;
export const PixelCode = MaterialCode;
export const PixelMusic = MaterialMusic;
export const PixelNotebook = MaterialBook;
export const PixelPen = MaterialPen;
export const PixelChevronLeft = MaterialChevronLeft;
export const PixelChevronRight = MaterialChevronRight;
export const PixelChevronUp = MaterialChevronUp;
export const PixelArrowLeft = MaterialArrowBack;
export const PixelTrash = MaterialDelete;
export const PixelArchive = MaterialArchive;
export const PixelRotateCcw = MaterialRestore;
export const PixelPlay = MaterialPlayArrow;
export const PixelPause = MaterialPause;
export const PixelMinus = MaterialRemove;
export const PixelBell = MaterialNotifications;
export const PixelShare = MaterialShare;
export const PixelAlertTriangle = MaterialWarning;
export const PixelCog = MaterialSettings;
export const PixelUpload = MaterialUpload;
export const PixelQrCode = MaterialQrCode;
export const PixelSmartphone = MaterialSmartphone;
export const PixelPalette = MaterialPalette;
export const PixelTune = MaterialTune;
export const PixelStorage = MaterialStorage;
export const PixelInfo = MaterialInfo;
