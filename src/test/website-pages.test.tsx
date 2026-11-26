import { render, screen } from "@testing-library/react";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes } from "react";
import { routeTree } from "@/routeTree.gen";
import { SiteFooter } from "@/components/landing/SiteChrome";
import { ResourcePage } from "@/components/landing/ResourcePage";
import { LandingPage } from "@/components/landing/LandingPage";
import { SITE_PAGES } from "@/lib/site-pages";

const { routerStub } = vi.hoisted(() => ({ routerStub: { navigate: vi.fn() } }));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  Link: ({ to, hash, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; hash?: string }) => <a href={`${to}${hash ? `#${hash}` : ""}`} {...props}>{children}</a>,
  useLocation: () => ({ hash: "" }),
  useRouter: () => routerStub,
}));

describe("dedicated website pages", () => {
  it("matches every resource page without falling back to the homepage", () => {
    const router = createRouter({ routeTree });
    for (const page of Object.values(SITE_PAGES)) {
      expect(router.matchRoutes(page.path).at(-1)?.routeId).toBe(page.path);
    }
  });

  it("keeps footer guides and policies inside the website", () => {
    render(<SiteFooter />);
    const links = { Documentation: "/docs", "Getting started": "/getting-started", FAQ: "/faq", "Backup & Restore": "/backup-restore", "Design system": "/design-system", About: "/about", "Terms of Use": "/terms", Security: "/security", "MIT License": "/license" };
    for (const [name, href] of Object.entries(links)) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).not.toHaveAttribute("target");
    }
    expect(screen.getByRole("link", { name: /^GitHub/ })).toHaveAttribute("href", "https://github.com/sahaya-savari/daily-spark");
    expect(screen.getByRole("link", { name: /^GitLab/ })).toHaveAttribute("href", "https://gitlab.com/sahaya-savari/daily-spark");
  });

  it("renders Features as its own page rather than the full landing page", () => {
    render(<LandingPage targetSection="features" />);
    expect(screen.getByRole("heading", { level: 1, name: "What it does" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Screens" })).not.toBeInTheDocument();
    expect(screen.queryByText("Interactive sample preview.")).not.toBeInTheDocument();
  });

  it("renders a dedicated FAQ with answers and local guide navigation", () => {
    render(<ResourcePage page="faq" />);
    expect(screen.getByRole("heading", { level: 1, name: "Frequently asked questions" })).toBeInTheDocument();
    expect(screen.getByText("What happens if I uninstall or clear browser data?")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Resource pages" })).toBeInTheDocument();
  });

  it("keeps the full license and terms text readable inside the site", () => {
    const { unmount } = render(<ResourcePage page="license" />);
    expect(screen.getByText(/Permission is hereby granted, free of charge/)).toBeInTheDocument();
    unmount();
    render(<ResourcePage page="terms" />);
    expect(screen.getByRole("heading", { name: "4. Data & Backups" })).toBeInTheDocument();
    expect(screen.getByText("Your data is stored on your device.")).toBeInTheDocument();
  });
});
