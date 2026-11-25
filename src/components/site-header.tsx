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
  const link =
    "inline-flex min-h-11 items-center border-b-2 px-0.5 text-xs hover:text-studio-ink";

  return (
    <header className="site-header flex items-center justify-between gap-3 border-b border-studio-line pb-2.5">
      <Link
        href="/"
        transitionTypes={["nav-back"]}
        className="inline-flex min-h-11 items-center font-display text-[27px] font-extrabold tracking-[-0.05em] text-studio-accent"
      >
        cutest.
      </Link>
      <nav aria-label="Main navigation" className="flex gap-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.page}
            href={item.href}
            transitionTypes={[item.transition]}
            aria-current={page === item.page ? "page" : undefined}
            className={cn(
              link,
              page === item.page
                ? "border-studio-ink text-studio-ink"
                : "border-transparent text-studio-muted",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
