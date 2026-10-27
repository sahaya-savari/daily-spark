import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory, createBrowserHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const isNative = typeof window !== "undefined" && Boolean((window as any).Capacitor?.isNativePlatform?.());
  const history = isNative 
    ? createHashHistory() 
    : createBrowserHistory({ base: import.meta.env.BASE_URL || "/" });

  const router = createRouter({
    routeTree,
    history,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};

