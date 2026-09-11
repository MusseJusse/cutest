"use client";

import { useRef, useState } from "react";
import { getMorePairsAction, voteAction } from "~/lib/action";
import { cn } from "~/lib/utils";
import type { PokemonPair } from "~/sdk/pokemon";
import PokemonSprite from "./ui/pokemon-sprite";
import VoteButton from "./ui/vote-button";

const REFILL_THRESHOLD = 3;
const REFILL_SIZE = 4;

type Pick = 0 | 1;

function surfaceVoteError(retry: () => void) {
  void import("sonner").then(({ toast }) => {
    toast.error("Vote not saved", {
      description: "The server rejected the vote.",
      action: { label: "Retry", onClick: retry },
    });
  });
}

export default function BattleArena({
  initialPairs,
}: {
  initialPairs: PokemonPair[];
}) {
  const [pairs, setPairs] = useState(initialPairs);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const refillPending = useRef(false);

  const current = pairs[index];
  const next = pairs[index + 1];

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
      setPairs((previous) => [...previous, ...more]);
    } catch {
      // The next vote tries the refill again.
    } finally {
      refillPending.current = false;
    }
  }

  if (!current) return null;

  return (
    <>
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
      <div className="relative grid gap-6 lg:grid-cols-2">
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 border border-white/20 bg-[#ffdc48] px-5 py-3 text-3xl font-black text-[#101014] lg:block">
          VS
        </div>
        {current.map((pokemon, pick) => (
          <article
            key={pokemon.dexNumber}
            className={cn(
              "relative min-h-[520px] overflow-hidden border border-white/20 bg-white/[0.05] p-6",
              pick === 0 ? "lg:text-left" : "lg:text-right",
            )}
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-[#ff5d8f]">
                  #{pokemon.dexNumber}
                </p>
                <h2 className="mt-2 text-6xl font-black uppercase leading-none">
                  {pokemon.name}
                </h2>
              </div>
              <div className="my-6 grid place-items-center bg-[radial-gradient(circle,#31313b_0_2px,transparent_2px)] [background-size:18px_18px]">
                <PokemonSprite
                  pokemon={pokemon}
                  className={cn("h-80 w-80", pick === 1 && "lg:scale-x-[-1]")}
                  priority="high"
                />
              </div>
              <VoteButton
                onVote={() => vote(pick as Pick)}
                label="Choose"
                className="w-full rounded-none bg-[#3ef3c6] font-black uppercase text-[#101014] hover:bg-[#ffdc48]"
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
