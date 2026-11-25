"use client";

import { useId, useRef, useState } from "react";
import { preload } from "react-dom";
import { getMorePairsAction, voteAction } from "~/lib/action";
import {
  createBattleQueue,
  type BattleQueueSnapshot,
  type StatsMap,
} from "~/lib/battle-queue";
import { cn } from "~/lib/utils";
import type { Pokemon, PokemonPair } from "~/sdk/pokemon";
import type { ContenderStats, RecentBattle } from "~/sdk/vote";
import RecentVotes from "./recent-votes";
import {
  ARENA_RING_CLASS,
  CONTENDER_PANEL_CLASS,
  VS_BADGE_CLASS,
} from "./ui/fallbacks";
import { SpriteTile, spriteUrl } from "./ui/pokemon-sprite";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const ACCIDENTAL_DOUBLE_TAP_MS = 180;
const RECENT_VOTES_LIMIT = 3;

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
  const detailsId = useId();
  const battles = stats ? stats.wins + stats.losses : 0;
  const isHome = side === "home";
  const dexLabel = `#${pokemon.dexNumber.toString().padStart(4, "0")}`;

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        onVote();
      }}
      aria-disabled={disabled ? true : undefined}
      aria-label={`Pick ${pokemon.name}`}
      aria-describedby={detailsId}
      className={cn(
        CONTENDER_PANEL_CLASS,
        "group text-center text-ring-ink focus-visible:-outline-offset-4 aria-disabled:cursor-not-allowed aria-disabled:opacity-65 motion-safe:transition-colors motion-safe:duration-150",
        disabled ? "" : "cursor-pointer",
        isHome
          ? cn(
              "row-start-1 rounded-t-[19.5px] pt-2.5 pb-4 sm:col-start-1 sm:row-span-5 sm:row-start-1 sm:rounded-t-none sm:rounded-l-[19.5px] sm:py-6",
              disabled
                ? "bg-ring-peach"
                : "bg-ring-peach hover:bg-ring-peach-hover",
            )
          : cn(
              "row-start-2 rounded-b-[19.5px] pt-4 pb-3 sm:col-start-2 sm:row-span-5 sm:row-start-1 sm:rounded-r-[19.5px] sm:rounded-b-none sm:py-6",
              disabled ? "bg-ring-sky" : "bg-ring-sky hover:bg-ring-sky-hover",
            ),
      )}
    >
      <span className="flex w-full items-center justify-between gap-2 sm:contents">
        <span className="rounded-full border-[1.5px] border-ring-ink bg-ring-paper px-2.5 py-0.5 text-[11px] leading-4 font-bold text-ring-ink tabular-nums sm:row-start-1 sm:justify-self-center">
          {dexLabel}
        </span>

        <span
          id={detailsId}
          className="text-right text-[11px] font-semibold text-ring-muted tabular-nums sm:row-start-4 sm:text-center sm:text-xs"
        >
          <span className="sr-only">Pokédex {dexLabel}, </span>
          {battles > 0 && stats ? (
            <>
              <span>
                {Math.round(stats.winRate * 100)}% win
                <span className="hidden sm:inline"> rate</span>
              </span>
              <span aria-hidden="true" className="hidden min-[340px]:inline">
                {" "}
                ({stats.wins.toLocaleString("en-US")}W{" "}
                {stats.losses.toLocaleString("en-US")}L)
              </span>
              <span className="sr-only">
                , {stats.wins.toLocaleString("en-US")}{" "}
                {stats.wins === 1 ? "win" : "wins"},{" "}
                {stats.losses.toLocaleString("en-US")}{" "}
                {stats.losses === 1 ? "loss" : "losses"}
              </span>
            </>
          ) : stats ? (
            "No votes yet"
          ) : (
            "Record unavailable"
          )}
        </span>
      </span>

      <SpriteTile
        pokemon={pokemon}
        size="arena"
        priority="high"
        className={cn(
          "motion-safe:transition-transform motion-safe:duration-150 sm:row-start-2 sm:justify-self-center",
          disabled ? "" : "motion-safe:group-hover:-translate-y-0.5",
        )}
      />

      <span className="flex w-full items-center justify-between gap-3 sm:contents">
        <span className="block min-w-0 text-left font-display text-[clamp(1.25rem,3.4cqi,1.875rem)] leading-tight font-bold tracking-tight break-words hyphens-auto text-ring-ink capitalize sm:row-start-3 sm:text-center">
          {pokemon.name}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border-2 border-ring-ink px-4 py-1.5 font-display text-xs leading-tight font-bold text-white shadow-[0_3px_0_var(--color-ring-ink)] motion-safe:transition-transform motion-safe:duration-100 sm:row-start-5 sm:mt-1 sm:min-h-11 sm:w-full sm:max-w-[220px] sm:self-stretch sm:justify-self-center sm:px-5 sm:py-2 sm:text-sm",
            disabled
              ? ""
              : "motion-safe:group-active:translate-y-0.5 motion-safe:group-active:shadow-[0_1px_0_var(--color-ring-ink)]",
            isHome ? "bg-ring-coral" : "bg-ring-cobalt",
          )}
        >
          <span className="min-w-0 break-words">
            Pick
            <span className="hidden capitalize sm:inline"> {pokemon.name}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

export default function BattleArena({
  initialPairs,
  initialStats,
  initialRecentBattles,
}: {
  initialPairs: PokemonPair[];
  initialStats: StatsMap;
  initialRecentBattles: RecentBattle[];
}) {
  const lastVoteAtRef = useRef(-Infinity);
  const [announcement, setAnnouncement] = useState("");
  const [recentBattles, setRecentBattles] =
    useState<RecentBattle[]>(initialRecentBattles);
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
      onNextPair: (nextPair) => {
        persistPairCookie(nextPair);
        setAnnouncement(
          `Next matchup: ${nextPair[0].name} versus ${nextPair[1].name}.`,
        );
      },
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
  const votingDisabled = !next;

  function handleVote(pick: 0 | 1) {
    if (!next) return;
    const now = performance.now();
    if (now - lastVoteAtRef.current < ACCIDENTAL_DOUBLE_TAP_MS) return;
    lastVoteAtRef.current = now;
    const winner = pick === 0 ? home : away;
    const loser = pick === 0 ? away : home;
    setRecentBattles((previous) => {
      const first = previous[0];
      if (
        first?.winner.dexNumber === winner.dexNumber &&
        first.loser.dexNumber === loser.dexNumber
      ) {
        return previous;
      }
      return [{ winner, loser }, ...previous].slice(0, RECENT_VOTES_LIMIT);
    });
    queue.vote(pick);
  }

  return (
    <div className="flex flex-col gap-3">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <section
        aria-label="Choose the cutest Pokémon"
        className={ARENA_RING_CLASS}
      >
        <ContenderCorner
          side="home"
          pokemon={home}
          stats={snapshot.stats[home.dexNumber]}
          disabled={votingDisabled}
          onVote={() => handleVote(0)}
        />
        <ContenderCorner
          side="away"
          pokemon={away}
          stats={snapshot.stats[away.dexNumber]}
          disabled={votingDisabled}
          onVote={() => handleVote(1)}
        />
        <span aria-hidden="true" className={VS_BADGE_CLASS}>
          VS
        </span>
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
            className="min-h-9 cursor-pointer rounded-full border-2 border-ring-ink bg-ring-coral px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_2px_0_var(--color-ring-ink)] hover:brightness-95"
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
              className="min-h-9 cursor-pointer rounded-full border-2 border-ring-ink bg-ring-coral px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_2px_0_var(--color-ring-ink)] hover:brightness-95"
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
      <RecentVotes battles={recentBattles} />
    </div>
  );
}
