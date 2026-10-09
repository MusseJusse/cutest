"use client";

import { useRef, useState } from "react";
import { getMorePairsAction, voteAction } from "~/lib/action";
import { cn } from "~/lib/utils";
import type { Pokemon, PokemonPair } from "~/sdk/pokemon";
import type { ContenderStats } from "~/sdk/vote";
import PokemonSprite from "./ui/pokemon-sprite";
import VoteButton from "./ui/vote-button";

const REFILL_THRESHOLD = 3;
const REFILL_SIZE = 4;

type Pick = 0 | 1;
type StatsMap = Record<number, ContenderStats>;

function surfaceVoteError(retry: () => void) {
  void import("sonner").then(({ toast }) => {
    toast.error("Vote not saved", {
      description: "The vote did not reach the server.",
      action: { label: "Retry", onClick: retry },
    });
  });
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
        "row-span-4 grid min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-3 p-3.5 sm:p-6",
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
        <span className="font-mono text-[11px] text-studio-muted">
          #{pokemon.dexNumber.toString().padStart(4, "0")}
        </span>
      </div>
      <div className="-mx-3.5 grid h-[170px] min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] place-items-center overflow-clip sm:mx-0 sm:h-[220px]">
        <PokemonSprite
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
  const [pairs, setPairs] = useState(initialPairs);
  const [stats, setStats] = useState(initialStats);
  const pairsRef = useRef(initialPairs);
  const refillPending = useRef(false);
  const [current, next] = pairs;

  function submit(currentPair: PokemonPair, nextPair: PokemonPair, pick: Pick) {
    void voteAction(currentPair, nextPair, pick).catch(() =>
      surfaceVoteError(() => submit(currentPair, nextPair, pick)),
    );
  }

  function vote(pick: Pick) {
    // A ref keeps rapid clicks safe even when React batches the state updates.
    const [currentPair, nextPair] = pairsRef.current;
    if (!currentPair || !nextPair) {
      void refill();
      return;
    }
    const remaining = pairsRef.current.slice(1);
    pairsRef.current = remaining;
    setPairs(remaining);
    submit(currentPair, nextPair, pick);
    if (remaining.length < REFILL_THRESHOLD) void refill();
  }

  async function refill() {
    if (refillPending.current) return;
    refillPending.current = true;
    try {
      const more = await getMorePairsAction(REFILL_SIZE);
      const refilled = [...pairsRef.current, ...more.pairs];
      pairsRef.current = refilled;
      setPairs(refilled);
      setStats((previous) => ({ ...previous, ...more.stats }));
    } catch {
      // The next vote tries the refill again.
    } finally {
      refillPending.current = false;
    }
  }

  if (!current) return null;

  const [home, away] = current;

  return (
    <div className="flex flex-col gap-4">
      {next ? (
        <div className="hidden" aria-hidden="true">
          {next.map((pokemon) => (
            <PokemonSprite
              key={pokemon.dexNumber}
              pokemon={pokemon}
              className="h-64 w-64"
              priority="low"
            />
          ))}
        </div>
      ) : null}
      <section
        aria-label="Choose the cutest Pokémon"
        className="grid grid-cols-2 gap-y-3 overflow-clip rounded-2xl"
      >
        <ContenderPanel
          side="home"
          pokemon={home}
          stats={stats[home.dexNumber]}
          onVote={() => vote(0)}
        />
        <ContenderPanel
          side="away"
          pokemon={away}
          stats={stats[away.dexNumber]}
          onVote={() => vote(1)}
        />
      </section>
    </div>
  );
}
