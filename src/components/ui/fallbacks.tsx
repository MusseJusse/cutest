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
      <div className="h-5 w-14 rounded-full border-[1.5px] border-ring-ink/25 bg-ring-paper/80" />
      <div className="my-1 h-28 w-28 rounded-full border-2 border-ring-ink/20 bg-ring-paper sm:h-40 sm:w-40" />
      <div className="h-7 w-28 max-w-full rounded-lg bg-ring-ink/10" />
      <div className="h-3.5 w-24 rounded bg-ring-ink/10" />
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
        <span className="pointer-events-none absolute top-[43%] left-1/2 z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 -rotate-6 place-items-center rounded-full border-[2.5px] border-ring-ink bg-ring-gold font-display text-xs font-bold text-ring-ink shadow-[0_3px_0_var(--color-ring-ink)] sm:h-12 sm:w-12 sm:text-sm">
          VS
        </span>
        <VoteFallbackPanel side="home" />
        <VoteFallbackPanel side="away" />
      </div>
    </div>
  );
}

export function ResultsFallback() {
  return (
    <div role="status" aria-label="Loading rankings">
      <span className="sr-only">Loading rankings</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-ring-ink bg-ring-sky px-2 py-4 shadow-[0_3px_0_var(--color-ring-ink)] sm:px-4">
            <div className="h-5 w-9 rounded-full bg-ring-ink/15" />
            <div className="h-16 w-16 rounded-full border-2 border-ring-ink/20 bg-ring-paper sm:h-20 sm:w-20" />
            <div className="h-4 w-16 rounded bg-ring-ink/15" />
            <div className="h-3 w-12 rounded bg-ring-ink/10" />
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-ring-ink bg-ring-peach px-2 py-6 shadow-[0_3px_0_var(--color-ring-ink)] sm:px-4">
            <div className="h-5 w-9 rounded-full bg-ring-coral/35" />
            <div className="h-20 w-20 rounded-full border-2 border-ring-ink/20 bg-ring-paper sm:h-24 sm:w-24" />
            <div className="h-5 w-20 rounded bg-ring-ink/15" />
            <div className="h-3.5 w-14 rounded bg-ring-ink/10" />
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-ring-ink bg-ring-mint-soft px-2 py-4 shadow-[0_3px_0_var(--color-ring-ink)] sm:px-4">
            <div className="h-5 w-9 rounded-full bg-ring-ink/15" />
            <div className="h-16 w-16 rounded-full border-2 border-ring-ink/20 bg-ring-paper sm:h-20 sm:w-20" />
            <div className="h-4 w-16 rounded bg-ring-ink/15" />
            <div className="h-3 w-12 rounded bg-ring-ink/10" />
          </div>
        </div>
        <div className="flex h-11 items-center justify-between">
          <div className="h-9 w-24 rounded-full border-2 border-ring-ink/20 bg-ring-paper" />
          <div className="h-3.5 w-20 rounded bg-ring-ink/10" />
          <div className="h-9 w-24 rounded-full border-2 border-ring-ink/20 bg-ring-paper" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }, (_, row) => (
            <div
              key={row}
              className="flex h-[62px] items-center gap-3 rounded-2xl border-2 border-ring-ink/25 bg-ring-paper px-3 sm:px-4"
            >
              <div className="h-3.5 w-7 rounded bg-ring-ink/10" />
              <div className="h-10 w-10 rounded-full bg-ring-butter" />
              <div className="h-4 w-24 rounded bg-ring-ink/10" />
              <div className="ml-auto h-4 w-12 rounded bg-ring-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
