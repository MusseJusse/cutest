"use client";

import { useRef, useState } from "react";
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

function persistCurrentPairCookie(pair: PokemonPair) {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `currentPair=${encodeURIComponent(JSON.stringify(pair))}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function VoteButton({ onVote, name }: { onVote: () => void; name: string }) {
  return (
    <button
      type="button"
      onClick={onVote}
      className="flex min-h-12 w-full items-center justify-between gap-2 rounded-lg border border-studio-ink/25 px-3 py-2.5 text-left text-xs font-medium hover:bg-studio-ink/5 motion-safe:transition-[background-color,transform] motion-safe:duration-150 motion-safe:active:scale-[0.96] sm:px-4 sm:text-sm"
    >
      <span className="min-w-0 break-words">
        Vote <span className="capitalize">{name}</span>
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="h-[1.2cap] w-[1.2cap] shrink-0"
      >
        <path
          d="M5 15 15 5M5 5h10v10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function ContenderPanel({
  side,
  pokemon,
  stats,
  onVote,
}: {
  side: "home" | "away";
  pokemon: Pokemon;
  stats?: ContenderStats;
  onVote: () => void;
}) {
  const battles = stats ? stats.wins + stats.losses : 0;

  return (
    <article
      className={cn(
        CONTENDER_PANEL_CLASS,
        side === "home" ? "bg-studio-lavender" : "bg-studio-sky",
      )}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h2
          className={cn(
            "font-display leading-tight font-extrabold tracking-tight break-words capitalize",
            pokemon.name.length >= 11
              ? "text-[clamp(1.125rem,3cqi,2rem)]"
              : "text-[clamp(1.5rem,4cqi,2rem)]",
          )}
        >
          {pokemon.name}
        </h2>
        <span className="text-[11px] text-studio-muted tabular-nums">
          #{pokemon.dexNumber.toString().padStart(4, "0")}
        </span>
      </div>
      <div className="-mx-3.5 grid h-[170px] min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] place-items-center overflow-clip sm:mx-0 sm:h-[220px]">
        <PokemonSprite
          key={pokemon.dexNumber}
          pokemon={pokemon}
          className="h-auto w-[235px] max-w-full sm:w-[300px]"
          priority="high"
        />
      </div>
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-studio-muted tabular-nums">
        <span>
          {battles > 0 && stats
            ? `${Math.round(stats.winRate * 100)}% win rate`
            : stats
              ? "No votes yet"
              : "Record unavailable"}
        </span>
        {battles > 0 && stats ? (
          <span className="hidden @min-[32rem]:inline">
            {stats.wins.toLocaleString("en-US")} wins ·{" "}
            {stats.losses.toLocaleString("en-US")} losses
          </span>
        ) : null}
      </p>
      <VoteButton onVote={onVote} name={pokemon.name} />
    </article>
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
  }));
  const queueRef = useRef<ReturnType<typeof createBattleQueue> | null>(null);
  queueRef.current ??= createBattleQueue({
    initialPairs,
    initialStats,
    submitVote: (pair, pick) => voteAction(pair, pick),
    fetchMorePairs: () => getMorePairsAction(),
    onNextPair: persistCurrentPairCookie,
    onChange: setSnapshot,
  });

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

  return (
    <div className="flex flex-col gap-3">
      <section
        aria-label="Choose the cutest Pokémon"
        className="grid grid-cols-2 gap-y-3 overflow-clip rounded-2xl"
      >
        <ContenderPanel
          side="home"
          pokemon={home}
          stats={snapshot.stats[home.dexNumber]}
          onVote={() => queueRef.current?.vote(0)}
        />
        <ContenderPanel
          side="away"
          pokemon={away}
          stats={snapshot.stats[away.dexNumber]}
          onVote={() => queueRef.current?.vote(1)}
        />
      </section>
      {failedCount > 0 ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-studio-danger/40 bg-studio-paper px-4 py-3 text-xs text-studio-ink"
        >
          <p className="m-0">
            <strong className="font-semibold">
              {failedCount === 1
                ? "Vote not saved."
                : `${failedCount} votes not saved.`}
            </strong>{" "}
            <span className="text-studio-muted">
              The server could not record your vote.
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => queueRef.current?.retryFailedVotes()}
              className="min-h-9 rounded-md bg-studio-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => queueRef.current?.dismissFailedVotes()}
              className="min-h-9 rounded-md px-2.5 py-1.5 text-xs text-studio-muted hover:text-studio-ink"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
