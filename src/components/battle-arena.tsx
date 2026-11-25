"use client";

import { useState } from "react";
import { preload } from "react-dom";
import { getMorePairsAction, voteAction } from "~/lib/action";
import {
  createBattleQueue,
  type BattleQueueSnapshot,
  type StatsMap,
} from "~/lib/battle-queue";
import { cn } from "~/lib/utils";
import type { Pokemon, PokemonPair } from "~/sdk/pokemon";
import type { ContenderStats } from "~/sdk/vote";
import { CONTENDER_PANEL_CLASS } from "./ui/fallbacks";
import PokemonSprite, { spriteUrl } from "./ui/pokemon-sprite";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// Use a distinct name from the legacy HttpOnly "currentPair" cookie so browsers do not ignore writes.
function persistPairCookie(pair: PokemonPair) {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `battlePair=${encodeURIComponent(JSON.stringify(pair))}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function ContenderCorner({
  side,
  pokemon,
  stats,
  disabled,
  onVote,
}: {
  side: "home" | "away";
  pokemon: Pokemon;
  stats?: ContenderStats;
  disabled?: boolean;
  onVote: () => void;
}) {
  const battles = stats ? stats.wins + stats.losses : 0;
  const isHome = side === "home";

  return (
    <button
      type="button"
      onClick={onVote}
      disabled={disabled}
      className={cn(
        CONTENDER_PANEL_CLASS,
        "group cursor-pointer text-center text-ring-ink focus-visible:z-20 focus-visible:-outline-offset-4 disabled:cursor-wait disabled:opacity-65 motion-safe:transition-colors motion-safe:duration-150",
        isHome
          ? "bg-ring-peach hover:bg-ring-peach-hover"
          : "bg-ring-sky hover:bg-ring-sky-hover",
      )}
    >
      <span className="justify-self-center rounded-full border-[1.5px] border-ring-ink bg-ring-paper px-2.5 py-0.5 text-[11px] font-bold text-ring-ink tabular-nums">
        #{pokemon.dexNumber.toString().padStart(4, "0")}
      </span>

      <span
        className={cn(
          "my-1 flex h-28 w-28 items-center justify-center justify-self-center overflow-hidden rounded-full border-2 border-ring-ink bg-ring-paper shadow-[0_4px_0_rgb(25_24_59/0.14)] motion-safe:transition-transform motion-safe:duration-150 sm:h-40 sm:w-40",
          isHome
            ? "motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-2"
            : "motion-safe:group-hover:scale-105 motion-safe:group-hover:rotate-2",
        )}
      >
        <PokemonSprite
          key={pokemon.dexNumber}
          pokemon={pokemon}
          className="h-[154px] w-[154px] max-w-none shrink-0 drop-shadow-[0_2px_0_rgb(25_24_59/0.18)] sm:h-[224px] sm:w-[224px]"
          priority="high"
        />
      </span>

      <span
        className={cn(
          "block min-w-0 font-display leading-tight font-bold tracking-tight break-words text-ring-ink capitalize",
          pokemon.name.length >= 11
            ? "text-[clamp(1.125rem,3cqi,1.875rem)]"
            : "text-[clamp(1.375rem,4cqi,2rem)]",
        )}
      >
        {pokemon.name}
      </span>

      <span className="block text-[11px] font-semibold text-ring-muted tabular-nums sm:text-xs">
        {battles > 0 && stats ? (
          <>
            <span>{Math.round(stats.winRate * 100)}% win rate</span>
            <span className="hidden @min-[32rem]:inline">
              {" "}
              ({stats.wins.toLocaleString("en-US")}W{" "}
              {stats.losses.toLocaleString("en-US")}L)
            </span>
          </>
        ) : stats ? (
          "No votes yet"
        ) : (
          "Record unavailable"
        )}
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "mt-1 inline-flex min-h-11 w-full max-w-[230px] items-center justify-center justify-self-center rounded-full border-2 border-ring-ink px-3 py-2 font-display text-xs font-bold text-white shadow-[0_3px_0_var(--color-ring-ink)] motion-safe:transition-transform motion-safe:duration-100 motion-safe:group-active:translate-y-0.5 motion-safe:group-active:shadow-[0_1px_0_var(--color-ring-ink)] sm:px-5 sm:text-sm",
          isHome ? "bg-ring-coral" : "bg-ring-cobalt",
        )}
      >
        <span className="truncate">
          Pick <span className="capitalize">{pokemon.name}</span>
        </span>
      </span>
    </button>
  );
}

export default function BattleArena({
  initialPairs,
  initialStats,
}: {
  initialPairs: PokemonPair[];
  initialStats: StatsMap;
}) {
  const [snapshot, setSnapshot] = useState<BattleQueueSnapshot>(() => ({
    pairs: initialPairs,
    stats: initialStats,
    failedVotes: [],
    refilling: false,
    refillFailed: false,
  }));
  const [queue] = useState(() =>
    createBattleQueue({
      initialPairs,
      initialStats,
      submitVote: (pair, pick, voteId) => voteAction(pair, pick, voteId),
      fetchMorePairs: () => getMorePairsAction(),
      onNextPair: persistPairCookie,
      onChange: setSnapshot,
    }),
  );

  const [current, next] = snapshot.pairs;
  if (next) {
    for (const pokemon of next) {
      preload(spriteUrl(pokemon.dexNumber), {
        as: "image",
        fetchPriority: "low",
      });
    }
  }

  if (!current) return null;

  const [home, away] = current;
  const failedCount = snapshot.failedVotes.length;
  const waitingForNext = !next && snapshot.refilling;
  const blockedByRefillError = !next && snapshot.refillFailed;

  return (
    <div className="flex flex-col gap-3">
      <section
        aria-label="Choose the cutest Pokémon"
        className="relative grid grid-cols-2 gap-[2.5px] overflow-hidden rounded-[22px] border-[2.5px] border-ring-ink bg-ring-ink shadow-[0_4px_0_var(--color-ring-ink)]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[43%] left-1/2 z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 -rotate-6 place-items-center rounded-full border-[2.5px] border-ring-ink bg-ring-gold font-display text-xs font-bold tracking-tight text-ring-ink shadow-[0_3px_0_var(--color-ring-ink)] sm:h-12 sm:w-12 sm:text-sm"
        >
          VS
        </span>
        <ContenderCorner
          side="home"
          pokemon={home}
          stats={snapshot.stats[home.dexNumber]}
          disabled={waitingForNext}
          onVote={() => queue.vote(0)}
        />
        <ContenderCorner
          side="away"
          pokemon={away}
          stats={snapshot.stats[away.dexNumber]}
          disabled={waitingForNext}
          onVote={() => queue.vote(1)}
        />
      </section>
      {waitingForNext ? (
        <p
          role="status"
          aria-live="polite"
          className="m-0 text-center text-xs font-semibold text-ring-muted"
        >
          Loading next matchup…
        </p>
      ) : null}
      {blockedByRefillError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ring-danger bg-ring-paper px-4 py-3 text-xs text-ring-ink shadow-[0_3px_0_rgb(198_54_54/0.25)]"
        >
          <p className="m-0">
            <strong className="font-bold">
              Could not load the next matchup.
            </strong>{" "}
            <span className="text-ring-muted">Try again to keep voting.</span>
          </p>
          <button
            type="button"
            onClick={() => void queue.refill()}
            className="min-h-9 cursor-pointer rounded-full border-2 border-ring-ink bg-ring-coral px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_2px_0_var(--color-ring-ink)] hover:brightness-105"
          >
            Load matchups
          </button>
        </div>
      ) : null}
      {failedCount > 0 ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ring-danger bg-ring-paper px-4 py-3 text-xs text-ring-ink shadow-[0_3px_0_rgb(198_54_54/0.25)]"
        >
          <p className="m-0">
            <strong className="font-bold">
              {failedCount === 1
                ? "Vote not saved."
                : `${failedCount} votes not saved.`}
            </strong>{" "}
            <span className="text-ring-muted">
              {failedCount === 1
                ? "The server could not record your vote."
                : "The server could not record your votes."}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => queue.retryFailedVotes()}
              className="min-h-9 cursor-pointer rounded-full border-2 border-ring-ink bg-ring-coral px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_2px_0_var(--color-ring-ink)] hover:brightness-105"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => queue.dismissFailedVotes()}
              className="min-h-9 cursor-pointer rounded-full px-2.5 py-1.5 text-xs font-semibold text-ring-muted hover:text-ring-ink"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
