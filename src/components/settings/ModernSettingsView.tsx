import React, { useState, useRef, useMemo } from "react";
import {
  Smartphone,
  Palette,
  Sliders,
  Database,
  Heart,
  Info,
  ChevronRight,
  Pencil,
  Check,
  Download,
  Upload,
  FileText,
  ShieldCheck,
  Sparkles,
  Bug,
  Github,
  Star,
  Lock,
  QrCode,
  X,
  Search,
  Bell,
  Clock,
  Shield,
  ExternalLink,
} from "lucide-react";
import { AppearanceSwitcher } from "@/components/habits/AppearanceSwitcher";
import { useHabitStore, habitActions } from "@/lib/habits/store";
import { THEME_CONFIGS, getStoredTheme } from "@/lib/habits/appearance";
import { SITE } from "@/lib/site";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, type AvatarStatus } from "@/components/dithercn/avatar";
import {
  useAvatarProfile,
  AVATAR_FILL_VARIANTS,
  AVATAR_STATUS_VARIANTS,
  AVATAR_BLOOM_VARIANTS,
  PRESET_NAME_SEEDS,
  PRESET_AVATAR_COLORS,
  processCustomAvatarFile,
  type AvatarProfile,
} from "@/lib/habits/avatar";
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  i18nActions,
} from "@/lib/i18n";
import type { FillVariant, Bloom } from "@/lib/dither";
import { cn } from "@/lib/utils";

export interface ModernSettingsViewProps {
  onExportBackup: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportMarkdown: () => void;
  onExportCsv: () => void;
  onExportTsv?: () => void;
  onExportVault?: () => void;
  onOpenAirGapped?: () => void;
  onOpenVaultSync?: () => void;
  onOpenAppLock?: () => void;
  embedded?: boolean;
}

type ActiveSection =
  | "appearance"
  | "appStyle"
  | "preferences"
  | "data"
  | "support"
  | "about"
  | "privacyPolicy"
  | "termsConditions"
  | "requestLanguage"
  | null;

export function ModernSettingsView({
  onExportBackup,
  onFileUpload,
  onExportMarkdown,
  onExportCsv,
  onExportTsv,
  onExportVault,
  onOpenAirGapped,
  onOpenVaultSync,
  onOpenAppLock,
  embedded = false,
}: ModernSettingsViewProps) {
  const { settings } = useHabitStore();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [profile, updateProfile] = useAvatarProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<AvatarProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() =>
    i18nActions.getLanguage()
  );
  const [searchQuery, setSearchQuery] = useState("");

  const openProfileEditor = () => {
    setDraftProfile(profile);
    setIsEditingProfile(true);
  };

  const currentThemeMode = settings.themeMode || getStoredTheme();
  const currentThemeConfig =
    THEME_CONFIGS[currentThemeMode] || THEME_CONFIGS.minimal;

  interface SettingsItem {
    id: string;
    section: ActiveSection;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    statusText?: string;
    keywords: string[];
    action?: () => void;
  }

  interface SettingsGroup {
    title: string;
    description: string;
    items: SettingsItem[];
  }

  const groups: SettingsGroup[] = useMemo(() => {
    return [
      {
        title: "Appearance & Style",
        description: "Visual theme, accent palette, and layout scaling",
        items: [
          {
            id: "appearance",
            section: "appearance",
            title: "Appearance & Themes",
            subtitle: "Palette mode, accent color, and circadian sunset warmth",
            icon: Palette,
            iconBg: "bg-amber-500/15",
            iconColor: "text-amber-500",
            statusText: currentThemeConfig.name,
            keywords: ["theme", "appearance", "dark", "light", "colors", "circadian", "sunset", "palette", "mode", "warmth"],
          },
          {
            id: "appStyle",
            section: "appStyle",
            title: "Typography & Density",
            subtitle: "Font scales, layout spacing, and icon weights",
            icon: Smartphone,
            iconBg: "bg-violet-500/15",
            iconColor: "text-violet-400",
            statusText: "Standard",
            keywords: ["style", "typography", "font", "density", "icons", "size", "layout", "compact"],
          },
        ],
      },
      {
        title: "Habit Preferences",
        description: "Daily reminder alarms, midnight rollover, and security lock",
        items: [
          {
            id: "preferences",
            section: "preferences",
            title: "Routine & Preferences",
            subtitle: "Daily reminders, night owl rollover, and 10 languages",
            icon: Sliders,
            iconBg: "bg-blue-500/15",
            iconColor: "text-blue-400",
            statusText: settings.rolloverHour ? `${settings.rolloverHour}:00 AM (Night Owl)` : "Midnight",
            keywords: ["preferences", "notifications", "reminders", "time", "rollover", "night owl", "language", "circadian"],
          },
          ...(onOpenAppLock
            ? [
                {
                  id: "appLock",
                  section: null as ActiveSection,
                  title: "App Lock & Security",
                  subtitle: "Protect habits and private notes with PIN or biometrics",
                  icon: Lock,
                  iconBg: "bg-rose-500/15",
                  iconColor: "text-rose-400",
                  statusText: "Secured",
                  keywords: ["lock", "security", "pin", "biometric", "privacy", "fingerprint", "faceid"],
                  action: onOpenAppLock,
                },
              ]
            : []),
        ],
      },
      {
        title: "Data & Sovereignty",
        description: "100% offline-first storage, 5-format exports, and device syncing",
        items: [
          {
            id: "data",
            section: "data",
            title: "Data & Backups",
            subtitle: "5 export formats (JSON, CSV, TSV, Markdown, Vault) and restore",
            icon: Database,
            iconBg: "bg-emerald-500/15",
            iconColor: "text-emerald-400",
            statusText: "5 Formats",
            keywords: ["data", "backup", "export", "restore", "csv", "tsv", "json", "markdown", "vault", "inspect", "import"],
          },
          ...(onOpenAirGapped
            ? [
                {
                  id: "airGapped",
                  section: null as ActiveSection,
                  title: "Air-Gapped QR Transfer",
                  subtitle: "Transfer encrypted records peer-to-peer with zero network access",
                  icon: QrCode,
                  iconBg: "bg-cyan-500/15",
                  iconColor: "text-cyan-400",
                  statusText: "Offline QR",
                  keywords: ["qr", "sync", "air-gapped", "transfer", "offline", "camera"],
                  action: onOpenAirGapped,
                },
              ]
            : []),
          ...(onOpenVaultSync
            ? [
                {
                  id: "vaultSync",
                  section: null as ActiveSection,
                  title: "Encrypted Peer Vault Sync",
                  subtitle: "Set-union conflict-free multi-device synchronization",
                  icon: Sparkles,
                  iconBg: "bg-indigo-500/15",
                  iconColor: "text-indigo-400",
                  statusText: "AES-GCM",
                  keywords: ["vault", "peer", "sync", "aes", "encryption", "crdt"],
                  action: onOpenVaultSync,
                },
              ]
            : []),
        ],
      },
      {
        title: "About & Community",
        description: "Free and open-source software, legal terms, and feedback",
        items: [
          {
            id: "about",
            section: "about",
            title: "About Daily Spark",
            subtitle: `v${SITE.apk.version} • 100% offline, MIT licensed, privacy guarantee`,
            icon: Info,
            iconBg: "bg-neutral-500/15",
            iconColor: "text-neutral-300",
            statusText: `v${SITE.apk.version}`,
            keywords: ["about", "version", "license", "privacy", "terms", "mit", "author", "guarantee"],
          },
          {
            id: "support",
            section: "support",
            title: "Support & Community",
            subtitle: "Source repository, issue reporting, and feedback",
            icon: Heart,
            iconBg: "bg-pink-500/15",
            iconColor: "text-pink-400",
            statusText: "Open Source",
            keywords: ["support", "github", "issues", "bug", "star", "community", "contribute"],
          },
        ],
      },
    ];
  }, [currentThemeConfig.name, settings.rolloverHour, onOpenAppLock, onOpenAirGapped, onOpenVaultSync]);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => {
        const matchingItems = group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.subtitle.toLowerCase().includes(q) ||
            item.keywords.some((k) => k.toLowerCase().includes(q))
        );
        return {
          ...group,
          items: matchingItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [groups, searchQuery]);

  const resolveAvatarColor = (name: string): string => {
    if (name in PRESET_AVATAR_COLORS) {
      return PRESET_AVATAR_COLORS[name as keyof typeof PRESET_AVATAR_COLORS];
    }
    return currentThemeConfig?.accent || "orange";
  };

  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);

  const handleCustomImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processCustomAvatarFile(file, 192);
      if (isEditingProfile) {
        setDraftProfile((prev) => ({ ...prev, customImage: dataUrl }));
      } else {
        updateProfile({ customImage: dataUrl });
      }
    } catch (err) {
      console.error("Failed to process custom image:", err);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleSendTestNotification = async () => {
    setTestNotificationStatus("Sending...");
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        let perm = Notification.permission;
        if (perm === "default") {
          perm = await Notification.requestPermission();
        }
        if (perm === "granted") {
          new Notification("Daily Spark: Time to ignite your streak! 🔥", {
            body: "Your daily reminder is functioning perfectly. Keep up the momentum!",
            icon: "/icons/icon-192.png",
          });
        }
      }
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      setTestNotificationStatus("Sent! ✓");
      setTimeout(() => setTestNotificationStatus(null), 3000);
    } catch (err) {
      console.error("Test notification error:", err);
      setTestNotificationStatus("Done");
      setTimeout(() => setTestNotificationStatus(null), 3000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = draftProfile.name.trim() || "Daily Spark";
    updateProfile({
      name: cleanName,
      fill: draftProfile.fill,
      status: draftProfile.status,
      shape: draftProfile.shape,
      bloom: draftProfile.bloom || "low",
      customImage: draftProfile.customImage,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className={cn("w-full mx-auto px-1 sm:px-2 py-4 space-y-6", !embedded ? "max-w-xl lg:max-w-4xl lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0" : "max-w-xl")}>
      {/* Hidden file input for uploading custom avatar photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleCustomImageUpload}
        className="hidden"
        aria-hidden="true"
      />

      {/* Left Column (Profile & Identity on Desktop) */}
      <div className={cn("space-y-4", !embedded && "lg:col-span-5 xl:col-span-4")}>
        {/* 1. Ultra-Minimalist Profile Header */}
        <div className={cn("flex flex-col items-center justify-center text-center pt-2", !embedded && "lg:rounded-3xl lg:border lg:border-white/10 lg:bg-surface/90 lg:p-6 lg:backdrop-blur-md")}>
          <div
            className="relative group cursor-pointer"
            onClick={openProfileEditor}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openProfileEditor();
              }
            }}
            aria-label="Edit Profile & Avatar"
          >
            <div className="size-20 sm:size-24 rounded-full border-2 border-white/10 bg-surface-2 p-1 shadow-xl overflow-hidden flex items-center justify-center transition-transform hover:scale-105 relative">
              {profile.customImage ? (
                <div className="relative size-full">
                  <img
                    src={profile.customImage}
                    alt={profile.name}
                    className={cn(
                      "size-full object-cover",
                      profile.shape === "circle" ? "rounded-full" : "rounded-2xl"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute bottom-0.5 right-0.5 size-3.5 rounded-full ring-2 ring-background",
                      profile.status === "online" && "bg-emerald-400",
                      profile.status === "away" && "bg-amber-400",
                      profile.status === "busy" && "bg-rose-500",
                      profile.status === "offline" && "bg-neutral-500"
                    )}
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <Avatar
                  name={profile.name}
                  label={profile.name}
                  size={88}
                  shape={profile.shape}
                  fill={profile.fill}
                  status={profile.status}
                  color={resolveAvatarColor(profile.name)}
                  bloom={profile.bloom || "low"}
                />
              )}
            </div>
            {/* Single edit pencil badge at bottom-right */}
            <span
              className="absolute bottom-0 right-0 size-7 sm:size-8 rounded-full bg-ember text-[var(--ember-foreground,#FFFFFF)] grid place-items-center shadow-lg border-2 border-background transition-transform group-hover:scale-110"
              aria-hidden="true"
            >
              <Pencil className="size-3.5 text-current" />
            </span>
          </div>

          {/* Username */}
          <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold text-foreground tracking-normal">
            {profile.name}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {profile.status} · {currentThemeConfig.name} theme
          </p>
        </div>
      </div>

      {/* Right Column (Settings Sections on Desktop) */}
      <div className={cn("space-y-5", !embedded && "lg:col-span-7 xl:col-span-8")}>
        {/* Search Bar for Quick Navigation */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-faint" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings (e.g. night owl, export, themes, lock)..."
            className="h-11 pl-10 pr-9 rounded-2xl bg-surface/90 border border-border/40 text-xs font-medium placeholder:text-faint focus-visible:ring-ember shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filtered Sections */}
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-border/40 bg-surface/80 space-y-2">
            <p className="text-sm font-semibold text-foreground">No settings found</p>
            <p className="text-xs text-muted-foreground">
              No settings match &ldquo;{searchQuery}&rdquo;. Try searching for theme, backup, or rollover.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="rounded-full text-xs mt-1"
            >
              Clear search
            </Button>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <section key={group.title} className="space-y-1.5">
              <div className="flex items-center justify-between px-2 pt-1">
                <p className="text-[11.5px] font-bold uppercase tracking-wider text-faint">
                  {group.title}
                </p>
                <span className="text-[11px] text-faint hidden sm:inline">
                  {group.description}
                </span>
              </div>
              <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-surface/90 backdrop-blur-md shadow-sm overflow-hidden divide-y divide-border/20">
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.section) {
                          setActiveSection(item.section);
                        }
                      }}
                      className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left transition-colors hover:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <span
                          className={cn(
                            "grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl",
                            item.iconBg,
                            item.iconColor
                          )}
                        >
                          <IconComponent className="size-4.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-sans text-[14.5px] sm:text-[15.5px] font-semibold text-foreground leading-tight truncate">
                            {item.title}
                          </p>
                          <p className="font-sans text-xs text-muted-foreground mt-0.5 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs shrink-0 pl-1">
                        {item.statusText && (
                          <span className="capitalize font-semibold text-faint hidden xs:inline text-[11.5px] rounded-full bg-surface-2 px-2.5 py-0.5 border border-border/30">
                            {item.statusText}
                          </span>
                        )}
                        <ChevronRight className="size-4 text-faint" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* MODAL: Unified Profile & Avatar Customizer */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-md rounded-3xl border border-white/10 bg-surface p-6 max-h-[90vh] overflow-y-auto space-y-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Edit Profile &amp; Avatar</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Customize your display name and dithercn avatar, or upload a custom photo.
            </DialogDescription>
          </DialogHeader>

          {/* Live Centering Avatar Preview */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-2 border border-white/5 space-y-2">
            <div className="p-1 rounded-full border border-white/10 shadow-lg relative size-24 overflow-hidden flex items-center justify-center">
              {draftProfile.customImage ? (
                <img
                  src={draftProfile.customImage}
                  alt={draftProfile.name}
                  className={cn(
                    "size-full object-cover",
                    draftProfile.shape === "circle" ? "rounded-full" : "rounded-2xl"
                  )}
                />
              ) : (
                <Avatar
                  name={draftProfile.name}
                  label={draftProfile.name}
                  size={96}
                  shape={draftProfile.shape}
                  fill={draftProfile.fill}
                  status={draftProfile.status}
                  color={resolveAvatarColor(draftProfile.name)}
                  bloom={draftProfile.bloom || "low"}
                />
              )}
            </div>

            {/* Remove photo button if custom image exists */}
            {draftProfile.customImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDraftProfile((prev) => ({ ...prev, customImage: undefined }))}
                className="text-xs text-rose-400 hover:text-rose-300 h-7 px-2.5 gap-1.5 font-medium"
              >
                <X className="size-3" />
                <span>Remove Photo</span>
              </Button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* 1. Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Display Name / Seed</span>
                <span className="text-[10px] text-muted-foreground">Updates face live</span>
              </label>
              <Input
                value={draftProfile.name}
                onChange={(e) =>
                  setDraftProfile((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter display name..."
                maxLength={24}
                className="h-10 rounded-xl bg-surface-2 border-border/50 text-foreground"
              />
            </div>

            {/* 2. Avatar Presets & Photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Avatar Presets &amp; Photo
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {PRESET_NAME_SEEDS.map((seed) => {
                  const isSelected = draftProfile.name === seed && !draftProfile.customImage;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          name: seed,
                          customImage: undefined,
                        }))
                      }
                      className={cn(
                        "p-0.5 rounded-full border-2 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
                        isSelected
                          ? "border-ember shadow-md scale-105 ring-2 ring-ember/30"
                          : "border-white/10 opacity-80 hover:opacity-100"
                      )}
                      title={`Select ${seed} (${PRESET_AVATAR_COLORS[seed]})`}
                      aria-label={`Select ${seed} avatar`}
                    >
                      <Avatar
                        name={seed}
                        label={seed}
                        size={34}
                        shape="circle"
                        fill={draftProfile.fill}
                        color={PRESET_AVATAR_COLORS[seed]}
                        bloom="low"
                      />
                    </button>
                  );
                })}

                {/* '+' Button to upload custom picture */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "size-9 rounded-full border-2 border-dashed border-white/20 hover:border-ember bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center cursor-pointer transition-all hover:scale-110 text-muted-foreground hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember",
                    draftProfile.customImage && "border-ember text-ember bg-ember/10"
                  )}
                  title="Upload photo image"
                  aria-label="Upload photo image"
                >
                  <span className="font-bold text-lg leading-none select-none">+</span>
                </button>
              </div>
            </div>

            {/* 2. Selectable Fill Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Fill Style (dithercn)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {AVATAR_FILL_VARIANTS.map((fill) => (
                  <button
                    key={fill}
                    type="button"
                    onClick={() => setDraftProfile((prev) => ({ ...prev, fill }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-xs capitalize transition-all cursor-pointer",
                      draftProfile.fill === fill
                        ? "bg-ember/15 border-ember text-ember font-bold shadow-sm"
                        : "bg-surface-2 border-white/5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <span className="text-[12px]">{fill}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Presence Status Dot */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Presence Status Dot
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {AVATAR_STATUS_VARIANTS.map((status) => {
                  const dotColor =
                    status === "online"
                      ? "bg-emerald-400"
                      : status === "away"
                      ? "bg-amber-400"
                      : status === "busy"
                      ? "bg-rose-500"
                      : "bg-neutral-500";
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setDraftProfile((prev) => ({ ...prev, status }))}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl border text-xs capitalize transition-all cursor-pointer",
                        draftProfile.status === status
                          ? "bg-ember/15 border-ember text-foreground font-bold shadow-sm"
                          : "bg-surface-2 border-white/5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <span className={cn("size-2 rounded-full", dotColor)} />
                      <span className="text-[11px]">{status}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Shape Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Avatar Shape
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["circle", "square"] as const).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setDraftProfile((prev) => ({ ...prev, shape }))}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs capitalize transition-all cursor-pointer",
                      draftProfile.shape === shape
                        ? "bg-ember/15 border-ember text-ember font-bold shadow-sm"
                        : "bg-surface-2 border-white/5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {shape === "circle" ? "Circle" : "Rounded Square"}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Bloom Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Bloom Glow
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {AVATAR_BLOOM_VARIANTS.map((bloom) => (
                  <button
                    key={bloom}
                    type="button"
                    onClick={() => setDraftProfile((prev) => ({ ...prev, bloom }))}
                    className={cn(
                      "py-2 px-2 rounded-xl border text-xs capitalize transition-all cursor-pointer",
                      draftProfile.bloom === bloom
                        ? "bg-ember/15 border-ember text-ember font-bold shadow-sm"
                        : "bg-surface-2 border-white/5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {bloom}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-ember text-white font-semibold shadow-md">
                Save Avatar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Appearance & App Style Sub-Screen */}
      <Dialog
        open={activeSection === "appearance" || activeSection === "appStyle"}
        onOpenChange={(open) => !open && setActiveSection(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {activeSection === "appStyle" ? "App Style" : "Appearance"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {activeSection === "appStyle"
                ? "Configure typography, density, and icon preferences."
                : "Select your theme palette and circadian night warmth glide."}
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <AppearanceSwitcher
              key={activeSection}
              defaultTab={activeSection === "appStyle" ? "style" : "appearance"}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Preferences Sub-Screen */}
      <Dialog
        open={activeSection === "preferences"}
        onOpenChange={(open) => !open && setActiveSection(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Preferences</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure daily behavior, internationalization, and privacy lock.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {/* 10+ Languages Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-2 border border-white/5">
              <div>
                <p className="font-semibold text-sm">Language</p>
                <p className="text-xs text-muted-foreground">Supported across 10 languages</p>
              </div>
              <select
                value={currentLang}
                onChange={(e) => {
                  const lang = e.target.value as SupportedLanguage;
                  setCurrentLang(lang);
                  i18nActions.setLanguage(lang);
                }}
                className="h-9 px-3 rounded-xl bg-surface border border-border/40 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ember"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Non-breaking "Request a Language" button */}
            <button
              type="button"
              onClick={() => setActiveSection("requestLanguage")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-white/10 hover:border-ember/40 bg-white/[0.02] hover:bg-white/[0.04] text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              <span>Missing your language? Request a translation</span>
              <ChevronRight className="size-3.5 text-faint shrink-0" />
            </button>

            {/* Solar Circadian Warmth */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-2 border border-white/5">
              <div>
                <p className="font-semibold text-sm">Solar Circadian Warmth</p>
                <p className="text-xs text-muted-foreground">Gentle sunset glow reduction at night</p>
              </div>
              <Switch
                checked={settings.solarCircadianGlide !== false}
                onCheckedChange={(checked) =>
                  habitActions.updateSettings({ solarCircadianGlide: checked })
                }
              />
            </div>

            {/* Daily Habit Reminders */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-2 border border-white/5">
              <div>
                <p className="font-semibold text-sm">Daily Habit Reminders</p>
                <p className="text-xs text-muted-foreground">
                  Local device notification at {settings.defaultTime || "20:00"}
                </p>
              </div>
              <Switch
                checked={Boolean(settings.enabled)}
                onCheckedChange={(checked) =>
                  habitActions.updateSettings({ enabled: checked })
                }
              />
            </div>

            {/* Send Test Notification Button */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-2 border border-white/5">
              <div>
                <p className="font-semibold text-sm">Test Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Verify alert permissions, audio, and vibration
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendTestNotification}
                className="h-8 rounded-xl border-white/10 text-xs font-semibold hover:bg-white/5"
              >
                {testNotificationStatus || "Send Test"}
              </Button>
            </div>

            {/* Directive 4: Realigned Day Rollover (Night Owl) */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-2 border border-white/5">
              <div>
                <p className="font-semibold text-sm">Day Rollover (Night Owl)</p>
                <p className="text-xs text-muted-foreground">
                  Keep yesterday&apos;s habits active until chosen hour
                </p>
              </div>
              <select
                value={settings.rolloverHour ?? 0}
                onChange={(e) =>
                  habitActions.updateSettings({ rolloverHour: Number(e.target.value) })
                }
                className="h-9 px-3 rounded-xl bg-surface border border-border/40 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ember shrink-0 ml-3"
              >
                <option value={0}>Midnight (12:00 AM)</option>
                <option value={1}>1:00 AM</option>
                <option value={2}>2:00 AM</option>
                <option value={3}>3:00 AM (Night Owl)</option>
                <option value={4}>4:00 AM</option>
                <option value={5}>5:00 AM</option>
              </select>
            </div>

            {/* App Lock PIN / Biometric */}
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
                  <Lock className="size-4 text-ember" />
                  <div>
                    <p className="font-semibold text-sm">App Lock &amp; Biometrics</p>
                    <p className="text-xs text-muted-foreground">
                      Protect habits and notes with platform biometrics or 4-digit PIN
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-faint" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Request a Language */}
      <Dialog
        open={activeSection === "requestLanguage"}
        onOpenChange={(open) => !open && setActiveSection("preferences")}
      >
        <DialogContent className="max-w-md rounded-3xl border border-white/10 bg-surface p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Request a Language</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Daily Spark is open-source and community translated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              We currently ship built-in dictionaries for:
            </p>
            <div className="flex flex-wrap gap-1.5 py-1">
              {SUPPORTED_LANGUAGES.map((l) => (
                <span
                  key={l.code}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-foreground"
                >
                  {l.nativeName} ({l.code})
                </span>
              ))}
            </div>
            <p>
              To suggest another language or contribute translations, open an issue or pull request on our GitHub repository.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveSection("preferences")}
            >
              Close
            </Button>
            <a
              href={`${SITE.issues}/new?title=Language+Request&body=Please+add+support+for+language:`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-ember text-white text-xs font-semibold hover:bg-ember/90 transition-colors shadow-sm"
            >
              Request on GitHub
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Data & Backups Sub-Screen (5 Formats) */}
      <Dialog
        open={activeSection === "data"}
        onOpenChange={(open) => !open && setActiveSection(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Data &amp; Backups</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Your habits never touch a server. Export 5 reliable formats anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-2">
            {/* Format 1: Full JSON Backup */}
            <button
              type="button"
              onClick={onExportBackup}
              className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <Download className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Export Full Backup (.json)</p>
                <p className="text-xs text-muted-foreground">
                  Complete history, logs, habits, and private notes
                </p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </button>

            {/* Format 2: CSV Habits & Notes */}
            <button
              type="button"
              onClick={onExportCsv}
              data-testid="export-csv-btn"
              className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <Download className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Export Habits CSV (.csv)</p>
                <p className="text-xs text-muted-foreground">
                  Spreadsheet-friendly records for Excel, Numbers, or Sheets
                </p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </button>

            {/* Format 3: TSV Habits & Notes */}
            <button
              type="button"
              onClick={onExportTsv || onExportCsv}
              className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <Download className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Export Habits &amp; Notes TSV (.tsv)</p>
                <p className="text-xs text-muted-foreground">
                  Tab-separated data for database imports and data science
                </p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </button>

            {/* Format 4: Markdown Summary */}
            <button
              type="button"
              onClick={onExportMarkdown}
              className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <FileText className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Export Markdown Summary (.md)</p>
                <p className="text-xs text-muted-foreground">
                  Readable report for Obsidian, Notion, or Logseq
                </p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </button>

            {/* Format 5: Encrypted Vault (.vault) */}
            <button
              type="button"
              onClick={onExportVault || onOpenVaultSync}
              className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <ShieldCheck className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Export Encrypted Vault (.vault)</p>
                <p className="text-xs text-muted-foreground">
                  Zero-knowledge AES-GCM-256 encrypted package
                </p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </button>

            {/* Restore File Input accepting all 5 formats */}
            <label className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer">
              <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                <Upload className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Inspect &amp; Restore Backup</p>
                <p className="text-xs text-muted-foreground">
                  Accepts .json, .csv, .tsv, .md, and .vault
                </p>
              </div>
              <input
                type="file"
                accept=".json,.csv,.tsv,.md,.vault"
                onChange={onFileUpload}
                className="hidden"
              />
              <ChevronRight className="size-4 text-faint" />
            </label>

            {onOpenAirGapped && (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(null);
                  onOpenAirGapped();
                }}
                className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                  <QrCode className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Air-Gapped QR Sync</p>
                  <p className="text-xs text-muted-foreground">Transfer between devices with zero network</p>
                </div>
                <ChevronRight className="size-4 text-faint" />
              </button>
            )}

            {onOpenVaultSync && (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(null);
                  onOpenVaultSync();
                }}
                className="flex w-full items-center gap-3 rounded-2xl p-3 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-ember-soft text-ember">
                  <Sparkles className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Encrypted Peer Vault Sync</p>
                  <p className="text-xs text-muted-foreground">
                    Set-union conflict-free cross-device synchronization
                  </p>
                </div>
                <ChevronRight className="size-4 text-faint" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Support Sub-Screen */}
      <Dialog
        open={activeSection === "support"}
        onOpenChange={(open) => !open && setActiveSection(null)}
      >
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
                <Github className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">GitHub Repository</p>
                <p className="text-xs text-muted-foreground">Source code, releases, and discussions</p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </a>

            <a
              href={SITE.issues}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 rounded-2xl p-3.5 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-white/[0.06] text-foreground">
                <Bug className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Report an Issue</p>
                <p className="text-xs text-muted-foreground">File a bug report or request a new feature</p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </a>

            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 rounded-2xl p-3.5 bg-surface-2 border border-white/5 hover:bg-white/[0.04] text-left transition-colors"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
                <Star className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Star on GitHub</p>
                <p className="text-xs text-muted-foreground">Support the open-source project</p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: About This App Sub-Screen */}
      <Dialog
        open={activeSection === "about"}
        onOpenChange={(open) => !open && setActiveSection(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">About Daily Spark</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              A calm, honest habit tracker built for lasting consistency.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-sm text-muted-foreground">
            <div className="p-4 rounded-2xl bg-surface-2 border border-white/5 space-y-2.5">
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
                <span>Offline-First (Zero Cloud, Local Storage)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">Author</span>
                <a
                  href={SITE.authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ember hover:underline font-medium"
                >
                  {SITE.author}
                </a>
              </div>
            </div>

            {/* In-app Legal Dialog Triggers */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveSection("privacyPolicy")}
                className="h-10 rounded-xl border-white/10 bg-surface-2 text-xs font-semibold hover:bg-white/[0.08] text-foreground"
              >
                Privacy Policy
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveSection("termsConditions")}
                className="h-10 rounded-xl border-white/10 bg-surface-2 text-xs font-semibold hover:bg-white/[0.08] text-foreground"
              >
                Terms &amp; Conditions
              </Button>
            </div>

            <div
              data-testid="privacy-card"
              role="region"
              aria-label="Privacy Information"
              className="rounded-2xl border border-white/10 bg-surface-2/80 p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-ember" />
                <h3 className="font-display text-sm font-bold text-foreground">Privacy Guarantee</h3>
              </div>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                No accounts, No servers, No ads, No analytics, No data leaves this device
              </p>
            </div>

            <p className="text-xs leading-relaxed text-faint px-1">
              Daily Spark was created to prove that habit tracking can be quiet, private, and honest.
              No artificial pressure, no streak-shaming, and no commercial tracking.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: In-App Privacy Policy Dialog */}
      <Dialog
        open={activeSection === "privacyPolicy"}
        onOpenChange={(open) => !open && setActiveSection("about")}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 max-h-[85vh] overflow-y-auto space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="size-5 text-ember" />
              Privacy Policy
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Effective Date: October 2026 · Daily Spark v{SITE.apk.version}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="p-3 rounded-xl bg-surface-2 border border-white/5 text-foreground font-medium">
              Zero Cloud, Zero Tracking, 100% Local Device Storage.
            </div>
            <p>
              <strong>1. Data Collection:</strong> Daily Spark does not collect, transmit, store, or sell any personal data, usage metrics, habit names, notes, or device identifiers. There are no analytics SDKs, advertising beacons, or telemetry libraries embedded in the application.
            </p>
            <p>
              <strong>2. Local Storage:</strong> All habits, logs, streaks, and preferences reside strictly within your browser&apos;s sandboxed localStorage or IndexedDB on your device.
            </p>
            <p>
              <strong>3. Backups &amp; Sync:</strong> Backups are created client-side. When using Air-Gapped QR sync or Encrypted Vault files, data is transferred peer-to-peer or encrypted with AES-GCM-256 before leaving your device. No unencrypted data is ever sent to any server.
            </p>
            <p>
              <strong>4. Biometrics:</strong> When App Lock Biometrics are enabled, the WebAuthn standard authenticates locally with your hardware security enclave (e.g., Windows Hello, Touch ID, Android Biometrics). Biometric credentials never leave your hardware.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveSection("about")}
              className="rounded-xl"
            >
              Back to About
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: In-App Terms & Conditions Dialog */}
      <Dialog
        open={activeSection === "termsConditions"}
        onOpenChange={(open) => !open && setActiveSection("about")}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-white/10 bg-surface p-6 max-h-[85vh] overflow-y-auto space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Info className="size-5 text-ember" />
              Terms &amp; Conditions
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              MIT License · Free &amp; Open Source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong>1. License &amp; Usage:</strong> Daily Spark is open-source software licensed under the MIT License. You are free to use, inspect, modify, and distribute the application for personal or commercial use in accordance with the license.
            </p>
            <p>
              <strong>2. No Warranty:</strong> The software is provided &quot;as is&quot;, without warranty of any kind, express or implied. The authors are not liable for any claims, damages, or data loss arising from the use of the application.
            </p>
            <p>
              <strong>3. Data Ownership &amp; Responsibility:</strong> Because Daily Spark operates entirely offline without remote cloud servers, you maintain complete ownership and responsibility for backing up your data regularly using the export features.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveSection("about")}
              className="rounded-xl"
            >
              Back to About
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
