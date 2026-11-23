import React, { useState, useEffect } from "react";
import { Check, Sun, Moon, Palette, Type, LayoutGrid, Sparkles } from "lucide-react";
import {
  type ThemeMode,
  THEME_CONFIGS,
  getStoredTheme,
  setStoredTheme,
  applyThemeToDocument,
  applyStoredInterfacePreferences,
} from "@/lib/habits/appearance";
import { useHabitStore, habitActions } from "@/lib/habits/store";
import { calculateCircadianWarmth } from "@/lib/habits/circadianGlide";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type TypographyOption = "modern-sans" | "humanist-display" | "compact-mono";
export type DensityOption = "comfortable" | "compact";
export type IconStyleOption = "signature-spark" | "minimal-modern" | "pixel-retro";

interface AppearanceSwitcherProps {
  className?: string;
  defaultTab?: "appearance" | "style";
}

const STORAGE_KEYS = {
  font: "dailyspark_font_style",
  density: "dailyspark_density",
  iconStyle: "dailyspark_icon_style",
};

export const AppearanceSwitcher: React.FC<AppearanceSwitcherProps> = ({
  className,
  defaultTab = "appearance",
}) => {
  const { settings } = useHabitStore();
  const [activeTab, setActiveTab] = useState<"appearance" | "style">(defaultTab);
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() => getStoredTheme());
  const [isGlideEnabled, setIsGlideEnabled] = useState<boolean>(
    () => settings.solarCircadianGlide !== false
  );

  const [font, setFont] = useState<TypographyOption>(() => {
    if (typeof window === "undefined") return "modern-sans";
    return (localStorage.getItem(STORAGE_KEYS.font) as TypographyOption) || "modern-sans";
  });

  const [density, setDensity] = useState<DensityOption>(() => {
    if (typeof window === "undefined") return "comfortable";
    return (localStorage.getItem(STORAGE_KEYS.density) as DensityOption) || "comfortable";
  });

  const [iconStyle, setIconStyle] = useState<IconStyleOption>(() => {
    if (typeof window === "undefined") return "signature-spark";
    return (localStorage.getItem(STORAGE_KEYS.iconStyle) as IconStyleOption) || "signature-spark";
  });

  useEffect(() => {
    const warmth = isGlideEnabled ? calculateCircadianWarmth() : 0;
    applyThemeToDocument(currentMode, warmth);
  }, [currentMode, isGlideEnabled]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    applyStoredInterfacePreferences();
  }, [font, density, iconStyle]);

  const handleSelectTheme = (mode: ThemeMode) => {
    setCurrentMode(mode);
    setStoredTheme(mode);
    habitActions.updateSettings({ themeMode: mode });
  };

  const handleToggleGlide = (enabled: boolean) => {
    setIsGlideEnabled(enabled);
    habitActions.updateSettings({ solarCircadianGlide: enabled });
  };

  const handleSelectFont = (f: TypographyOption) => {
    setFont(f);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.font, f);
    }
  };

  const handleSelectDensity = (d: DensityOption) => {
    setDensity(d);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.density, d);
    }
  };

  const handleSelectIconStyle = (i: IconStyleOption) => {
    setIconStyle(i);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.iconStyle, i);
    }
  };

  // 1. Classic, 2. Expressive, 3. Minimal
  const orderedThemeModes: ThemeMode[] = ["minimal", "classic", "expressive"];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tab Segmented Control */}
      <div className="flex rounded-xl bg-surface-2 p-1 border border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
            activeTab === "appearance"
              ? "bg-surface text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Palette className="size-3.5 text-ember" />
          <span>Appearance</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
            activeTab === "style"
              ? "bg-surface text-foreground shadow-sm font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Type className="size-3.5 text-ember" />
          <span>App Style</span>
        </button>
      </div>

      {activeTab === "appearance" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="kicker">Theme &amp; Aesthetics</p>
              <h3 className="font-display text-base font-bold text-foreground">Tri-Modal Appearance</h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-faint">
              <Palette className="size-3 text-ember" /> 100% Offline
            </span>
          </div>

          {/* 3 Interactive Theme Preview Cards: 1. Classic, 2. Expressive, 3. Minimal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {orderedThemeModes.map((mode) => {
              const cfg = THEME_CONFIGS[mode];
              const isSelected = currentMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSelectTheme(mode)}
                  className={cn(
                    "relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden group",
                    isSelected
                      ? "border-ember bg-surface-2 ring-2 ring-ember/40 shadow-md scale-[1.01]"
                      : "border-border/40 bg-surface hover:bg-surface-2/60"
                  )}
                >
                  {/* Checkmark badge */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-ember text-white shadow-sm">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}

                  <div>
                    <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {cfg.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {cfg.subtitle}
                    </p>
                  </div>

                  {/* Unified Morning Flow card corner radius: rounded-2xl (16px) */}
                  <div
                    className="mt-3 p-2.5 rounded-2xl border border-white/10 text-xs space-y-1.5"
                    style={{
                      backgroundColor: cfg.bg,
                      color: cfg.fg,
                      borderRadius: "16px",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold text-[12px] truncate"
                        style={{ fontFamily: cfg.fontDisplay }}
                      >
                        Morning Flow
                      </span>
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: cfg.accent }}
                      />
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
                      <div
                        className="h-full w-2/3 rounded-full"
                        style={{ backgroundColor: cfg.accent }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Solar Circadian Theme Glide Switch */}
          <div className="rounded-2xl border border-border/40 bg-surface p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                {isGlideEnabled ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </span>
              <div>
                <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  Solar Circadian Theme Glide
                </p>
                <p className="text-[11px] text-faint">
                  Glides night temperature toward warm blue-light-reduced amber (0 GPS requests)
                </p>
              </div>
            </div>
            <Switch
              checked={isGlideEnabled}
              onCheckedChange={handleToggleGlide}
            />
          </div>
        </div>
      ) : (
        /* App Style Tab: Typography, Density, Icon Style */
        <div className="space-y-4">
          <div>
            <p className="kicker">Visual Layout &amp; Type</p>
            <h3 className="font-display text-base font-bold text-foreground">App Style Configuration</h3>
          </div>

          {/* 1. Typography Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Type className="size-3.5 text-ember" /> Typography
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "modern-sans", name: "Modern Sans", desc: "Inter geometric clean" },
                { id: "humanist-display", name: "Humanist", desc: "Mozilla headline editorial" },
                { id: "compact-mono", name: "Compact Mono", desc: "Geist tabular code" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectFont(item.id as TypographyOption)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all cursor-pointer",
                    font === item.id
                      ? "bg-surface-2 border-ember ring-1 ring-ember text-foreground shadow-sm"
                      : "bg-surface border-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <p className="font-bold text-xs">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Display Density */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <LayoutGrid className="size-3.5 text-ember" /> Display Density
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "comfortable", name: "Comfortable", desc: "Roomy touch targets and balanced whitespace" },
                { id: "compact", name: "Compact", desc: "Dense layout showing more habits per screen" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectDensity(item.id as DensityOption)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all cursor-pointer",
                    density === item.id
                      ? "bg-surface-2 border-ember ring-1 ring-ember text-foreground shadow-sm"
                      : "bg-surface border-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <p className="font-bold text-xs">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Icon Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-ember" /> Icon Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "signature-spark", name: "⚡ SparkMark", desc: "Botanical gold spark" },
                { id: "minimal-modern", name: "Minimal", desc: "Clean line geometry" },
                { id: "pixel-retro", name: "Pixel Retro", desc: "16-bit pixel nostalgia" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectIconStyle(item.id as IconStyleOption)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all cursor-pointer",
                    iconStyle === item.id
                      ? "bg-surface-2 border-ember ring-1 ring-ember text-foreground shadow-sm"
                      : "bg-surface border-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <p className="font-bold text-xs">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

