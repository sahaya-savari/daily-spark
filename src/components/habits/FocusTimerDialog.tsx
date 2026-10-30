import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { focusAudio, type SoundscapeType } from "@/lib/habits/focusAudio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Habit } from "@/lib/habits/types";

interface FocusTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onCompleteHabit: (habitId: string, durationMinutes: number) => void;
}

export const FocusTimerDialog: React.FC<FocusTimerDialogProps> = ({
  open,
  onOpenChange,
  habit,
  onCompleteHabit,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundscape, setSoundscape] = useState<SoundscapeType>("none");
  const [isMuted, setIsMuted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Audio wave canvas visualizer ref
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset timer when opened or habit changes
  useEffect(() => {
    if (open) {
      setSecondsRemaining(durationMinutes * 60);
      setIsRunning(false);
      setHasCompleted(false);
    } else {
      focusAudio.stopSoundscape();
      setIsRunning(false);
    }
  }, [open, durationMinutes]);

  // Soundscape switcher
  useEffect(() => {
    if (isRunning && !isMuted) {
      focusAudio.playSoundscape(soundscape, 0.4);
    } else {
      focusAudio.stopSoundscape();
    }
  }, [isRunning, soundscape, isMuted]);

  // Countdown loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setHasCompleted(true);
          focusAudio.stopSoundscape();
          focusAudio.playCompletionChime();
          if (habit) {
            onCompleteHabit(habit.id, durationMinutes);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, habit, durationMinutes, onCompleteHabit]);

  // Visualizer breathing pulse animation
  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let waveTime = 0;

    const drawWave = () => {
      waveTime += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isRunning) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(191, 114, 69, 0.8)";

        for (let x = 0; x < width; x++) {
          const freq = 0.03;
          const amp = 14 * Math.sin(waveTime * 0.8);
          const y = height / 2 + Math.sin(x * freq + waveTime) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(drawWave);
    };

    drawWave();
    return () => cancelAnimationFrame(animId);
  }, [isRunning, soundscape]);

  const handleSelectPreset = (minutes: number) => {
    setDurationMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setIsRunning(false);
    setHasCompleted(false);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    focusAudio.setMuted(nextMuted);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent = Math.round(
    ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface border-border/40 text-foreground backdrop-blur-2xl p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-ember-soft border border-ember/20 flex items-center justify-center text-ember">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground tracking-wide">
                Tactile Focus Deck
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {habit ? `${habit.emoji} ${habit.name}` : "General Focus Session"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Circular HUD Display */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-border/40"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="transition-all duration-300 stroke-ember"
                strokeWidth="5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(191, 114, 69, 0.4))",
                }}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
                {formatTime(secondsRemaining)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground tracking-wider mt-1 uppercase">
                {isRunning ? "In Focus" : hasCompleted ? "Completed" : "Ready"}
              </span>
            </div>
          </div>

          {/* Real-time wave canvas */}
          <canvas
            ref={visualizerCanvasRef}
            width={260}
            height={36}
            className="mt-2 h-9 w-full opacity-70"
          />
        </div>

        {/* Duration Presets */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[15, 25, 50].map((m) => (
            <button
              key={m}
              onClick={() => handleSelectPreset(m)}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                durationMinutes === m
                  ? "bg-ember-soft text-ember border border-ember/30"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80 hover:text-foreground"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>

        {/* Ambient Soundscape Selection */}
        <div className="p-3 rounded-2xl bg-surface-2/60 border border-border/40 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Procedural Ambience (0 KB)</span>
            <button
              onClick={handleToggleMute}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
              aria-label={isMuted ? "Unmute soundscape" : "Mute soundscape"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSoundscape("none")}
              className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                soundscape === "none"
                  ? "bg-ember text-white font-semibold"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80 hover:text-foreground"
              }`}
            >
              Silent
            </button>
            <button
              onClick={() => setSoundscape("alpha")}
              className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                soundscape === "alpha"
                  ? "bg-ember-soft text-ember border border-ember/30 font-semibold"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80 hover:text-foreground"
              }`}
            >
              <Radio className="w-3 h-3" /> Alpha 10Hz
            </button>
            <button
              onClick={() => setSoundscape("theta")}
              className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                soundscape === "theta"
                  ? "bg-ember-soft text-ember border border-ember/30 font-semibold"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80 hover:text-foreground"
              }`}
            >
              <Radio className="w-3 h-3" /> Theta 6Hz
            </button>
            <button
              onClick={() => setSoundscape("beta")}
              className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                soundscape === "beta"
                  ? "bg-ember-soft text-ember border border-ember/30 font-semibold"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80 hover:text-foreground"
              }`}
            >
              <Radio className="w-3 h-3" /> Beta 18Hz
            </button>
            <button
              onClick={() => setSoundscape("brown")}
              className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                soundscape === "brown"
                  ? "bg-ember-soft text-ember border border-ember/30 font-semibold"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80 hover:text-foreground"
              }`}
            >
              <Radio className="w-3 h-3" /> Brown Noise
            </button>
            <button
              onClick={() => setSoundscape("rain")}
              className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                soundscape === "rain"
                  ? "bg-ember-soft text-ember border border-ember/30 font-semibold"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-2/80 hover:text-foreground"
              }`}
            >
              <CloudRain className="w-3 h-3" /> Rain
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleSelectPreset(durationMinutes)}
            variant="outline"
            className="flex-1 rounded-xl border-border/40 bg-surface-2 hover:bg-surface-2/80 text-foreground font-semibold"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>

          <Button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 rounded-xl text-white font-bold transition-all ${
              isRunning
                ? "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                : "bg-ember hover:bg-ember/90 shadow-lg shadow-ember/20"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> Start Focus
              </>
            )}
          </Button>
        </div>

        {hasCompleted && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Session complete! Your habit has been automatically marked for today.</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
