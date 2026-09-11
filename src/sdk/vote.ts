import { kv } from "@vercel/kv";
import { getAllPokemon } from "./pokemon";
import { after } from "next/server";
import { cacheLife } from "next/cache";

export function recordBattle(winner: number, loser: number) {
  const battle = {
    winner,
    loser,
    timestamp: Date.now(),
  };

  after(async () => {
    await kv
      .pipeline()
      .lpush("cute-battles:all", JSON.stringify(battle))
      .incr(`cute-pokemon:${winner}:wins`)
      .incr(`cite-pokemon:${loser}:losses`)
      .exec();
  });
}

async function getBattleCounts(dexNumbers: number[]) {
  "use cache";
  // Cache compact counter arrays. Caching the full ranking objects adds serialization work.
  // stale: 0 leaves a dynamic hole in prefetches, so navigation checks the server snapshot.
  cacheLife({ stale: 0, revalidate: 15, expire: 16 });
  const winKeys = dexNumbers.map((id) => `cute-pokemon:${id}:wins`);
  const lossKeys = dexNumbers.map((id) => `cite-pokemon:${id}:losses`);

  return Promise.all([
    kv.mget<number[]>(...winKeys),
    kv.mget<number[]>(...lossKeys),
  ]);
}

export async function getRankings() {
  const pokemonList = await getAllPokemon();
  const [wins, losses] = await getBattleCounts(
    pokemonList.map((p) => p.dexNumber),
  );

  const stats = pokemonList.map((pokemon, index) => {
    const totalWins = wins[index] ?? 0;
    const totalLosses = losses[index] ?? 0;
    const totalBattles = totalWins + totalLosses;
    const winRate = totalBattles > 0 ? totalWins / totalBattles : 0;

    return {
      ...pokemon,
      stats: {
        wins: totalWins,
        losses: totalLosses,
        winRate: winRate,
        elo: totalWins * 0.3 + winRate * 0.7 - totalLosses * 0.3,
      },
    };
  });
  return stats;
}
