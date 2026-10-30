import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  QrCode,
  Scan,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHabitStore, habitActions } from "@/lib/habits/store";
import { generateQrSvg } from "@/lib/habits/qrMatrix";
import { hapticEngine } from "@/lib/habits/haptics";
import type { Habit } from "@/lib/habits/types";
import { cn } from "@/lib/utils";

interface AirGappedSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AirGappedSyncDialog: React.FC<AirGappedSyncDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { habits } = useHabitStore();
  const [tab, setTab] = useState<"transmit" | "receive">("transmit");

  // Transmit state
  const [chunkIndex, setChunkIndex] = useState(0);
  const [fps] = useState(6); // 6-10 frames per second
  const [isPlaying, setIsPlaying] = useState(true);

  // Receive state
  const [receivedChunks, setReceivedChunks] = useState<Map<number, string>>(new Map());
  const [expectedTotal, setExpectedTotal] = useState<number | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [mergeStatus, setMergeStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Chunk size: ~60 bytes per QR frame for rapid, robust camera recognition
  const CHUNK_SIZE = 60;

  // Generate chunks from habits
  const chunks = useMemo(() => {
    try {
      const payload = JSON.stringify(habits);
      const b64 = btoa(unescape(encodeURIComponent(payload)));
      const count = Math.ceil(b64.length / CHUNK_SIZE) || 1;
      const list: string[] = [];

      for (let i = 0; i < count; i++) {
        const slice = b64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        list.push(`DS:${i + 1}:${count}:${slice}`);
      }
      return list;
    } catch {
      return ["DS:1:1:e30="];
    }
  }, [habits]);

  // Animated QR loop
  useEffect(() => {
    if (!open || tab !== "transmit" || !isPlaying || chunks.length <= 1) return;

    const interval = setInterval(() => {
      setChunkIndex((prev) => (prev + 1) % chunks.length);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [open, tab, isPlaying, fps, chunks]);

  // Current QR SVG
  const currentSvg = useMemo(() => {
    const text = chunks[chunkIndex] || chunks[0];
    return generateQrSvg(text, "#000000", "#FFFFFF");
  }, [chunks, chunkIndex]);

  // Process incoming chunk string: DS:[part]:[total]:[base64data]
  const processChunk = (chunkStr: string) => {
    const trimmed = chunkStr.trim();
    if (!trimmed.startsWith("DS:")) {
      setMergeStatus("error");
      setStatusMessage("Invalid Spark QR chunk format");
      return;
    }

    const parts = trimmed.split(":");
    if (parts.length < 4) return;

    const partNum = parseInt(parts[1], 10);
    const totalNum = parseInt(parts[2], 10);
    const data = parts.slice(3).join(":");

    if (isNaN(partNum) || isNaN(totalNum)) return;

    setExpectedTotal(totalNum);
    setReceivedChunks((prev) => {
      const next = new Map(prev);
      next.set(partNum, data);

      if (next.size >= totalNum) {
        // All gathered! Reassemble
        try {
          let fullB64 = "";
          for (let i = 1; i <= totalNum; i++) {
            fullB64 += next.get(i) || "";
          }
          const jsonStr = decodeURIComponent(escape(atob(fullB64)));
          const remoteHabits = JSON.parse(jsonStr) as Habit[];

          if (Array.isArray(remoteHabits)) {
            habitActions.mergeHabits(remoteHabits);
            hapticEngine.crescendoPulse();
            setMergeStatus("success");
            setStatusMessage(`Successfully merged ${remoteHabits.length} habits with Set-Union CRDT!`);
          }
        } catch {
          setMergeStatus("error");
          setStatusMessage("Could not parse assembled vault payload.");
        }
      }

      return next;
    });

    hapticEngine.tickTap();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processChunk(manualInput);
      setManualInput("");
    }
  };

  const isScanningRef = useRef(false);

  const startScanningLoop = () => {
    isScanningRef.current = true;
    if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
      return;
    }

    try {
      const detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector({ formats: ["qr_code"] });

      const scanLoop = async () => {
        if (!isScanningRef.current) return;
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
          try {
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0) {
              for (const code of barcodes) {
                if (code.rawValue) {
                  processChunk(code.rawValue);
                }
              }
            }
          } catch {
            /* ignore individual frame read error */
          }
        }
        if (isScanningRef.current) {
          requestAnimationFrame(scanLoop);
        }
      };

      requestAnimationFrame(scanLoop);
    } catch {
      /* BarcodeDetector initialization fallback */
    }
  };

  const handleStartCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        startScanningLoop();
      }
    } catch {
      setStatusMessage("Camera permission not available. Use manual paste below.");
      setCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    isScanningRef.current = false;
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!open) {
      handleStopCamera();
      setReceivedChunks(new Map());
      setMergeStatus("idle");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface border-border/40 text-foreground p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember border border-ember/20">
              <QrCode className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold tracking-tight">
                Air-Gapped Vault Sync
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                100% Offline Optical Handshake &amp; Set-Union CRDT
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-full bg-surface-2 p-1 my-2 border border-border/30">
          <button
            type="button"
            onClick={() => {
              setTab("transmit");
              handleStopCamera();
            }}
            className={cn(
              "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              tab === "transmit" ? "bg-ember text-white shadow-sm" : "text-faint hover:text-foreground"
            )}
          >
            <Send className="size-3.5" /> Transmit (Display)
          </button>
          <button
            type="button"
            onClick={() => setTab("receive")}
            className={cn(
              "flex-1 rounded-full py-1.5 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              tab === "receive" ? "bg-ember text-white shadow-sm" : "text-faint hover:text-foreground"
            )}
          >
            <Scan className="size-3.5" /> Receive (Scan)
          </button>
        </div>

        {/* TRANSMIT MODE */}
        {tab === "transmit" && (
          <div className="flex flex-col items-center justify-center space-y-4 my-2">
            {/* High-Contrast QR Code Display Box */}
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-border/20 flex flex-col items-center">
              <div
                className="size-56"
                dangerouslySetInnerHTML={{ __html: currentSvg }}
              />
              <div className="mt-2 text-center text-black/70 font-mono text-xs font-semibold">
                Frame {chunkIndex + 1} of {chunks.length}
              </div>
            </div>

            {/* Playback Controls & FPS */}
            <div className="flex items-center gap-3 text-xs text-faint">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 rounded-full bg-surface-2 hover:bg-surface border border-border/30 text-foreground font-semibold"
              >
                {isPlaying ? "Pause Rotation" : "Resume Rotation"}
              </button>
              <span>Speed: {fps} FPS</span>
            </div>

            <p className="text-[11px] text-muted-foreground text-center max-w-xs leading-relaxed">
              Point the receiving device's camera at this screen. The animated frames sequentially stream your complete habit history with zero Wi-Fi, Bluetooth, or cloud servers.
            </p>
          </div>
        )}

        {/* RECEIVE MODE */}
        {tab === "receive" && (
          <div className="space-y-4 my-2">
            {/* Camera Viewfinder */}
            {cameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-border/40">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                <button
                  type="button"
                  onClick={handleStopCamera}
                  aria-label="Stop Camera"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleStartCamera}
                variant="outline"
                className="w-full h-12 rounded-2xl border-dashed border-border/60 hover:bg-surface-2 flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Camera className="size-4 text-ember" /> Start Optical Camera Reader
              </Button>
            )}

            {/* Aggregation Progress */}
            {expectedTotal && (
              <div className="p-3 rounded-2xl bg-surface-2 border border-border/30 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Reconstructing Vault</span>
                  <span className="font-mono text-ember font-bold">
                    {receivedChunks.size} / {expectedTotal} Chunks
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full bg-ember transition-all duration-200"
                    style={{ width: `${Math.round((receivedChunks.size / expectedTotal) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Manual Chunk Paste Input */}
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <p className="text-[11px] font-semibold text-faint">Manual Chunk Entry / Paste</p>
              <div className="flex gap-2">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste DS:1:N:... chunk code"
                  className="h-9 text-xs font-mono bg-surface-2 border-border/40"
                  aria-label="Chunk code input"
                />
                <Button type="submit" size="sm" className="h-9 px-3 bg-ember hover:bg-ember/90 font-bold text-white">
                  Feed
                </Button>
              </div>
            </form>

            {/* Merge Status Banner */}
            {mergeStatus === "success" && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {mergeStatus === "error" && (
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
