import { cookies } from "next/headers";
import { Suspense } from "react";
import { getTwoPokemon, PokemonPair } from "~/sdk/pokemon";
import FormButton from "~/utils/FormButton";
import PokemonSprite from "~/utils/PokemonSprite";

async function VoteContent() {
  const currentPairJSON = (await cookies()).get("currentPair")?.value;
  const currentPair = currentPairJSON
    ? (JSON.parse(currentPairJSON) as PokemonPair)
    : await getTwoPokemon();

  const nextPair = await getTwoPokemon();

  return (
    <div className="flex min-h-[80vh] items-center justify-center gap-8 sm:gap-12">
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
          className="flex flex-col items-center gap-2 sm:gap-4"
        >
          <PokemonSprite
            pokemon={pokemon}
            className="h-32 w-32 sm:h-64 sm:w-64"
          />
          <div className="text-center">
            <span className="text-base text-gray-600 sm:text-lg">
              #{pokemon.dexNumber}
            </span>
            <h2 className="text-xl font-bold capitalize sm:text-2xl">
              {pokemon.name}
            </h2>
            <form className="mt-2 sm:mt-4">
              <FormButton
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
                  className="h-32 w-32 sm:h-64 sm:w-64"
                />
                <div className="text-center">
                  <span className="text-lg text-gray-600">#0</span>
                  <h2 className="text-2xl font-bold capitalize">Loading</h2>
                  <form className="mt-4">
                    <button className="animate-pulse rounded-lg bg-gray-600 px-8 py-3 text-lg font-semibold text-white">
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
