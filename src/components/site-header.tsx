import Link from "next/link";
import { cn } from "~/lib/utils";

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
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          aria-current={page === "vote" ? "page" : undefined}
          className={cn(
            link,
            page === "vote"
              ? "border-studio-ink text-studio-ink"
              : "border-transparent text-studio-muted",
          )}
        >
          Vote
        </Link>
        <Link
          href="/results"
          transitionTypes={["nav-forward"]}
          aria-current={page === "rankings" ? "page" : undefined}
          className={cn(
            link,
            page === "rankings"
              ? "border-studio-ink text-studio-ink"
              : "border-transparent text-studio-muted",
          )}
        >
          Rankings
        </Link>
      </nav>
    </header>
  );
}
