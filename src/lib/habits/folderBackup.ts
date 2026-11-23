import { Capacitor, registerPlugin } from "@capacitor/core";

export type BackupCadence = "off" | "daily" | "weekly";
export interface FolderBackupStatus {
  configured: boolean;
  writable: boolean;
  cadence: BackupCadence;
  lastSuccess: number;
  error: string;
}

export const isAndroid = () => Capacitor.getPlatform() === "android";
export const folderBackup = registerPlugin<{
  status(): Promise<FolderBackupStatus>;
  chooseFolder(): Promise<FolderBackupStatus>;
  configure(options: { cadence: BackupCadence }): Promise<FolderBackupStatus>;
  stage(options: { json: string }): Promise<void>;
  disconnect(): Promise<FolderBackupStatus>;
  backupNow(): Promise<FolderBackupStatus>;
}>("FolderBackup");
