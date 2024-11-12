import { cookies } from "next/headers";
import { Suspense } from "react";
import { getTwoPokemon, PokemonPair } from "~/sdk/pokemon";
import { recordBattle } from "~/sdk/vote";
import PokemonSprite from "~/utils/PokemonSprite";

async function VoteContent() {
  const currentPairJSON = (await cookies()).get("currentPair")?.value;
  const currentPair = currentPairJSON
    ? (JSON.parse(currentPairJSON) as PokemonPair)
    : await getTwoPokemon();

  const nextPair = await getTwoPokemon();

  return (
    <div className="flex min-h-[80vh] items-center justify-center gap-16">
      {/* Render next two images in hidden divs so they load faster */}
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
        <div
          key={pokemon.dexNumber}
          className="flex flex-col items-center gap-4"
        >
          <PokemonSprite
            pokemon={pokemon}
            className="h-32 w-32 sm:h-64 sm:w-64"
          />
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

                  recordBattle(pokemon.dexNumber, loser.dexNumber);

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
    <div className="container mx-auto px-4">
      <Suspense
        fallback={
          <div className="flex min-h-[80vh] items-center justify-center gap-16">
            {[1, 2].map((index) => (
              <div className="flex flex-col items-center gap-4" key={index}>
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/52427d467f3e3b22af3c9cefc807a7452196ccd7/sprites/pokemon/0.png"
                  className="h-64 w-64"
                />
                <div className="text-center">
                  <span className="text-lg text-gray-500">#0</span>
                  <h2 className="text-2xl font-bold capitalize">Loading</h2>
                  <form className="mt-4">
                    <button className="rounded-lg bg-gray-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-600">
                      Vote
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <VoteContent />
      </Suspense>
    </div>
  );
}
