import pages from "./site-pages.json";

type SitePages = {
  [K in keyof typeof pages]: Omit<(typeof pages)[K], "path"> & {
    path: `/${K}`;
  };
};
export const SITE_PAGES = pages as SitePages;
export type SitePageKey = keyof typeof SITE_PAGES;
