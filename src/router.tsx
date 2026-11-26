import { createRouter, createHashHistory, createBrowserHistory } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const isNative =
    typeof window !== "undefined" &&
    (Capacitor.isNativePlatform() ||
     Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) ||
     Boolean((window as unknown as { androidBridge?: unknown }).androidBridge) ||
     window.location.protocol === "capacitor:" ||
     window.location.protocol === "file:" ||
     (window.location.hostname === "localhost" && window.location.port === ""));

  const history = isNative ? createHashHistory() : createBrowserHistory();

  const rawBase = typeof import.meta.env.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";
  const cleanBase = rawBase.trim().replace(/^(\.\/|\.)/, "").replace(/\/+$/, "");
  const basepath = isNative || !cleanBase || cleanBase === "/"
    ? undefined
    : (cleanBase.startsWith("/") ? cleanBase : `/${cleanBase}`);

  const router = createRouter({
    routeTree,
    history,
    basepath,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};


