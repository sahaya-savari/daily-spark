import { describe, expect, it } from "vitest";
import { emojiForIcon, iconKeyFor } from "./icons";

describe("habit icons", () => {
  it("maps legacy emojis from old backups to line icons", () => {
    expect(iconKeyFor({ emoji: "📚" })).toBe("read");
    expect(iconKeyFor({ emoji: "🏋️" })).toBe("dumbbell");
    expect(iconKeyFor({ emoji: "☀" })).toBe("morning");
  });

  it("prefers an explicit icon and falls back to the spark", () => {
    expect(iconKeyFor({ icon: "water", emoji: "📚" })).toBe("water");
    expect(iconKeyFor({ emoji: "🦄" })).toBe("flame");
  });

  it("keeps an emoji for the old Android app when saving", () => {
    expect(emojiForIcon("run")).toBe("🏃");
  });
});
