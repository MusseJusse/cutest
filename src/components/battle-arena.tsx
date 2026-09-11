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
  const isLongName = pokemon.name.length >= 11;

  return (
    <article
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden border-0 border-broadcast-dim/25 px-2.5 pt-4 pb-3 text-center",
        "sm:items-stretch sm:justify-start sm:gap-3 sm:rounded-[10px] sm:border sm:bg-white/[0.04] sm:p-4 sm:pt-5 sm:text-left",
      )}
      style={{ "--team": tone.team, "--team-soft": tone.soft } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-[var(--team)]"
      />
      <p className="m-0 text-[10px] font-bold tracking-[0.16em] text-[var(--team)] uppercase sm:text-[11px] sm:tracking-[0.2em]">
        {isHome ? "Home" : "Away"} · #{pokemon.dexNumber}
      </p>
      <h2
        className={cn(
          "m-0 font-display text-xl leading-none break-words text-broadcast-ink uppercase min-[380px]:text-2xl",
          isLongName
            ? "sm:text-3xl lg:text-4xl xl:text-5xl"
            : "sm:text-4xl lg:text-5xl",
        )}
      >
        {pokemon.name}
      </h2>
      <div className="relative grid place-items-center py-2 sm:py-3">
        <span
          aria-hidden="true"
          className="absolute h-32 w-32 rounded-full bg-[radial-gradient(circle,var(--team-soft),transparent_65%)] min-[360px]:h-36 min-[360px]:w-36 min-[400px]:h-44 min-[400px]:w-44 sm:h-56 sm:w-56"
        />
        <PokemonSprite
          pokemon={pokemon}
          className="relative h-28 w-28 min-[360px]:h-32 min-[360px]:w-32 min-[400px]:h-36 min-[400px]:w-36 sm:h-40 sm:w-40"
          priority="high"
        />
      </div>
      <p className="m-0 font-mono text-[10px] text-broadcast-dim sm:hidden">
        {label}
      </p>
      <div className="hidden sm:block">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[11px] tracking-[0.12em] text-broadcast-dim uppercase">
          <span>win rate</span>
          <span>{label}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full origin-left rounded-full bg-[var(--team)] transition-transform duration-200 ease-out-strong"
            style={{
              transform: `scaleX(${battles > 0 ? (stats?.winRate ?? 0) : 0})`,
            }}
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
        className="relative grid min-h-[440px] grid-cols-2 sm:min-h-0 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3"
      >
        <ContenderPanel
          side="home"
          pokemon={home}
          stats={stats[home.dexNumber]}
          onVote={() => vote(0)}
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-broadcast-dim/20 sm:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute top-[44%] left-1/2 z-10 grid h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-broadcast-gold/60 bg-broadcast-night font-display text-sm text-broadcast-gold shadow-[0_0_24px_rgba(255,210,63,0.25)] sm:hidden"
        >
          VS
        </div>
        <div className="hidden sm:flex sm:flex-col sm:items-center sm:justify-center sm:gap-3 sm:px-5">
          <span className="font-display text-5xl text-broadcast-gold [text-shadow:0_0_26px_rgba(255,210,63,0.45)]">
            VS
          </span>
          <span className="font-mono text-[10px] tracking-[0.16em] text-broadcast-dim uppercase">
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
          "m-0 text-center font-mono text-[11px] tracking-[0.14em] text-broadcast-dim uppercase",
          queued === 0 && "opacity-0",
        )}
      >
        {queued} {queued === 1 ? "pair" : "pairs"} queued
      </p>
    </div>
  );
}
