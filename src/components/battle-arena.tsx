"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
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
  const isHome = side === "home";
  const tone = isHome
    ? { team: "#ff4b3e", soft: "rgba(255,75,62,0.2)" }
    : { team: "#3b82f6", soft: "rgba(59,130,246,0.22)" };
  const battles = stats ? stats.wins + stats.losses : 0;
  const label = stats
    ? `${Math.round(stats.winRate * 100)}% · ${stats.wins}-${stats.losses}`
    : "no record";

  return (
    <article
      className="relative flex flex-col gap-3 overflow-hidden rounded-[10px] border border-broadcast-dim/25 bg-white/[0.04] p-4 pt-5"
      style={{ "--team": tone.team, "--team-soft": tone.soft } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--team)]" />
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--team)]">
        {isHome ? "Home" : "Away"} · #{pokemon.dexNumber}
      </p>
      <h2 className="m-0 font-display text-4xl uppercase leading-none text-broadcast-ink sm:text-5xl">
        {pokemon.name}
      </h2>
      <div className="relative grid place-items-center py-3">
        <span
          aria-hidden="true"
          className="absolute h-44 w-44 rounded-full bg-[radial-gradient(circle,var(--team-soft),transparent_65%)] sm:h-56 sm:w-56"
        />
        <PokemonSprite
          pokemon={pokemon}
          className="relative h-36 w-36 sm:h-40 sm:w-40"
          priority="high"
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-broadcast-dim">
          <span>win rate</span>
          <span>{label}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full origin-left rounded-full bg-[var(--team)] transition-transform duration-200 ease-out-strong"
            style={{ transform: `scaleX(${battles > 0 ? (stats?.winRate ?? 0) : 0})` }}
          />
        </div>
      </div>
      <VoteButton
        onVote={onVote}
        tone={side}
        label={isHome ? "Vote home" : "Vote away"}
      />
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
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const refillPending = useRef(false);

  const current = pairs[index];
  const next = pairs[index + 1];
  const queued = Math.max(pairs.length - index - 1, 0);

  function submit(currentPair: PokemonPair, nextPair: PokemonPair, pick: Pick) {
    void voteAction(currentPair, nextPair, pick).catch(() =>
      surfaceVoteError(() => submit(currentPair, nextPair, pick)),
    );
  }

  function vote(pick: Pick) {
    // A ref keeps rapid clicks safe even when React batches the state updates.
    const value = indexRef.current;
    const currentPair = pairs[value];
    const nextPair = pairs[value + 1];
    if (!currentPair || !nextPair) {
      void refill();
      return;
    }
    indexRef.current = value + 1;
    setIndex(value + 1);
    submit(currentPair, nextPair, pick);
    if (value + REFILL_THRESHOLD >= pairs.length) void refill();
  }

  async function refill() {
    if (refillPending.current) return;
    refillPending.current = true;
    try {
      const more = await getMorePairsAction(REFILL_SIZE);
      setPairs((previous) => [...previous, ...more.pairs]);
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
        aria-label="Battle"
        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
      >
        <ContenderPanel
          side="home"
          pokemon={home}
          stats={stats[home.dexNumber]}
          onVote={() => vote(0)}
        />
        <div className="flex flex-row items-center justify-center gap-3 py-1 sm:flex-col sm:px-5 sm:py-0">
          <span className="font-display text-4xl text-broadcast-gold [text-shadow:0_0_26px_rgba(255,210,63,0.45)] sm:text-5xl">
            VS
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-broadcast-dim">
            pick one
          </span>
        </div>
        <ContenderPanel
          side="away"
          pokemon={away}
          stats={stats[away.dexNumber]}
          onVote={() => vote(1)}
        />
      </section>
      <p
        className={cn(
          "m-0 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-broadcast-dim",
          queued === 0 && "opacity-0",
        )}
      >
        {queued} {queued === 1 ? "pair" : "pairs"} queued
      </p>
    </div>
  );
}
