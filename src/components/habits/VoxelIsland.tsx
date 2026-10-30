import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Sun, Moon, RotateCcw } from "lucide-react";
import type { Habit } from "@/lib/habits/types";

interface VoxelIslandProps {
  habits: Habit[];
  overallStreak: number;
  totalCompletions: number;
}

export const VoxelIsland: React.FC<VoxelIslandProps> = ({
  habits,
  overallStreak,
  totalCompletions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<"day" | "sunset" | "night">("day");
  const [rotationAngle, setRotationAngle] = useState(0);

  // Determine ambient lighting based on local hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 17) {
      setTimeOfDay("day");
    } else if (hour >= 17 && hour < 20) {
      setTimeOfDay("sunset");
    } else {
      setTimeOfDay("night");
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (timeOfDay === "night") {
        skyGrad.addColorStop(0, "#070814");
        skyGrad.addColorStop(1, "#121426");
      } else if (timeOfDay === "sunset") {
        skyGrad.addColorStop(0, "#2C162E");
        skyGrad.addColorStop(0.6, "#7A353A");
        skyGrad.addColorStop(1, "#D97746");
      } else {
        skyGrad.addColorStop(0, "#0F172A");
        skyGrad.addColorStop(1, "#1E293B");
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Stars for night
      if (timeOfDay === "night") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        for (let i = 0; i < 40; i++) {
          const sx = (Math.sin(i * 99 + 1) * 0.5 + 0.5) * width;
          const sy = (Math.cos(i * 33 + 1) * 0.5 + 0.5) * (height * 0.6);
          const twinkle = Math.sin(time + i) * 0.4 + 0.6;
          ctx.beginPath();
          ctx.arc(sx, sy, 1 * twinkle, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Isometric projection origin
      const originX = width / 2;
      const originY = height / 2 + 30 + Math.sin(time) * 4; // Gentle idle bobbing

      const tileWidth = 36;
      const tileHeight = 18;
      const blockHeight = 18;

      // Draw isometric cube
      const drawCube = (gx: number, gy: number, gz: number, topColor: string, leftColor: string, rightColor: string) => {
        // Rotate grid coordinates
        const cosR = Math.cos(rotationAngle);
        const sinR = Math.sin(rotationAngle);
        const rx = gx * cosR - gy * sinR;
        const ry = gx * sinR + gy * cosR;

        const screenX = originX + (rx - ry) * (tileWidth / 2);
        const screenY = originY + (rx + ry) * (tileHeight / 2) - gz * blockHeight;

        // Top face
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2);
        ctx.lineTo(screenX, screenY + tileHeight);
        ctx.lineTo(screenX - tileWidth / 2, screenY + tileHeight / 2);
        ctx.closePath();
        ctx.fill();

        // Left face
        ctx.fillStyle = leftColor;
        ctx.beginPath();
        ctx.moveTo(screenX - tileWidth / 2, screenY + tileHeight / 2);
        ctx.lineTo(screenX, screenY + tileHeight);
        ctx.lineTo(screenX, screenY + tileHeight + blockHeight);
        ctx.lineTo(screenX - tileWidth / 2, screenY + tileHeight / 2 + blockHeight);
        ctx.closePath();
        ctx.fill();

        // Right face
        ctx.fillStyle = rightColor;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + tileHeight);
        ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2);
        ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2 + blockHeight);
        ctx.lineTo(screenX, screenY + tileHeight + blockHeight);
        ctx.closePath();
        ctx.fill();
      };

      // Palette adjustments for time of day
      const grassTop = timeOfDay === "night" ? "#1B4D3E" : timeOfDay === "sunset" ? "#5A6836" : "#2E7D32";
      const grassLeft = timeOfDay === "night" ? "#123329" : timeOfDay === "sunset" ? "#3A4423" : "#1B5E20";
      const grassRight = timeOfDay === "night" ? "#0E2921" : timeOfDay === "sunset" ? "#2C351B" : "#144818";

      const dirtTop = "#8D6E63";
      const dirtLeft = "#5D4037";
      const dirtRight = "#4E342E";

      const woodTop = "#BCAAA4";
      const woodLeft = "#8D6E63";
      const woodRight = "#6D4C41";

      const waterTop = timeOfDay === "night" ? "rgba(14, 60, 100, 0.7)" : "rgba(3, 169, 244, 0.75)";
      const waterLeft = "rgba(2, 119, 189, 0.85)";
      const waterRight = "rgba(1, 87, 155, 0.85)";

      // Island base (3x3 grid)
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          const dist = Math.sqrt(x * x + y * y);
          if (dist > 2.2) continue;

          // Foundation dirt layers
          drawCube(x, y, -1, dirtTop, dirtLeft, dirtRight);

          // Top surface: grass or water stream
          if (x === 0 && (y === 1 || y === 2)) {
            // Little mountain stream
            drawCube(x, y, 0, waterTop, waterLeft, waterRight);
          } else {
            drawCube(x, y, 0, grassTop, grassLeft, grassRight);
          }
        }
      }

      // Foliage & structures unlocked by streak and completions
      const hasTree = totalCompletions >= 3;
      const hasCabin = overallStreak >= 5 || totalCompletions >= 15;
      const hasLighthouse = overallStreak >= 14 || totalCompletions >= 30;

      if (hasTree) {
        // Pine tree trunk and foliage at (-1, -1)
        drawCube(-1, -1, 1, woodTop, woodLeft, woodRight);
        drawCube(-1, -1, 2, "#1B5E20", "#144818", "#0E3813");
        drawCube(-1, -1, 3, "#2E7D32", "#1B5E20", "#144818");
      }

      if (hasCabin) {
        // Cozy cabin at (1, -1)
        drawCube(1, -1, 1, woodTop, woodLeft, woodRight);
        drawCube(1, -1, 2, "#FF7043", "#D84315", "#BF360C"); // warm terracotta roof

        // Warm lantern glow in evening/night
        if (timeOfDay !== "day") {
          const glow = Math.sin(time * 2) * 0.15 + 0.85;
          ctx.fillStyle = `rgba(255, 183, 77, ${glow * 0.4})`;
          const cosR = Math.cos(rotationAngle);
          const sinR = Math.sin(rotationAngle);
          const rx = 1 * cosR - (-1) * sinR;
          const ry = 1 * sinR + (-1) * cosR;
          const cx = originX + (rx - ry) * (tileWidth / 2);
          const cy = originY + (rx + ry) * (tileHeight / 2) - 1.5 * blockHeight;
          ctx.beginPath();
          ctx.arc(cx, cy, 25, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (hasLighthouse) {
        // Stone lighthouse at (-1, 1)
        drawCube(-1, 1, 1, "#ECEFF1", "#CFD8DC", "#B0BEC5");
        drawCube(-1, 1, 2, "#ECEFF1", "#CFD8DC", "#B0BEC5");
        drawCube(-1, 1, 3, "#ECEFF1", "#CFD8DC", "#B0BEC5");
        drawCube(-1, 1, 4, "#FFD54F", "#FFCA28", "#FFB300"); // Beacon lantern

        // Rotating lighthouse beam
        const beamAngle = time * 1.5;
        const cosR = Math.cos(rotationAngle);
        const sinR = Math.sin(rotationAngle);
        const rx = -1 * cosR - 1 * sinR;
        const ry = -1 * sinR + 1 * cosR;
        const lx = originX + (rx - ry) * (tileWidth / 2);
        const ly = originY + (rx + ry) * (tileHeight / 2) - 4 * blockHeight;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(beamAngle);
        const beamGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 70);
        beamGrad.addColorStop(0, "rgba(255, 238, 88, 0.6)");
        beamGrad.addColorStop(1, "rgba(255, 238, 88, 0)");
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 70, -0.35, 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [timeOfDay, rotationAngle, overallStreak, totalCompletions]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070810]/80 backdrop-blur-xl shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Voxel Consistency Island</h3>
            <p className="text-xs text-white/50">Grows with your real-world habit progress</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRotationAngle((prev) => prev + Math.PI / 4)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs flex items-center gap-1"
            title="Rotate island"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setTimeOfDay((prev) => (prev === "day" ? "sunset" : prev === "sunset" ? "night" : "day"));
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            title="Toggle time of day"
          >
            {timeOfDay === "day" ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : timeOfDay === "sunset" ? (
              <Sun className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
            )}
          </button>
        </div>
      </div>

      <div className="relative w-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={340}
          height={240}
          className="rounded-xl border border-white/5 shadow-inner"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <span className="text-white/40 block">Terrain Level</span>
          <span className="font-semibold text-white mt-0.5 block">
            {totalCompletions >= 30 ? "Tier III" : totalCompletions >= 10 ? "Tier II" : "Tier I"}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <span className="text-white/40 block">Landmarks</span>
          <span className="font-semibold text-amber-400 mt-0.5 block">
            {overallStreak >= 14 ? "Lighthouse" : overallStreak >= 5 ? "Cabin" : totalCompletions >= 3 ? "Forest" : "Island"}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <span className="text-white/40 block">Ambience</span>
          <span className="font-semibold text-ember mt-0.5 block capitalize">{timeOfDay}</span>
        </div>
      </div>
    </div>
  );
};

