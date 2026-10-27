import { useState } from "react";
import { Download, Share, PlusSquare, MoreVertical, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

/** Install Daily Spark as an app. Uses the browser prompt when available, otherwise shows steps. */
export function InstallButton({
  className,
  label = "Install app",
  children,
}: {
  className?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  const pwa = usePwaInstall();
  const [open, setOpen] = useState(false);

  if (pwa.installed) {
    return (
      <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Check className="size-4 text-ember" /> Installed
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={async () => {
          if (pwa.canPrompt) {
            await pwa.install();
          } else {
            setOpen(true);
          }
        }}
      >
        {children ?? (
          <>
            <Download className="size-4" /> {label}
          </>
        )}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-bold">Install Daily Spark</DialogTitle>
            <DialogDescription>
              {pwa.inFrame
                ? "Open this site in its own browser tab first, then follow the steps for your device."
                : "Add it to your home screen. It opens full-screen like a regular app."}
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm">
            {pwa.ios ? (
              <>
                <Step n={1}>
                  Tap <Share className="inline size-4 text-ember" /> Share in Safari.
                </Step>
                <Step n={2}>
                  Choose <PlusSquare className="inline size-4 text-ember" /> Add to Home Screen.
                </Step>
              </>
            ) : (
              <>
                <Step n={1}>
                  Open the browser menu <MoreVertical className="inline size-4 text-ember" /> (Chrome, Edge,
                  Samsung Internet).
                </Step>
                <Step n={2}>Tap “Install app” or “Add to Home screen”.</Step>
              </>
            )}
            <Step n={3}>Launch Daily Spark from your home screen.</Step>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-xs text-ember">
        {n}
      </span>
      <span className="pt-0.5 text-foreground/90">{children}</span>
    </li>
  );
}
