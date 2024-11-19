import { cookies } from "next/headers";
import { Suspense } from "react";
import { VoteFallback } from "~/components/ui/Fallback";
import PokemonSprite from "~/components/ui/pokemon-sprite";
import VoteButton from "~/components/ui/vote-button";
import { getTwoPokemon, PokemonPair } from "~/sdk/pokemon";

export async function VoteContent() {
  const start = performance.now();

  const currentPairCookie = (await cookies()).get("currentPair")?.value;

  const [currentPair, nextPair] = await Promise.all([
    currentPairCookie
      ? Promise.resolve(JSON.parse(currentPairCookie) as PokemonPair)
      : getTwoPokemon(),
    getTwoPokemon(),
  ]);

  console.log(`Pokemon Request: ${(performance.now() - start).toFixed(2)}ms`);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 sm:flex-row sm:gap-12">
      {/* hidden sprites for prefetching */}
      <div className="hidden">
        {nextPair.map((pokemon) => (
          <PokemonSprite
            key={pokemon.dexNumber}
            pokemon={pokemon}
            className="h-64 w-64"
          />
        ))}
      </div>
      {currentPair.map((pokemon, index) => (
        <div key={pokemon.dexNumber} className="flex flex-col items-center">
          <PokemonSprite pokemon={pokemon} className="h-64 w-64" />
          <div className="text-center">
            <span className="text-base text-gray-600 sm:text-lg">
              #{pokemon.dexNumber}
            </span>
            <h2 className="text-xl font-bold capitalize sm:text-2xl">
              {pokemon.name}
            </h2>
            <form className="mt-2">
              <VoteButton
                currentPair={currentPair}
                nextPair={nextPair}
                index={index}
              />
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<VoteFallback />}>
        <VoteContent />
      </Suspense>
    </div>
  );
}
