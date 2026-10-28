import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Download,
  Upload,
  Cloud,
  CheckCircle,
  AlertCircle,
  HardDrive,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  encryptVault,
  decryptVault,
  mergeVaultHabits,
  type EncryptedVaultPackage,
  type VaultPayload,
} from "@/lib/habits/vaultSync";
import type { Habit, HabitSettings } from "@/lib/habits/types";

interface VaultSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  settings: HabitSettings;
  onSyncComplete: (mergedHabits: Habit[]) => void;
}

export const VaultSyncDialog: React.FC<VaultSyncDialogProps> = ({
  open,
  onOpenChange,
  habits,
  settings,
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<"export" | "import" | "gdrive">("export");
  const [passphrase, setPassphrase] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedPackage, setUploadedPackage] = useState<EncryptedVaultPackage | null>(null);

  const handleExportVault = async () => {
    if (!passphrase.trim()) {
      setErrorMessage("Please enter an encryption passphrase");
      return;
    }

    try {
      setErrorMessage(null);
      const payload: VaultPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        habits,
        settings,
      };

      const encrypted = await encryptVault(payload, passphrase.trim());
      const blob = new Blob([JSON.stringify(encrypted, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-spark-vault-${new Date().toISOString().slice(0, 10)}.enc.json`;
      a.click();
      URL.revokeObjectURL(url);
      setImportStatus("Vault encrypted & downloaded successfully!");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Encryption failed");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.format !== "dailyspark_encrypted_vault_v1") {
          throw new Error("Invalid encrypted vault format");
        }
        setUploadedPackage(parsed as EncryptedVaultPackage);
        setImportStatus(`Loaded encrypted package (${file.name})`);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleDecryptAndMerge = async () => {
    if (!uploadedPackage) {
      setErrorMessage("Please select a vault file first");
      return;
    }
    if (!passphrase.trim()) {
      setErrorMessage("Please enter the vault passphrase");
      return;
    }

    try {
      setErrorMessage(null);
      const decrypted = await decryptVault(uploadedPackage, passphrase.trim());
      const merged = mergeVaultHabits(habits, decrypted.habits || []);
      onSyncComplete(merged);
      setImportStatus(`Successfully decrypted and merged ${decrypted.habits?.length || 0} habits!`);
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch {
      setErrorMessage("Incorrect passphrase or corrupted vault file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#090A14]/95 border-white/10 text-white backdrop-blur-2xl p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white tracking-wide">
                Zero-Cloud Encrypted Vault & Sync
              </DialogTitle>
              <p className="text-xs text-white/50">
                AES-GCM-256 client-side encrypted backup & conflict-free sync
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-2xl my-2">
          <button
            onClick={() => {
              setActiveTab("export");
              setErrorMessage(null);
              setImportStatus(null);
            }}
            className={`py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "export" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Export Vault
          </button>
          <button
            onClick={() => {
              setActiveTab("import");
              setErrorMessage(null);
              setImportStatus(null);
            }}
            className={`py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "import" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Import Vault
          </button>
          <button
            onClick={() => {
              setActiveTab("gdrive");
              setErrorMessage(null);
              setImportStatus(null);
            }}
            className={`py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "gdrive" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Google Drive
          </button>
        </div>

        {activeTab === "export" && (
          <div className="space-y-4 my-2">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-white/70 space-y-1 leading-relaxed">
              <p>Your habits will be encrypted on-device with <strong>AES-GCM-256</strong> using your password.</p>
              <p className="text-white/40">Keep your passphrase safe. It cannot be recovered without it.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-white/70 block mb-1.5">
                Encryption Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  type="password"
                  placeholder="Enter strong password..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white rounded-xl text-xs"
                />
              </div>
            </div>

            <Button
              onClick={handleExportVault}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5"
            >
              <Download className="w-4 h-4 mr-2" /> Encrypt & Export Vault (.json)
            </Button>
          </div>
        )}

        {activeTab === "import" && (
          <div className="space-y-4 my-2">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-white/70 space-y-1 leading-relaxed">
              <p>Imports an encrypted vault file and performs a <strong>Set-Union merge</strong>.</p>
              <p className="text-white/40">Completions from both devices are preserved without data loss.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-white/70 block mb-1.5">
                Select Encrypted Vault (.json)
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/70 block mb-1.5">
                Vault Passphrase
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <Input
                  type="password"
                  placeholder="Enter vault passphrase..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white rounded-xl text-xs"
                />
              </div>
            </div>

            <Button
              onClick={handleDecryptAndMerge}
              disabled={!uploadedPackage}
              className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 disabled:opacity-40"
            >
              <ShieldCheck className="w-4 h-4 mr-2" /> Decrypt & Merge Habits
            </Button>
          </div>
        )}

        {activeTab === "gdrive" && (
          <div className="space-y-4 my-2">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-semibold">
                <Cloud className="w-4 h-4" />
                <span>Private Google Drive AppData Sync</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Daily Spark connects directly from your browser or Android device to your private <code>appDataFolder</code> on Google Drive (just like WhatsApp backup).
              </p>
              <p className="text-white/50 text-[11px]">
                100% Free for user & creator. Zero external backend servers. Your data never touches any intermediary server.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-white/60 space-y-1.5">
              <span className="font-semibold text-white/80 block">Folder Vault Sync:</span>
              <p>1. Export your encrypted vault file.</p>
              <p>2. Save it directly to your synced Google Drive, Syncthing, or Nextcloud folder.</p>
              <p>3. Load and merge on any other device with zero friction.</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

