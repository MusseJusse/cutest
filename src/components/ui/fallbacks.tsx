import { cn } from "~/lib/utils";
import { SPRITE_TILE_CLASS } from "./pokemon-sprite";

export const CONTENDER_PANEL_CLASS =
  "row-span-5 row-start-1 grid min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-subgrid items-center justify-items-center gap-y-2 px-3 py-4 sm:gap-y-2.5 sm:px-6 sm:py-6";

export const VS_BADGE_CLASS =
  "pointer-events-none col-start-1 col-end-3 row-start-2 z-10 grid h-8 w-8 -rotate-6 place-items-center place-self-center rounded-full border-[2.5px] border-ring-ink bg-ring-gold font-display text-[11px] font-bold tracking-tight text-ring-ink shadow-[0_3px_0_var(--color-ring-ink)] min-[360px]:h-9 min-[360px]:w-9 min-[360px]:text-xs sm:h-12 sm:w-12 sm:text-sm";

function VoteFallbackPanel({ side }: { side: "home" | "away" }) {
  return (
    <div
      className={cn(
        CONTENDER_PANEL_CLASS,
        side === "home"
          ? "col-start-1 bg-ring-peach"
          : "col-start-2 bg-ring-sky",
      )}
    >
      <div className="h-[23px] w-14 rounded-full border-[1.5px] border-ring-ink/25 bg-ring-paper/80" />
      <div className={SPRITE_TILE_CLASS.arena} />
      <div className="h-6 w-28 max-w-full rounded-lg bg-ring-ink/10 sm:h-9" />
      <div className="h-4 w-24 rounded bg-ring-ink/10" />
      <div className="mt-1 h-11 w-full max-w-[220px] rounded-full border-2 border-ring-ink/20 bg-ring-ink/10" />
    </div>
  );
}

export function VoteFallback() {
  return (
    <div role="status" aria-label="Loading Pokémon">
      <span className="sr-only">Loading Pokémon</span>
      <div
        aria-hidden="true"
        className="relative grid grid-cols-2 grid-rows-[auto_auto_auto_auto_auto] gap-x-[2.5px] overflow-hidden rounded-[22px] border-[2.5px] border-ring-ink bg-ring-ink shadow-[0_4px_0_var(--color-ring-ink)]"
      >
        <VoteFallbackPanel side="home" />
        <VoteFallbackPanel side="away" />
        <span className={VS_BADGE_CLASS}>VS</span>
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
          ? "col-span-2 px-3 pt-4 pb-3.5 sm:col-span-1 sm:px-4 sm:pt-5 sm:pb-4"
          : place === 2
            ? "px-2.5 py-3 sm:order-first sm:mt-6 sm:px-4 sm:py-4"
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
        className={
          isFirst ? SPRITE_TILE_CLASS.podiumFirst : SPRITE_TILE_CLASS.podium
        }
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
          <PodiumFallbackCard place={1} />
          <PodiumFallbackCard place={2} />
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
              className="flex h-16 items-center gap-3 rounded-2xl border-2 border-ring-ink/25 bg-ring-paper px-3 sm:h-[72px] sm:px-4"
            >
              <div className="h-3.5 w-8 rounded bg-ring-ink/10" />
              <div className={SPRITE_TILE_CLASS.row} />
              <div className="h-4 w-24 rounded bg-ring-ink/10" />
              <div className="ml-auto h-4 w-12 rounded bg-ring-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
