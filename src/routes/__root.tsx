import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { SiteDitherBackground } from "@/components/landing/SiteDitherBackground";
import { SITE } from "@/lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold text-ember">404</h1>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Go home
          </Link>
          <a
            href="https://github.com/sahaya-savari/daily-spark/releases"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
          >
            Download APK
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Your habits are safe on this device. Try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Try again
          </button>
          <a
            href={SITE.basePath}
            className="inline-flex items-center justify-center rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Site-level, route-independent tags (charset, viewport, theme-color,
    // apple-mobile-web-app-*, og:image, twitter:image) and the icon/manifest/
    // font <link>s live in index.html and are injected per route at build time.
    // React owns only the tags that vary by route, so nothing is emitted twice.
    meta: [
      { title: "Daily Spark" },
      { name: "description", content: "A calm, offline-first habit and streak tracker." },
      { name: "author", content: "sahaya-savari" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// React 19 hoists <HeadContent> and <Scripts> to the document head/body on its
// own, so the shell returns a fragment instead of invalid <html>/<head>/<body>
// wrappers (which the browser had to unwrap anyway).
function RootShell({ children }: { children: ReactNode }) {
  return (
    <>
      <HeadContent />
      {children}
      <Scripts />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteDitherBackground />
      <Outlet />
      <Toaster theme="dark" position="top-center" />
    </QueryClientProvider>
  );
}
