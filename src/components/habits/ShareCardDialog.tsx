import React, { useState, useEffect, useRef, useMemo } from "react";
import { Download, Share2, Sparkles, Trophy, Flame, Shield, ArrowRight } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHabitStore } from "@/lib/habits/store";
import { generateArchaeologyReport } from "@/lib/habits/archaeology";
import { getStoredTheme, THEME_CONFIGS } from "@/lib/habits/appearance";
import { hapticEngine } from "@/lib/habits/haptics";
import { cn } from "@/lib/utils";

interface ShareCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareCardDialog: React.FC<ShareCardDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { habits } = useHabitStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [cardTheme, setCardTheme] = useState<"classic" | "minimal" | "expressive">(() => getStoredTheme());

  const archaeology = useMemo(() => generateArchaeologyReport(habits), [habits]);

  useEffect(() => {
    if (!open) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions: 1080 x 1920 (Standard 9:16 Story format)
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // Background Gradient based on chosen aesthetic
    const theme = THEME_CONFIGS[cardTheme];
    const grad = ctx.createLinearGradient(0, 0, W, H);

    if (cardTheme === "expressive") {
      grad.addColorStop(0, "#06050C");
      grad.addColorStop(0.5, "#0D1127");
      grad.addColorStop(1, "#180A2E");
    } else if (cardTheme === "minimal") {
      grad.addColorStop(0, "#000000");
      grad.addColorStop(1, "#0D0D0D");
    } else {
      grad.addColorStop(0, "#121316");
      grad.addColorStop(0.5, "#181A20");
      grad.addColorStop(1, "#1F1A17");
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative Ambient Glowing Orbs
    if (cardTheme === "expressive") {
      // Cyan orb top right
      const cyanGlow = ctx.createRadialGradient(W * 0.8, H * 0.2, 50, W * 0.8, H * 0.2, 500);
      cyanGlow.addColorStop(0, "rgba(6, 182, 212, 0.25)");
      cyanGlow.addColorStop(1, "transparent");
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, W, H);

      // Violet orb bottom left
      const violetGlow = ctx.createRadialGradient(W * 0.2, H * 0.8, 50, W * 0.2, H * 0.8, 600);
      violetGlow.addColorStop(0, "rgba(168, 85, 247, 0.22)");
      violetGlow.addColorStop(1, "transparent");
      ctx.fillStyle = violetGlow;
      ctx.fillRect(0, 0, W, H);
    } else if (cardTheme === "classic") {
      // Warm Amber glow
      const amberGlow = ctx.createRadialGradient(W * 0.5, H * 0.35, 100, W * 0.5, H * 0.35, 700);
      amberGlow.addColorStop(0, "rgba(217, 119, 6, 0.18)");
      amberGlow.addColorStop(1, "transparent");
      ctx.fillStyle = amberGlow;
      ctx.fillRect(0, 0, W, H);
    }

    // Outer framing card
    ctx.strokeStyle = cardTheme === "minimal" ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = cardTheme === "minimal" ? 3 : 4;
    ctx.strokeRect(60, 60, W - 120, H - 120);

    // Header Branding
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("DAILY SPARK", 120, 160);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "32px sans-serif";
    ctx.fillText("MILESTONE RETROSPECTIVE", 120, 210);

    // Hero Streak Number
    const bestStreak = archaeology.longestRun?.streakLength || 0;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold 160px ${cardTheme === "minimal" ? "monospace" : "sans-serif"}`;
    ctx.fillText(`${bestStreak}`, 120, 480);

    ctx.fillStyle = theme.accent;
    ctx.font = "bold 48px sans-serif";
    ctx.fillText("DAYS UNBROKEN CHAIN", 120, 560);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "34px sans-serif";
    if (archaeology.longestRun) {
      ctx.fillText(
        `Personal Record on "${archaeology.longestRun.habitName}"`,
        120,
        620
      );
    }

    // Metrics Bento Grid
    const drawBentoBox = (x: number, y: number, w: number, h: number, title: string, value: string, sub: string) => {
      ctx.fillStyle = cardTheme === "minimal" ? "#0D0D0D" : "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "30px sans-serif";
      ctx.fillText(title, x + 40, y + 70);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 64px sans-serif";
      ctx.fillText(value, x + 40, y + 160);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "26px sans-serif";
      ctx.fillText(sub, x + 40, y + 215);
    };

    drawBentoBox(
      120,
      720,
      W - 240,
      260,
      "LIFETIME MOMENTUM",
      `${archaeology.totalLifetimeCompletions}`,
      "Total habit check-ins logged on this device"
    );

    drawBentoBox(
      120,
      1030,
      (W - 280) / 2,
      260,
      "RESILIENCE SCORE",
      `${archaeology.resilienceScore}%`,
      "Never miss twice rate"
    );

    drawBentoBox(
      120 + (W - 280) / 2 + 40,
      1030,
      (W - 280) / 2,
      260,
      "ACTIVE HABITS",
      `${archaeology.activeHabitCount}`,
      "Daily active routines"
    );

    // Quote / Manifesto footer
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `italic 36px ${cardTheme === "classic" ? "serif" : "sans-serif"}`;
    ctx.fillText('"Consistency is the quiet architecture of mastery."', 120, 1480);

    // Offline & Privacy Badge Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "28px sans-serif";
    ctx.fillText("100% Offline · No Cloud Tracking · Daily Spark", 120, 1780);

    // Convert to image URL for preview
    const url = canvas.toDataURL("image/png");
    setDataUrl(url);
  }, [open, cardTheme, habits, archaeology]);

  const handleShareOrDownload = async () => {
    hapticEngine.crescendoPulse();
    if (!dataUrl) return;

    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: "My Daily Spark Milestone",
          text: `I reached a ${archaeology.longestRun?.streakLength || 0}-day streak on Daily Spark!`,
          dialogTitle: "Share Milestone Card",
        });
        return;
      } catch {
        /* fallback to download */
      }
    }

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `daily_spark_milestone_${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface border-border/40 text-foreground p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Trophy className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold tracking-tight">
                Vector Milestone Share Card
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Spotify-Wrapped Style 1080x1920 Story Card
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Theme Palette Switcher for Card */}
        <div className="flex gap-2 my-2">
          {(["classic", "minimal", "expressive"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCardTheme(t)}
              className={cn(
                "flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border",
                cardTheme === t
                  ? "bg-surface-2 border-ember text-foreground ring-1 ring-ember"
                  : "bg-surface border-border/30 text-faint hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Scaled Preview Box */}
        <div className="relative aspect-[9/16] max-h-[380px] mx-auto overflow-hidden rounded-2xl border border-border/40 shadow-xl bg-black">
          <canvas ref={canvasRef} className="hidden" />
          {dataUrl && (
            <img
              src={dataUrl}
              alt="Milestone Story Card Preview"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            onClick={handleShareOrDownload}
            className="w-full h-11 bg-ember text-white hover:bg-ember/90 font-bold flex items-center justify-center gap-2 rounded-2xl shadow-md"
          >
            <Download className="size-4" /> Save High-Res Story (1080x1920)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
