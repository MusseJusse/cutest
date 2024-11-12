import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { getTwoPokemon, PokemonPair } from "~/sdk/pokemon";

async function VoteContent() {
  const currentPairJSON = (await cookies()).get("currentPair")?.value;
  const currentPair = currentPairJSON
    ? (JSON.parse(currentPairJSON) as PokemonPair)
    : await getTwoPokemon();

  const nextPair = await getTwoPokemon();

  return (
    <div className="flex min-h-[80vh] items-center justify-center gap-16">
      {currentPair.map((pokemon, index) => (
        <div
          key={pokemon.dexNumber}
          className="flex flex-col items-center gap-4"
        >
          <div className="text-center">
            <span className="text-lg text-gray-500">#{pokemon.dexNumber}</span>
            <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
            <form className="mt-4">
              <button
                formAction={async () => {
                  "use server";

                  const loser = currentPair[index === 0 ? 1 : 0];
                  if (!loser) {
                    throw new Error("Loser pokemon not found in current pair");
                  }

                  const jar = await cookies();
                  jar.set("currentPair", JSON.stringify(nextPair));
                }}
                className="rounded-lg bg-blue-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-600"
              >
                Vote
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoteContent />
    </Suspense>
  );
}
