import { cn } from "~/lib/utils";

export const CONTENDER_PANEL_CLASS =
  "row-span-5 grid min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-subgrid items-center justify-items-center gap-y-2.5 px-3 py-5 sm:gap-y-3 sm:px-6 sm:py-7";

function VoteFallbackPanel({ side }: { side: "home" | "away" }) {
  return (
    <div
      className={cn(
        CONTENDER_PANEL_CLASS,
        side === "home" ? "bg-ring-peach" : "bg-ring-sky",
      )}
    >
      <div className="h-6 w-14 rounded-full border-[1.5px] border-ring-ink/25 bg-ring-paper/80" />
      <div className="my-1 h-24 w-24 rounded-full border-2 border-ring-ink/20 bg-ring-paper min-[360px]:h-28 min-[360px]:w-28 sm:h-40 sm:w-40" />
      <div className="h-7 w-28 max-w-full rounded-lg bg-ring-ink/10 sm:h-10" />
      <div className="h-4 w-24 rounded bg-ring-ink/10" />
      <div className="mt-1 h-11 w-full max-w-[230px] rounded-full border-2 border-ring-ink/20 bg-ring-ink/10" />
    </div>
  );
}

export function VoteFallback() {
  return (
    <div role="status" aria-label="Loading Pokémon">
      <span className="sr-only">Loading Pokémon</span>
      <div
        aria-hidden="true"
        className="relative grid grid-cols-2 gap-[2.5px] overflow-hidden rounded-[22px] border-[2.5px] border-ring-ink bg-ring-ink shadow-[0_4px_0_var(--color-ring-ink)]"
      >
        <span className="pointer-events-none absolute top-[102px] left-1/2 z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 -rotate-6 place-items-center rounded-full border-[2.5px] border-ring-ink bg-ring-gold font-display text-[11px] font-bold text-ring-ink shadow-[0_3px_0_var(--color-ring-ink)] min-[360px]:top-[110px] min-[360px]:h-10 min-[360px]:w-10 min-[360px]:text-xs sm:top-[148px] sm:h-12 sm:w-12 sm:text-sm">
          VS
        </span>
        <VoteFallbackPanel side="home" />
        <VoteFallbackPanel side="away" />
      </div>
    </div>
  );
}

function PodiumFallbackCard({ place }: { place: 1 | 2 | 3 }) {
  const isFirst = place === 1;
  const surface =
    place === 1
      ? "bg-ring-peach"
      : place === 2
        ? "bg-ring-sky"
        : "bg-ring-mint-soft";

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border-2 border-ring-ink shadow-[0_3px_0_var(--color-ring-ink)]",
        surface,
        isFirst
          ? "order-first col-span-2 px-3 pt-4 pb-3.5 sm:order-none sm:col-span-1 sm:px-4 sm:pt-5 sm:pb-4"
          : "px-2.5 py-3 sm:mt-6 sm:px-4 sm:py-4",
      )}
    >
      <div
        className={cn(
          "h-5 w-9 rounded-full",
          isFirst ? "bg-ring-coral/35" : "bg-ring-ink/15",
        )}
      />
      <div
        className={cn(
          "my-2 rounded-full border-2 border-ring-ink/20 bg-ring-paper",
          isFirst ? "h-24 w-24 sm:h-28 sm:w-28" : "h-20 w-20 sm:h-24 sm:w-24",
        )}
      />
      <div
        className={cn(
          "rounded bg-ring-ink/15",
          isFirst ? "h-6 w-24 sm:h-8" : "h-5 w-20 sm:h-7",
        )}
      />
      <div className="mt-1 h-4 w-14 rounded bg-ring-ink/10 sm:h-5" />
      <div className="mt-1 h-3.5 w-12 rounded bg-ring-ink/10" />
      <div className="mt-2 h-3 w-3 rounded bg-ring-ink/10" />
    </div>
  );
}

export function ResultsFallback() {
  return (
    <div role="status" aria-label="Loading rankings">
      <span className="sr-only">Loading rankings</span>
      <div aria-hidden="true" className="flex flex-col gap-5">
        <div className="grid grid-cols-2 items-start gap-2.5 sm:grid-cols-3 sm:gap-4">
          <PodiumFallbackCard place={2} />
          <PodiumFallbackCard place={1} />
          <PodiumFallbackCard place={3} />
        </div>
        <div className="flex h-11 items-center justify-between">
          <div className="h-11 w-24 rounded-full border-2 border-ring-ink/20 bg-ring-paper" />
          <div className="h-3.5 w-20 rounded bg-ring-ink/10" />
          <div className="h-11 w-24 rounded-full border-2 border-ring-ink/20 bg-ring-paper" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }, (_, row) => (
            <div
              key={row}
              className="flex h-16 items-center gap-3 rounded-2xl border-2 border-ring-ink/25 bg-ring-paper px-3 sm:h-[68px] sm:px-4"
            >
              <div className="h-3.5 w-8 rounded bg-ring-ink/10" />
              <div className="h-10 w-10 rounded-full bg-ring-butter sm:h-11 sm:w-11" />
              <div className="h-4 w-24 rounded bg-ring-ink/10" />
              <div className="ml-auto h-4 w-12 rounded bg-ring-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
