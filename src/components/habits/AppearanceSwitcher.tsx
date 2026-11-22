import { useEffect, useState } from "react";
import { Check, Moon, Palette, ShieldCheck, Sun } from "lucide-react";
import {
  EXPRESSIVE_BACKGROUNDS,
  THEME_CONFIGS,
  applyThemeToDocument,
  getStoredTheme,
  setStoredTheme,
  type ThemeMode,
} from "@/lib/habits/appearance";
import { useHabitStore, habitActions } from "@/lib/habits/store";
import { calculateCircadianWarmth } from "@/lib/habits/circadianGlide";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AppearanceSwitcherProps {
  className?: string;
  defaultTab?: "appearance" | "style";
}

const orderedThemeModes: ThemeMode[] = ["minimal", "classic", "expressive"];

export const AppearanceSwitcher: React.FC<AppearanceSwitcherProps> = ({ className }) => {
  const { settings } = useHabitStore();
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() => settings.themeMode || getStoredTheme());
  const [isGlideEnabled, setIsGlideEnabled] = useState(() => settings.solarCircadianGlide !== false);
  const [backgroundId, setBackgroundId] = useState(() => settings.expressiveBackground || "abstract");

  useEffect(() => {
    const warmth = isGlideEnabled ? calculateCircadianWarmth() : 0;
    applyThemeToDocument(currentMode, warmth, backgroundId);
  }, [backgroundId, currentMode, isGlideEnabled]);

  const handleSelectTheme = (mode: ThemeMode) => {
    setCurrentMode(mode);
    setStoredTheme(mode);
    habitActions.updateSettings({ themeMode: mode });
  };

  const handleSelectBackground = (id: string) => {
    setBackgroundId(id);
    habitActions.updateSettings({ expressiveBackground: id });
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Complete visual presets</p>
          <h3 className="font-display text-lg font-bold text-foreground">Choose your Daily Spark</h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
            Each preset includes its own typography, spacing, icons, shapes, surfaces, and motion.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-faint">
          <ShieldCheck className="size-3 text-ember" /> Offline
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="App appearance">
        {orderedThemeModes.map((mode) => {
          const config = THEME_CONFIGS[mode];
          const selected = currentMode === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleSelectTheme(mode)}
              className={cn(
                "relative overflow-hidden border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember",
                selected ? "border-ember bg-surface-2 ring-2 ring-ember/30 shadow-lg" : "border-border bg-surface hover:border-ember/50",
              )}
              style={{ borderRadius: config.cardRadius }}
            >
              {selected && <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-ember text-primary-foreground"><Check className="size-3.5" strokeWidth={3} /></span>}
              <div className="pr-7">
                <p className="text-base font-bold" style={{ fontFamily: config.fontDisplay }}>{config.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{config.subtitle}</p>
              </div>
              <div className="mt-4 space-y-2 border p-3" style={{ background: config.surface, borderColor: config.border, borderRadius: config.cardRadius, boxShadow: config.shadow }}>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: config.accent, boxShadow: `0 0 12px ${config.glow}` }} />
                  <span className="text-[11px] font-bold" style={{ color: config.fg, fontFamily: config.fontDisplay }}>7 day streak</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/30"><div className="h-full w-3/4 rounded-full" style={{ background: config.accent }} /></div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-faint">{config.personality}</p>
            </button>
          );
        })}
      </div>

      {currentMode === "expressive" && (
        <section className="space-y-3 rounded-[var(--theme-card-radius)] border border-border bg-surface/90 p-4 shadow-[var(--theme-shadow)] backdrop-blur-xl">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-foreground"><Palette className="size-4 text-ember" /> Expressive background</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Tap any atmosphere to preview it instantly. All images are stored on this device.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Expressive background">
            {EXPRESSIVE_BACKGROUNDS.map((background) => {
              const selected = backgroundId === background.id;
              const base = import.meta.env.BASE_URL || "/";
              return (
                <button
                  key={background.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handleSelectBackground(background.id)}
                  className={cn("group relative min-h-24 overflow-hidden rounded-2xl border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember", selected ? "border-ember ring-2 ring-ember/40" : "border-white/10 hover:border-ember/60")}
                  style={{ backgroundImage: background.file ? `linear-gradient(to top, rgba(8,6,15,.96), rgba(8,6,15,.12)), url(${base}backgrounds/expressive/${background.file})` : "radial-gradient(circle at 70% 20%, #6D28D9, transparent 45%), linear-gradient(145deg, #171027, #08060F)", backgroundSize: "cover", backgroundPosition: "center" }}
                >
                  {selected && <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-ember text-white"><Check className="size-3" strokeWidth={3} /></span>}
                  <span className="absolute inset-x-0 bottom-0 p-2.5"><span className="block text-[11px] font-bold text-white">{background.name}</span><span className="mt-0.5 block line-clamp-1 text-[9px] text-white/70">{background.description}</span></span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-faint">Artwork: SLI Vault resources, MIT licensed.</p>
        </section>
      )}

      <div className="flex items-center justify-between gap-4 rounded-[var(--theme-card-radius)] border border-border bg-surface p-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ember-soft text-ember">{isGlideEnabled ? <Moon className="size-4" /> : <Sun className="size-4" />}</span>
          <div><p className="text-xs font-semibold text-foreground">Night warmth</p><p className="text-[11px] text-faint">Gently reduces cool tones after dark without GPS.</p></div>
        </div>
        <Switch checked={isGlideEnabled} onCheckedChange={(enabled) => { setIsGlideEnabled(enabled); habitActions.updateSettings({ solarCircadianGlide: enabled }); }} />
      </div>
    </div>
  );
};
