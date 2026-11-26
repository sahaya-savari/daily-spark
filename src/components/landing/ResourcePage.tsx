import { Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { SITE, SITE_FAQS } from "@/lib/site";
import { SITE_PAGES, type SitePageKey } from "@/lib/site-pages";
import { THEME_CONFIGS } from "@/lib/habits/appearance";
import terms from "../../../TERMS.md?raw";
import license from "../../../LICENSE?raw";

const guides = [
  "docs",
  "getting-started",
  "faq",
  "backup-restore",
  "design-system",
] as const;

function PolicyText({ text }: { text: string }) {
  return (
    <div className="space-y-6">
      {text
        .replace(/^#[^\n]*\n/, "")
        .replace(/^(#{2,6} .+)$/gm, "\n$1\n")
        .trim()
        .split(/\n\s*\n/)
        .map((block, i) => {
          if (block.startsWith("## "))
            return (
              <h2 key={i} className="pt-4 text-xl font-bold text-foreground">
                {block.slice(3)}
              </h2>
            );
          if (block.startsWith("- "))
            return (
              <ul
                key={i}
                className="list-disc space-y-2 pl-5 text-muted-foreground"
              >
                {block.split("\n").map((line) => (
                  <li key={line}>{line.replace(/^- /, "")}</li>
                ))}
              </ul>
            );
          return (
            <p
              key={i}
              className="whitespace-pre-line leading-7 text-muted-foreground"
            >
              {block}
            </p>
          );
        })}
    </div>
  );
}

export function ResourcePage({ page }: { page: SitePageKey }) {
  const content = SITE_PAGES[page];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-ember focus:px-4 focus:py-3 focus:text-black"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto max-w-[1100px] px-4 py-12 outline-none sm:px-6 sm:py-20"
      >
        <header className="max-w-3xl border-b border-border pb-10">
          <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-ember">
            {content.eyebrow}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-5 max-w-[62ch] text-base leading-7 text-muted-foreground sm:text-lg">
            {content.description}
          </p>
        </header>
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-20">
          <div className="min-w-0 space-y-9">
            {page === "faq" && (
              <div className="divide-y divide-border">
                {SITE_FAQS.map(({ question, answer }) => (
                  <details key={question} className="group py-5 first:pt-0">
                    <summary className="cursor-pointer rounded-md py-2 text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember">
                      {question}
                    </summary>
                    <p className="mt-3 max-w-[65ch] leading-7 text-muted-foreground">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            )}
            {page === "design-system" && (
              <section
                aria-label="Color palette"
                className="grid grid-cols-2 gap-4 sm:grid-cols-4"
              >
                {[
                  ["Ember", "#EC894C"],
                  ["Canvas", "#0E0F12"],
                  ["Surface", "#18191E"],
                  ["Warm text", "#F5EBE1"],
                ].map(([label, color]) => (
                  <div
                    key={label}
                    className="overflow-hidden rounded-2xl border border-border"
                  >
                    <div className="h-24" style={{ backgroundColor: color }} />
                    <div className="p-3">
                      <p className="font-semibold">{label}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {color}
                      </p>
                    </div>
                  </div>
                ))}
              </section>
            )}
            {content.sections.map(({ title, text }) => (
              <section key={title}>
                <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
                <p className="mt-3 max-w-[65ch] text-base leading-7 text-muted-foreground">
                  {text}
                </p>
              </section>
            ))}
            {page === "design-system" && (
              <section>
                <h2 className="text-xl font-bold">App themes</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {Object.values(THEME_CONFIGS).map((theme) => (
                    <div
                      key={theme.id}
                      className="rounded-2xl border border-border p-4"
                    >
                      <span
                        className="mb-3 block size-8 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <h3 className="font-semibold">{theme.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {theme.subtitle}
                      </p>
                      <code className="mt-3 block text-xs text-muted-foreground">
                        {theme.accent}
                      </code>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {page === "terms" && <PolicyText text={terms} />}
            {page === "license" && <PolicyText text={license} />}
            {page === "security" && (
              <a
                href={`${SITE.repo}/security`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-ember/30 px-5 font-semibold text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                Report on GitHub Security ↗
              </a>
            )}
            {page === "getting-started" && (
              <Link
                to="/download"
                className="inline-flex min-h-11 items-center rounded-full bg-ember px-5 font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                Choose a download
              </Link>
            )}
          </div>
          <aside className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <nav
              aria-label="Resource pages"
              className="space-y-1 lg:sticky lg:top-28"
            >
              <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Explore the guides
              </p>
              {guides.map((key) => (
                <Link
                  key={key}
                  to={SITE_PAGES[key].path}
                  aria-current={page === key ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember ${page === key ? "bg-ember/10 font-semibold text-ember" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}
                >
                  {SITE_PAGES[key].title}
                </Link>
              ))}
              <Link
                to="/app"
                className="mt-4 block rounded-lg px-3 py-3 text-sm font-semibold text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              >
                Open Web App →
              </Link>
            </nav>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
