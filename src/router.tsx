import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory, createBrowserHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

type CapacitorGlobal = { isNativePlatform?: () => boolean };

export const getRouter = () => {
  const queryClient = new QueryClient();

  const isNative =
    typeof window !== "undefined" &&
    Boolean((window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor?.isNativePlatform?.());
  const history = isNative ? createHashHistory() : createBrowserHistory();
  const rawBase = typeof import.meta.env.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";
  const basepath = isNative ? undefined : (rawBase.replace(/\/$/, "") || undefined);

  const router = createRouter({
    routeTree,
    history,
    basepath,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};

