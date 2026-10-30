import { useState, useEffect, useCallback } from "react";
import type { AvatarStatus } from "@/components/dithercn/avatar";
import type { FillVariant, Bloom, DitherColorName } from "@/lib/dither";
import { BLOOMS } from "@/lib/dither";

export const AVATAR_FILL_VARIANTS: readonly FillVariant[] = [
  "gradient",
  "dotted",
  "hatched",
  "solid",
] as const;

export const AVATAR_STATUS_VARIANTS: readonly AvatarStatus[] = [
  "online",
  "away",
  "busy",
  "offline",
] as const;

export const AVATAR_BLOOM_VARIANTS: readonly Bloom[] = BLOOMS;

export const PRESET_NAME_SEEDS = [
  "Ada Lovelace",
  "Linus",
  "Grace",
  "Margaret",
  "Ember",
  "Zenith",
] as const;

export const PRESET_AVATAR_COLORS: Record<(typeof PRESET_NAME_SEEDS)[number], DitherColorName> = {
  "Ada Lovelace": "blue",
  "Linus": "green",
  "Grace": "purple",
  "Margaret": "pink",
  "Ember": "orange",
  "Zenith": "red",
};

export interface AvatarProfile {
  name: string;
  fill: FillVariant;
  status: AvatarStatus;
  shape: "circle" | "square";
  bloom: Bloom;
  customImage?: string;
}

const STORAGE_KEYS = {
  name: "dailyspark_username",
  fill: "dailyspark_avatar_fill",
  status: "dailyspark_avatar_status",
  shape: "dailyspark_avatar_shape",
  bloom: "dailyspark_avatar_bloom",
  customImage: "dailyspark_custom_avatar_img",
} as const;

export function getStoredAvatarProfile(): AvatarProfile {
  if (typeof window === "undefined") {
    return {
      name: "Daily Spark",
      fill: "gradient",
      status: "online",
      shape: "circle",
      bloom: "low",
    };
  }

  const name = localStorage.getItem(STORAGE_KEYS.name)?.trim() || "Daily Spark";
  const rawFill = localStorage.getItem(STORAGE_KEYS.fill) as FillVariant | null;
  const fill: FillVariant =
    rawFill && AVATAR_FILL_VARIANTS.includes(rawFill) ? rawFill : "gradient";

  const rawStatus = localStorage.getItem(STORAGE_KEYS.status) as AvatarStatus | null;
  const status: AvatarStatus =
    rawStatus && AVATAR_STATUS_VARIANTS.includes(rawStatus) ? rawStatus : "online";

  const rawShape = localStorage.getItem(STORAGE_KEYS.shape);
  const shape = rawShape === "square" ? "square" : "circle";

  const rawBloom = localStorage.getItem(STORAGE_KEYS.bloom) as Bloom | null;
  const bloom: Bloom =
    rawBloom && (BLOOMS as readonly string[]).includes(rawBloom) ? rawBloom : "low";

  const customImage = localStorage.getItem(STORAGE_KEYS.customImage) || undefined;

  return { name, fill, status, shape, bloom, customImage };
}

export function saveAvatarProfile(profile: Partial<AvatarProfile>) {
  if (typeof window === "undefined") return;

  if (profile.name !== undefined) {
    localStorage.setItem(STORAGE_KEYS.name, profile.name.trim() || "Daily Spark");
  }
  if (profile.fill !== undefined) {
    localStorage.setItem(STORAGE_KEYS.fill, profile.fill);
  }
  if (profile.status !== undefined) {
    localStorage.setItem(STORAGE_KEYS.status, profile.status);
  }
  if (profile.shape !== undefined) {
    localStorage.setItem(STORAGE_KEYS.shape, profile.shape);
  }
  if (profile.bloom !== undefined) {
    localStorage.setItem(STORAGE_KEYS.bloom, profile.bloom);
  }
  if ("customImage" in profile) {
    if (profile.customImage) {
      localStorage.setItem(STORAGE_KEYS.customImage, profile.customImage);
    } else {
      localStorage.removeItem(STORAGE_KEYS.customImage);
    }
  }

  window.dispatchEvent(new Event("dailyspark:avatar-changed"));
}

/**
 * Resizes an uploaded image file via HTML5 Canvas to square data URI (default 192x192).
 */
export function processCustomAvatarFile(file: File, maxSize = 192): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid image file (PNG, JPG, WebP)"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not acquire 2D canvas context"));
          return;
        }
        // Center crop to square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function useAvatarProfile(): [
  AvatarProfile,
  (updates: Partial<AvatarProfile>) => void
] {
  const [profile, setProfile] = useState<AvatarProfile>(getStoredAvatarProfile);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getStoredAvatarProfile());
    };

    window.addEventListener("dailyspark:avatar-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("dailyspark:avatar-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const update = useCallback((updates: Partial<AvatarProfile>) => {
    saveAvatarProfile(updates);
    setProfile(getStoredAvatarProfile());
  }, []);

  return [profile, update];
}
