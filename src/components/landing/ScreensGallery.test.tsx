import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes } from "react";
import { ScreensGallery } from "./ScreensGallery";

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  Link: ({
    to,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("Screens screenshot shelf", () => {
  it("keeps all screens available once, with an enlargement action", () => {
    render(<ScreensGallery screensLoadedOnDemand standalone />);
    const previews = screen.getAllByRole("button", {
      name: /^Enlarge .+ screen$/,
    });
    expect(previews).toHaveLength(13);
    expect(
      new Set(previews.map((button) => button.getAttribute("aria-label"))).size,
    ).toBe(previews.length);
    expect(
      screen.getByRole("button", { name: "Enlarge Data & backups screen" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("enlarges a screen, navigates with buttons and keys, and returns focus on close", async () => {
    render(<ScreensGallery screensLoadedOnDemand standalone />);
    const trigger = screen.getByRole("button", {
      name: "Enlarge Today screen",
    });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Today" });
    fireEvent.click(screen.getByRole("button", { name: "Next screen" }));
    expect(
      screen.getByRole("dialog", { name: "Today planner" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(screen.getByRole("dialog", { name: "Today" })).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("renders a looping gallery shelf without overlay arrow buttons", () => {
    render(<ScreensGallery screensLoadedOnDemand standalone />);
    expect(
      screen.getByRole("region", { name: "Screenshot gallery, looping" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next screenshots" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Previous screenshots" }),
    ).not.toBeInTheDocument();
  });
});
