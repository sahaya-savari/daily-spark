import React, { useState } from "react";
import {
  PixelSmartphone,
  PixelPalette,
  PixelTune,
  PixelStorage,
  PixelHeart,
  PixelInfo,
  PixelChevronRight,
  PixelPen,
  PixelCheck,
  PixelDownload,
  PixelUpload,
  PixelNotebook,
  PixelShieldCheck,
  PixelSparkles,
  PixelBug,
  PixelGithub,
  PixelStar,
  PixelLock,
  PixelQrCode,
  PixelClose,
} from "@/components/ui/pixel-icon";
import { AppearanceSwitcher } from "@/components/habits/AppearanceSwitcher";
import { useHabitStore, habitActions } from "@/lib/habits/store";
import { THEME_CONFIGS, getStoredTheme } from "@/lib/habits/appearance";
import { formatDisplayDate } from "@/lib/habits/dates";
import { SITE } from "@/lib/site";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModernSettingsViewProps {
  onExportBackup: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportMarkdown: () => void;
  onExportCsv: () => void;
  onOpenAirGapped?: () => void;
  onOpenVaultSync?: () => void;
  onOpenAppLock?: () => void;
  embedded?: boolean;
}

type ActiveSection = "appearance" | "preferences" | "data" | "support" | "about" | null;

export function ModernSettingsView({
  onExportBackup,
  onFileUpload,
  onExportMarkdown,
  onExportCsv,
  onOpenAirGapped,
  onOpenVaultSync,
  onOpenAppLock,
  embedded = false,
}: ModernSettingsViewProps) {
  const { settings } = useHabitStore();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [userName, setUserName] = useState<string>(() => {
    return (localStorage.getItem("dailyspark_username") || "Inlitx");
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const currentThemeMode = settings.themeMode || getStoredTheme();
  const currentThemeConfig = THEME_CONFIGS[currentThemeMode] || THEME_CONFIGS.classic;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempName.trim() || "Inlitx";
    setUserName(clean);
    localStorage.setItem("dailyspark_username", clean);
    setIsEditingName(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-1 sm:px-2 py-4 space-y-6">
      {/* 1. Centered Profile / Avatar Header (matching Image 4) */}
      <div className="flex flex-col items-center justify-center text-center pt-2">
        <div className="relative group cursor-pointer" onClick={() => setIsEditingName(true)}>
          <div className="size-20 sm:size-24 rounded-full border-2 border-white/10 bg-gradient-to-tr from-surface-2 to-surface p-1 shadow-xl overflow-hidden flex items-center justify-center">
            {/* Mountain landscape avatar placeholder inspired by Image 4 */}
            <div className="size-full rounded-full bg-gradient-to-b from-sky-800 via-indigo-900 to-stone-900 flex items-center justify-center text-2xl font-bold text-white/90">
              {userName.slice(0, 1).toUpperCase()}
            </div>
          </div>
          {/* Violet edit pencil badge at bottom-right (matching Image 4) */}
          <button
            type="button"
            className="absolute bottom-0 right-0 size-7 sm:size-8 rounded-full bg-ember text-white grid place-items-center shadow-lg border-2 border-background transition-transform hover:scale-110"
            aria-label="Edit username"
          >
            <PixelPen className="size-3.5" />
          </button>
        </div>

        {/* Username + Edit Pencil */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-normal">
            {userName}
          </h2>
          <button
            type="button"
            onClick={() => setIsEditingName(true)}
            className="text-faint hover:text-foreground transition-colors p-1"
            title="Edit username"
          >
            <PixelPen className="size-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Isolated Card: App style (matching Image 4) */}
      <section className="rounded-2xl sm:rounded-3xl border border-white/10 bg-surface/90 backdrop-blur-md shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setActiveSection("appearance")}
          className="flex w-full items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-white/[0.06] text-foreground/80">
              <PixelSmartphone className="size-5" />
            </span>
            <span className="font-sans text-[15px] sm:text-[16px] font-semibold text-foreground">
              App style
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-faint">
            <span className="capitalize font-medium text-muted-foreground">{currentThemeConfig.name}</span>
            <PixelChevronRight className="size-4" />
          </div>
        </button>
      </section>

      {/* 3. Connected Grouped Card: Core Settings (matching Image 4) */}
      <section className="rounded-2xl sm:rounded-3xl border border-white/10 bg-surface/90 backdrop-blur-md shadow-sm overflow-hidden divide-y divide-white/5">
        {/* Appearance Row */}
        <button
          type="button"
          onClick={() => setActiveSection("appearance")}
          className="flex w-full items-center justify-between p-4 sm:p-4.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-white/[0.06] text-foreground/80">
              <PixelPalette className="size-5 text-ember" />
            </span>
            <div>
              <p className="font-sans text-[15px] sm:text-[16px] font-semibold text-foreground leading-tight">
                Appearance
              </p>
              <p className="font-sans text-xs sm:text-[13px] text-muted-foreground mt-0.5">
                Theme, accent and background
              </p>
            </div>
          </div>
          <PixelChevronRight className="size-4 text-faint shrink-0" />
        </button>

        {/* Preferences Row */}
        <button
          type="button"
          onClick={() => setActiveSection("preferences")}
          className="flex w-full items-center justify-between p-4 sm:p-4.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-white/[0.06] text-foreground/80">
              <PixelTune className="size-5" />
            </span>
            <div>
              <p className="font-sans text-[15px] sm:text-[16px] font-semibold text-foreground leading-tight">
                Preferences
              </p>
              <p className="font-sans text-xs sm:text-[13px] text-muted-foreground mt-0.5">
                Language, week and sorting
              </p>
            </div>
          </div>
          <PixelChevronRight className="size-4 text-faint shrink-0" />
        </button>

        {/* Data Row */}
        <button
          type="button"
          onClick={() => setActiveSection("data")}
          className="flex w-full items-center justify-between p-4 sm:p-4.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-white/[0.06] text-foreground/80">
              <PixelStorage className="size-5" />
            </span>
            <div>
              <p className="font-sans text-[15px] sm:text-[16px] font-semibold text-foreground leading-tight">
                Data
              </p>
              <p className="font-sans text-xs sm:text-[13px] text-muted-foreground mt-0.5">
                Backups, archive and import
              </p>
            </div>
          </div>
          <PixelChevronRight className="size-4 text-faint shrink-0" />
        </button>

        {/* Support Row */}
        <button
          type="button"
          onClick={() => setActiveSection("support")}
          className="flex w-full items-center justify-between p-4 sm:p-4.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-white/[0.06] text-foreground/80">
              <PixelHeart className="size-5" />
            </span>
            <div>
              <p className="font-sans text-[15px] sm:text-[16px] font-semibold text-foreground leading-tight">
                Support
              </p>
              <p className="font-sans text-xs sm:text-[13px] text-muted-foreground mt-0.5">
                Report a bug or ask for a feature
              </p>
            </div>
          </div>
          <PixelChevronRight className="size-4 text-faint shrink-0" />
        </button>
      </section>

      {/* 4. Isolated Card: About this app (matching Image 4) */}
      <section className="rounded-2xl sm:rounded-3xl border border-white/10 bg-surface/90 backdrop-blur-md shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setActiveSection("about")}
          className="flex w-full items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-white/[0.06] text-foreground/80">
              <PixelInfo className="size-5" />
            </span>
            <div>
              <p className="font-sans text-[15px] sm:text-[16px] font-semibold text-foreground leading-tight">
                About this app
              </p>
              <p className="font-sans text-xs sm:text-[13px] text-muted-foreground mt-0.5">
                Version, credits and source code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-faint">
            <span className="font-mono text-xs">{SITE.apk.version}</span>
            <PixelChevronRight className="size-4" />
          </div>
        </button>
      </section>

      {/* MODAL: Edit Username */}
      <Dialog open={isEditingName} onOpenChange={setIsEditingName}>
        <DialogContent className="max-w-sm rounded-3xl border border-white/10 bg-surface p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Edit Display Name</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Personalize your Daily Spark habit profile on this device.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveName} className="space-y-4 pt-2">
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Your name"
              maxLength={24}
              autoFocus
              className="h-11 rounded-xl bg-surface-2 border-border/50 text-foreground"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditingName(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-ember text-white font-semibold">
                Save Name
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Appearance Sub-Screen */}
      <Dialog open={activeSection === "appearance"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Appearance</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select your color palette and circadian night warmth glide.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <AppearanceSwitcher />
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Preferences Sub-Screen */}
      <Dialog open={activeSection === "preferences"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Preferences</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure daily behavior, feedback, and privacy lock.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-2 border border-white/5">
              <div>
                <p className="font-semibold text-sm">Solar Circadian Warmth</p>
                <p className="text-xs text-muted-foreground">Gentle sunset glow reduction at night</p>
              </div>
              <Switch
                checked={settings.solarCircadianGlide !== false}
                onCheckedChange={(checked) => habitActions.updateSettings({ solarCircadianGlide: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-2 border border-white/5">
              <div>
                <p className="font-semibold text-sm">Daily Habit Reminders</p>
                <p className="text-xs text-muted-foreground">Local device notification at {settings.defaultTime || "20:00"}</p>
              </div>
              <Switch
                checked={Boolean(settings.enabled)}
                onCheckedChange={(checked) => habitActions.updateSettings({ enabled: checked })}
              />
            </div>

            {onOpenAppLock && (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(null);
                  onOpenAppLock();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PixelLock className="size-4 text-ember" />
                  <div>
                    <p className="font-semibold text-sm">App Lock PIN</p>
                    <p className="text-xs text-muted-foreground">Protect habits and notes with 4-digit PIN</p>
                  </div>
                </div>
                <PixelChevronRight className="size-4 text-faint" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Data & Backups Sub-Screen */}
      <Dialog open={activeSection === "data"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Data &amp; Backups</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Your habits never touch a server. Export backups safely anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={onExportBackup}
              className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <PixelDownload className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Export Full Backup (.json)</p>
                <p className="text-xs text-muted-foreground">Complete history, logs, and private journal</p>
              </div>
              <PixelChevronRight className="size-4 text-faint" />
            </button>

            <label className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer">
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <PixelUpload className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Inspect &amp; Restore Backup</p>
                <p className="text-xs text-muted-foreground">Safe preview before restoring your data</p>
              </div>
              <input
                type="file"
                accept=".json,.csv"
                onChange={onFileUpload}
                className="hidden"
              />
              <PixelChevronRight className="size-4 text-faint" />
            </label>

            <button
              type="button"
              onClick={onExportMarkdown}
              className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <PixelNotebook className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Export Markdown Summary</p>
                <p className="text-xs text-muted-foreground">Readable report for Obsidian, Notion, or Logseq</p>
              </div>
              <PixelChevronRight className="size-4 text-faint" />
            </button>

            {onOpenAirGapped && (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(null);
                  onOpenAirGapped();
                }}
                className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                  <PixelQrCode className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Air-Gapped QR Sync</p>
                  <p className="text-xs text-muted-foreground">Transfer between devices with zero network</p>
                </div>
                <PixelChevronRight className="size-4 text-faint" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Support Sub-Screen */}
      <Dialog open={activeSection === "support"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Support &amp; Community</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Daily Spark is 100% free, open-source, and community supported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-2">
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 rounded-2xl p-3.5 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-white/[0.06] text-foreground">
                <PixelGithub className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">GitHub Repository</p>
                <p className="text-xs text-muted-foreground">Source code, releases, and discussions</p>
              </div>
              <PixelChevronRight className="size-4 text-faint" />
            </a>

            <a
              href={SITE.issues}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 rounded-2xl p-3.5 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-white/[0.06] text-foreground">
                <PixelBug className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Report an Issue</p>
                <p className="text-xs text-muted-foreground">File a bug report or request a new feature</p>
              </div>
              <PixelChevronRight className="size-4 text-faint" />
            </a>

            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 rounded-2xl p-3.5 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
                <PixelStar className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Star on GitHub</p>
                <p className="text-xs text-muted-foreground">Support the open-source project</p>
              </div>
              <PixelChevronRight className="size-4 text-faint" />
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: About This App Sub-Screen */}
      <Dialog open={activeSection === "about"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">About Daily Spark</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              A calm, honest habit tracker built for lasting consistency.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-sm text-muted-foreground">
            <div className="p-4 rounded-2xl bg-surface-2 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">Version</span>
                <span className="font-mono text-xs text-ember font-bold">{SITE.apk.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">License</span>
                <span>MIT (100% Free &amp; Open Source)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">Architecture</span>
                <span>Offline-First (Zero Cloud, Zero Tracking)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">Author</span>
                <a href={SITE.authorUrl} target="_blank" rel="noreferrer" className="text-ember hover:underline">
                  {SITE.author}
                </a>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-faint px-1">
              Daily Spark was created to prove that habit tracking can be quiet, private, and honest.
              No artificial pressure, no streak-shaming, and no ads.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
