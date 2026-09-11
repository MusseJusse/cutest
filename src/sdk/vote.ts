import { Redis } from "@upstash/redis";
import { getAllPokemon } from "./pokemon";
import type { Pokemon } from "./pokemon";
import { after } from "next/server";
import { cacheLife } from "next/cache";

const kv = Redis.fromEnv();

export type ContenderStats = {
  wins: number;
  losses: number;
  winRate: number;
};

export type RecentBattle = {
  winner: Pokemon;
  loser: Pokemon;
};

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

export async function getContenderStats(
  pokemon: Pokemon[],
): Promise<Record<number, ContenderStats>> {
  "use cache";
  cacheLife({ stale: 0, revalidate: 15, expire: 16 });
  const dexNumbers = [...new Set(pokemon.map((entry) => entry.dexNumber))];
  if (dexNumbers.length === 0) return {};

  try {
    const [wins, losses] = await Promise.all([
      kv.mget<number[]>(...dexNumbers.map((id) => `cute-pokemon:${id}:wins`)),
      kv.mget<number[]>(...dexNumbers.map((id) => `cite-pokemon:${id}:losses`)),
    ]);

    const stats: Record<number, ContenderStats> = {};
    dexNumbers.forEach((dexNumber, index) => {
      const totalWins = wins?.[index] ?? 0;
      const totalLosses = losses?.[index] ?? 0;
      const battles = totalWins + totalLosses;
      stats[dexNumber] = {
        wins: totalWins,
        losses: totalLosses,
        winRate: battles > 0 ? totalWins / battles : 0,
      };
    });
    return stats;
  } catch {
    return {};
  }
}

function parseBattle(
  value: unknown,
): { winner: number; loser: number } | undefined {
  let candidate = value;
  if (typeof value === "string") {
    try {
      candidate = JSON.parse(value) as unknown;
    } catch {
      return undefined;
    }
  }
  if (typeof candidate !== "object" || candidate === null) return undefined;
  const record = candidate as Record<string, unknown>;
  if (typeof record.winner !== "number" || typeof record.loser !== "number") {
    return undefined;
  }
  return { winner: record.winner, loser: record.loser };
}

export async function getRecentBattles(limit: number): Promise<RecentBattle[]> {
  "use cache";
  cacheLife({ stale: 0, revalidate: 15, expire: 16 });

  try {
    const entries = await kv.lrange<unknown>(
      "cute-battles:all",
      0,
      Math.max(Math.trunc(limit) - 1, 0),
    );
    const byDexNumber = new Map(
      (await getAllPokemon()).map((pokemon) => [pokemon.dexNumber, pokemon]),
    );

    const battles: RecentBattle[] = [];
    for (const entry of entries) {
      const record = parseBattle(entry);
      if (!record) continue;
      const winner = byDexNumber.get(record.winner);
      const loser = byDexNumber.get(record.loser);
      if (!winner || !loser) continue;
      const previous = battles.at(-1);
      if (
        previous?.winner.dexNumber === winner.dexNumber &&
        previous.loser.dexNumber === loser.dexNumber
      ) {
        continue;
      }
      battles.push({ winner, loser });
    }
    return battles;
  } catch {
    return [];
  }
}
