import { Suspense } from "react";
import { ResultsFallback } from "~/components/ui/fallbacks";
import PokemonSprite from "~/components/ui/pokemon-sprite";
import { getRankings } from "~/sdk/vote";

type SortType = "wins" | "winRate" | "battles" | "losses" | "elo";
type PokemonWithStats = Awaited<ReturnType<typeof getRankings>>[0];

async function getFilteredRankings(sortType: SortType) {
  const rankings = await getRankings();

  const sortFunctions: Record<
    SortType,
    (a: PokemonWithStats, b: PokemonWithStats) => number
  > = {
    wins: (a, b) => b.stats.wins - a.stats.wins,
    winRate: (a, b) =>
      b.stats.winRate - a.stats.winRate || b.stats.wins - a.stats.wins,
    battles: (a, b) =>
      b.stats.wins + b.stats.losses - (a.stats.wins + a.stats.losses),
    losses: (a, b) => b.stats.losses - a.stats.losses,
    elo: (a, b) => b.stats.elo - a.stats.elo,
  };

  return rankings.sort(sortFunctions[sortType]);
}

async function Results() {
  const rankings = await getFilteredRankings("elo");

  return (
    <div className="contents">
      {rankings.map((pokemon, index) => (
        <div
          key={pokemon.dexNumber}
          className="relative flex items-center gap-6 rounded-lg bg-gray-100/20 p-6 shadow transition-shadow hover:shadow-md"
        >
          <div className="w-8 text-xl font-bold">#{index + 1}</div>

          <PokemonSprite pokemon={pokemon} className="h-20 w-20" lazy />

          <div className="flex-grow overflow-hidden">
            <div className="text-sm">#{pokemon.dexNumber}</div>
            <h2 className="truncate text-xl font-semibold capitalize">
              {pokemon.name}
            </h2>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-2xl font-bold text-blue-600">
              {(pokemon.stats.winRate * 100).toFixed(0)}%
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {(pokemon.stats.elo * 10).toFixed(0)}
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
