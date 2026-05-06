import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { VoteFallback } from "~/components/ui/fallbacks";
import PokemonSprite from "~/components/ui/pokemon-sprite";
import VoteButton from "~/components/ui/vote-button";
import { cn } from "~/lib/utils";
import { getTwoPokemon } from "~/sdk/pokemon";
import type { PokemonPair } from "~/sdk/pokemon";

function HiddenPrefetch({ nextPair }: { nextPair: PokemonPair }) {
  return (
    <div className="hidden">
      {nextPair.map((pokemon) => (
        <PokemonSprite
          key={pokemon.dexNumber}
          pokemon={pokemon}
          className="h-64 w-64"
        />
      ))}
    </div>
  );
}

function PokemonVoteForm({
  currentPair,
  nextPair,
  index,
}: {
  currentPair: PokemonPair;
  nextPair: PokemonPair;
  index: number;
}) {
  return (
    <form>
      <VoteButton
        currentPair={currentPair}
        nextPair={nextPair}
        index={index}
        label="Choose"
        pendingLabel="Casting..."
        className="w-full rounded-none bg-[#3ef3c6] font-black uppercase text-[#101014] hover:bg-[#ffdc48]"
      />
    </form>
  );
}

async function FinalHomepageContent() {
  const currentPairCookie = (await cookies()).get("currentPair")?.value;

  const [currentPair, nextPair] = await Promise.all([
    currentPairCookie
      ? Promise.resolve(JSON.parse(currentPairCookie) as PokemonPair)
      : getTwoPokemon(),
    getTwoPokemon(),
  ]);

  return (
    <>
      <HiddenPrefetch nextPair={nextPair} />
      <div className="relative grid gap-6 lg:grid-cols-2">
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 border border-white/20 bg-[#ffdc48] px-5 py-3 text-3xl font-black text-[#101014] lg:block">
          VS
        </div>
        {currentPair.map((pokemon, index) => (
          <article
            key={pokemon.dexNumber}
            className={cn(
              "relative min-h-[520px] overflow-hidden border border-white/20 bg-white/[0.05] p-6",
              index === 0 ? "lg:text-left" : "lg:text-right",
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
                  className={cn("h-80 w-80", index === 1 && "lg:scale-x-[-1]")}
                />
              </div>
              <PokemonVoteForm
                currentPair={currentPair}
                nextPair={nextPair}
                index={index}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default function FinalHomepage() {
  return (
    <section className="min-h-screen overflow-x-hidden bg-[#111018] px-5 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#3ef3c6]">
              Roundest Cache
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-none text-white sm:text-7xl">
              BATTLE
            </h1>
          </div>
          <Link
            href="/results"
            className="border border-white/20 px-4 py-3 text-right text-sm font-bold uppercase tracking-[0.18em] text-white/70 transition hover:border-[#3ef3c6] hover:text-[#3ef3c6]"
          >
            results
          </Link>
        </div>

        <Suspense fallback={<VoteFallback />}>
          <FinalHomepageContent />
        </Suspense>
      </div>
    </section>
  );
}
