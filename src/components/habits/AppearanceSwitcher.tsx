import React, { useState, useEffect } from "react";
import { Check, Sparkles, Sun, Moon, Palette } from "lucide-react";
import {
  type ThemeMode,
  THEME_CONFIGS,
  getStoredTheme,
  setStoredTheme,
  applyThemeToDocument,
} from "@/lib/habits/appearance";
import { useHabitStore, habitActions } from "@/lib/habits/store";
import { calculateCircadianWarmth } from "@/lib/habits/circadianGlide";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AppearanceSwitcherProps {
  className?: string;
}

export const AppearanceSwitcher: React.FC<AppearanceSwitcherProps> = ({ className }) => {
  const { settings } = useHabitStore();
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() => getStoredTheme());
  const [isGlideEnabled, setIsGlideEnabled] = useState<boolean>(
    () => settings.solarCircadianGlide !== false
  );

  useEffect(() => {
    const warmth = isGlideEnabled ? calculateCircadianWarmth() : 0;
    applyThemeToDocument(currentMode, warmth);
  }, [currentMode, isGlideEnabled]);

  const handleSelectTheme = (mode: ThemeMode) => {
    setCurrentMode(mode);
    setStoredTheme(mode);
    habitActions.updateSettings({ themeMode: mode });
  };

  const handleToggleGlide = (enabled: boolean) => {
    setIsGlideEnabled(enabled);
    habitActions.updateSettings({ solarCircadianGlide: enabled });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="kicker">Theme &amp; Aesthetics</p>
          <h3 className="font-display text-base font-bold text-foreground">Tri-Modal Appearance</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-faint">
          <Palette className="size-3 text-ember" /> 100% Offline
        </span>
      </div>

      {/* 3 Interactive Theme Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["classic", "minimal", "expressive"] as ThemeMode[]).map((mode) => {
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

              {/* Mini visual mockup box */}
              <div
                className="mt-3 p-2.5 rounded-xl border border-white/10 text-xs space-y-1.5"
                style={{
                  backgroundColor: cfg.bg,
                  color: cfg.fg,
                  borderRadius: cfg.radius,
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
                <div
                  className="h-1.5 rounded-full overflow-hidden bg-white/10"
                >
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
  );
};
