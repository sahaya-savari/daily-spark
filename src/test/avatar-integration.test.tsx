import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  Avatar,
  AvatarGroup,
  avatarFace,
  avatarColor,
  type AvatarStatus,
} from "@/components/dithercn/avatar";
import {
  getStoredAvatarProfile,
  saveAvatarProfile,
  AVATAR_FILL_VARIANTS,
  AVATAR_STATUS_VARIANTS,
  AVATAR_BLOOM_VARIANTS,
  PRESET_NAME_SEEDS,
  PRESET_AVATAR_COLORS,
} from "@/lib/habits/avatar";
import type { FillVariant } from "@/lib/dither";

describe("dithercn Avatar & AvatarGroup Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Avatar Component", () => {
    it("renders avatar with name seed and accessible role", () => {
      render(<Avatar name="Inlitx" />);
      const el = screen.getByRole("img", { name: "Inlitx" });
      expect(el).toBeInTheDocument();
      expect(el.getAttribute("data-slot")).toBe("avatar");
    });

    it.each(AVATAR_FILL_VARIANTS)(
      "renders with fill style '%s' without errors",
      (fill: FillVariant) => {
        const { container } = render(<Avatar name="Spark" fill={fill} />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
        const paths = svg?.querySelectorAll("path");
        expect(paths?.length).toBeGreaterThan(0);
      }
    );

    it.each(AVATAR_STATUS_VARIANTS)(
      "renders presence status dot '%s' with correct accessible label and data-status",
      (status: AvatarStatus) => {
        render(<Avatar name="Ember" status={status} />);
        const el = screen.getByRole("img", { name: `Ember, ${status}` });
        expect(el).toBeInTheDocument();
        expect(el.getAttribute("data-status")).toBe(status);
        // Presence status dot indicator span
        const dot = el.querySelector("span[aria-hidden='true']");
        expect(dot).toBeInTheDocument();
      }
    );

    it("renders square shape when requested", () => {
      render(<Avatar name="Zenith" shape="square" />);
      const el = screen.getByRole("img", { name: "Zenith" });
      expect(el.className).toContain("rounded-[22%]");
    });

    it("generates deterministic face data for a given seed string", () => {
      const face1 = avatarFace("DailySpark");
      const face2 = avatarFace("DailySpark");
      expect(face1).toEqual(face2);

      const faceDifferent = avatarFace("AnotherSeed");
      expect(face1).not.toEqual(faceDifferent);
    });

    it("generates a stable theme color for a string", () => {
      const color1 = avatarColor("Inlitx");
      const color2 = avatarColor("Inlitx");
      expect(color1).toBe(color2);
    });
  });

  describe("AvatarGroup Component", () => {
    it("renders a row of avatars with role=group", () => {
      render(
        <AvatarGroup>
          <Avatar name="Alice" />
          <Avatar name="Bob" />
          <Avatar name="Charlie" />
        </AvatarGroup>
      );
      const group = screen.getByRole("group");
      expect(group).toBeInTheDocument();
      expect(group.getAttribute("data-slot")).toBe("avatar-group");
    });

    it("limits items and displays '+N' chip when max is specified", () => {
      render(
        <AvatarGroup max={2}>
          <Avatar name="One" />
          <Avatar name="Two" />
          <Avatar name="Three" />
          <Avatar name="Four" />
        </AvatarGroup>
      );
      expect(screen.getByRole("img", { name: "One" })).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Two" })).toBeInTheDocument();
      expect(screen.queryByRole("img", { name: "Three" })).not.toBeInTheDocument();

      // +2 overflow badge
      const moreChip = screen.getByRole("img", { name: "2 more" });
      expect(moreChip).toBeInTheDocument();
      expect(moreChip.textContent).toBe("+2");
    });
  });

  describe("Avatar Profile Persistence", () => {
    it("reads default profile if storage is empty", () => {
      const profile = getStoredAvatarProfile();
      expect(profile.name).toBe("Daily Spark");
      expect(profile.fill).toBe("gradient");
      expect(profile.status).toBe("online");
      expect(profile.shape).toBe("circle");
    });

    it("persists and updates avatar profile attributes in localStorage", () => {
      saveAvatarProfile({
        name: "Atlas",
        fill: "hatched",
        status: "busy",
        shape: "square",
      });

      const profile = getStoredAvatarProfile();
      expect(profile.name).toBe("Atlas");
      expect(profile.fill).toBe("hatched");
      expect(profile.status).toBe("busy");
      expect(profile.shape).toBe("square");
    });

    it("verifies the 6 approved dithercn avatar seed presets and unique colors", () => {
      expect(PRESET_NAME_SEEDS).toEqual([
        "Ada Lovelace",
        "Linus",
        "Grace",
        "Margaret",
        "Ember",
        "Zenith",
      ]);

      const colors = PRESET_NAME_SEEDS.map((s) => PRESET_AVATAR_COLORS[s]);
      // Each of the 6 presets has a defined color
      expect(colors.every(Boolean)).toBe(true);
      // All 6 presets have unique distinct colors
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(6);
    });

    it("persists bloom and custom image data URL", () => {
      const fakeImage = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      saveAvatarProfile({
        name: "Ada Lovelace",
        bloom: "high",
        customImage: fakeImage,
      });

      const profile = getStoredAvatarProfile();
      expect(profile.name).toBe("Ada Lovelace");
      expect(profile.bloom).toBe("high");
      expect(profile.customImage).toBe(fakeImage);

      // Clearing custom image
      saveAvatarProfile({ customImage: undefined });
      const cleared = getStoredAvatarProfile();
      expect(cleared.customImage).toBeUndefined();
    });
  });
});

