import { Suspense } from "react";
import { getRankings } from "~/sdk/vote";
import PokemonSprite from "~/components/ui/PokemonSprite";
import { ResultsFallback } from "~/components/ui/Fallback";

async function Results() {
  "use cache";
  const rankings = await getRankings();
  return (
    <div className="contents">
      {rankings.map((pokemon, index) => (
        <div
          key={pokemon.dexNumber}
          className="flex items-center gap-6 rounded-lg bg-gray-100/40 p-6 shadow transition-shadow hover:shadow-md"
        >
          <div className="w-8 text-2xl font-bold">#{index + 1}</div>

          <PokemonSprite pokemon={pokemon} className="h-20 w-20" lazy />

          <div className="flex-grow">
            <div className="text-sm">#{pokemon.dexNumber}</div>
            <h2 className="text-xl font-semibold capitalize">{pokemon.name}</h2>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {(pokemon.stats.winRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm">
              {pokemon.stats.wins}W - {pokemon.stats.losses}L
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-4">
        <Suspense fallback={<ResultsFallback />}>
          <Results />
        </Suspense>
      </div>
    </div>
  );
}
