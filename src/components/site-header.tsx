import Link from "next/link";
import { cn } from "~/lib/utils";

const NAV_ITEMS = [
  { page: "vote", href: "/", label: "Vote", transition: "nav-back" },
  {
    page: "rankings",
    href: "/results",
    label: "Rankings",
    transition: "nav-forward",
  },
] as const;

export default function SiteHeader({ page }: { page: "vote" | "rankings" }) {
  return (
    <header className="site-header flex items-center justify-between gap-3 pb-1">
      <Link
        href="/"
        transitionTypes={["nav-back"]}
        className="inline-flex min-h-12 items-center rounded-full border-2 border-ring-ink bg-ring-coral px-4 font-display text-[22px] leading-none font-bold tracking-[-0.03em] text-white shadow-[0_3px_0_var(--color-ring-ink)] motion-safe:transition-transform motion-safe:duration-100 motion-safe:active:translate-y-0.5 motion-safe:active:shadow-[0_1px_0_var(--color-ring-ink)]"
      >
        cutest.
      </Link>
      <nav
        aria-label="Main navigation"
        className="inline-flex items-center gap-1 rounded-full border-2 border-ring-ink bg-ring-paper p-0.5 shadow-[0_3px_0_var(--color-ring-ink)]"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.page}
            href={item.href}
            transitionTypes={[item.transition]}
            aria-current={page === item.page ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full px-3.5 text-xs font-bold sm:px-4 sm:text-sm",
              page === item.page
                ? "bg-ring-ink text-ring-butter"
                : "text-ring-muted hover:text-ring-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
