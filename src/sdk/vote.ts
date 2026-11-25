import "server-only";

import { Redis } from "@upstash/redis";
import { cacheLife } from "next/cache";
import { z } from "zod";
import { env } from "~/env";
import {
  POKEMON_CATALOGUE,
  getPokemonByDexNumber,
  type Pokemon,
} from "./pokemon";

const LIVE_SNAPSHOT_CACHE = { stale: 0, revalidate: 15, expire: 16 } as const;
const VOTE_ID_TTL_SECONDS = 60 * 60 * 24;

// Preserve the historical "cite-pokemon" prefix used by production loss counters.
const winKey = (dexNumber: number) => `cute-pokemon:${dexNumber}:wins`;
const lossKey = (dexNumber: number) => `cite-pokemon:${dexNumber}:losses`;
const voteSeenKey = (voteId: string) => `cute-votes:seen:${voteId}`;

// Atomic + idempotent write so Upstash SDK retries and client Retry clicks never double-count.
const RECORD_BATTLE_SCRIPT = `
if redis.call('SET', KEYS[1], '1', 'EX', ARGV[1], 'NX') then
  redis.call('LPUSH', KEYS[2], ARGV[2])
  redis.call('INCR', KEYS[3])
  redis.call('INCR', KEYS[4])
  return 1
end
return 0
`;

const WIN_KEYS = POKEMON_CATALOGUE.map((pokemon) => winKey(pokemon.dexNumber));
const LOSS_KEYS = POKEMON_CATALOGUE.map((pokemon) =>
  lossKey(pokemon.dexNumber),
);
const CATALOGUE_INDEX_BY_DEX = new Map(
  POKEMON_CATALOGUE.map((pokemon, index) => [pokemon.dexNumber, index]),
);

const battleRecordSchema = z.object({
  winner: z.number().int(),
  loser: z.number().int(),
});

let redis: Redis | undefined;

function getRedis(): Redis {
  if (redis) return redis;

  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Redis credentials missing. Set KV_REST_API_URL and KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  redis = new Redis({
    url,
    token,
    retry: { retries: 2, backoff: (retryCount) => Math.exp(retryCount) * 50 },
  });
  return redis;
}

export type ContenderStats = {
  wins: number;
  losses: number;
  winRate: number;
};

export type RankedPokemon = Pokemon & {
  rank: number;
  score: number;
  winRate: number;
  battles: number;
  stats: {
    wins: number;
    losses: number;
    winRate: number;
    elo: number;
  };
};

export type RecentBattle = {
  winner: Pokemon;
  loser: Pokemon;
};

function computeStats(
  wins: number | null | undefined,
  losses: number | null | undefined,
) {
  const totalWins = wins ?? 0;
  const totalLosses = losses ?? 0;
  const battles = totalWins + totalLosses;
  const winRate = battles > 0 ? totalWins / battles : 0;

  return {
    wins: totalWins,
    losses: totalLosses,
    battles,
    winRate,
    elo: totalWins * 0.3 + winRate * 0.7 - totalLosses * 0.3,
  };
}

export async function recordBattle(
  winner: number,
  loser: number,
  voteId: string,
) {
  const battle = {
    winner,
    loser,
    timestamp: Date.now(),
  };

  await getRedis().eval<string[], number>(
    RECORD_BATTLE_SCRIPT,
    [voteSeenKey(voteId), "cute-battles:all", winKey(winner), lossKey(loser)],
    [String(VOTE_ID_TTL_SECONDS), JSON.stringify(battle)],
  );
}

async function getAllBattleCounts() {
  "use cache";
  // Cache compact counter arrays. Caching the full ranking objects adds serialization work.
  // stale: 0 leaves a dynamic hole in prefetches, so navigation checks the server snapshot.
  cacheLife(LIVE_SNAPSHOT_CACHE);

  return Promise.all([
    getRedis().mget<(number | null)[]>(...WIN_KEYS),
    getRedis().mget<(number | null)[]>(...LOSS_KEYS),
  ]);
}

export async function getRankingsPage(
  requestedPage: number,
  pageSize: number,
): Promise<{
  page: number;
  totalPages: number;
  pageStart: number;
  items: RankedPokemon[];
}> {
  const [wins, losses] = await getAllBattleCounts();
  const total = POKEMON_CATALOGUE.length;
  const elos = new Float64Array(total);
  const order = new Array<number>(total);

  for (let index = 0; index < total; index++) {
    elos[index] = computeStats(wins[index], losses[index]).elo;
    order[index] = index;
  }
  order.sort((a, b) => elos[b]! - elos[a]!);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const pageStart = (page - 1) * pageSize;
  const items = order
    .slice(pageStart, pageStart + pageSize)
    .map((catalogueIndex, offset) => {
      const pokemon = POKEMON_CATALOGUE[catalogueIndex]!;
      const stats = computeStats(wins[catalogueIndex], losses[catalogueIndex]);

      return {
        ...pokemon,
        rank: pageStart + offset + 1,
        score: Math.round(stats.elo * 10),
        winRate: Math.round(stats.winRate * 100),
        battles: stats.battles,
        stats: {
          wins: stats.wins,
          losses: stats.losses,
          winRate: stats.winRate,
          elo: stats.elo,
        },
      };
    });

  return { page, totalPages, pageStart, items };
}

export async function getContenderStats(
  pokemon: readonly Pokemon[],
): Promise<Record<number, ContenderStats>> {
  if (pokemon.length === 0) return {};

  try {
    const [wins, losses] = await getAllBattleCounts();
    const stats: Record<number, ContenderStats> = {};

    for (const entry of pokemon) {
      if (entry.dexNumber in stats) continue;
      const index = CATALOGUE_INDEX_BY_DEX.get(entry.dexNumber);
      if (index === undefined) continue;
      const computed = computeStats(wins[index], losses[index]);
      stats[entry.dexNumber] = {
        wins: computed.wins,
        losses: computed.losses,
        winRate: computed.winRate,
      };
    }

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
  const parsed = battleRecordSchema.safeParse(candidate);
  return parsed.success ? parsed.data : undefined;
}

export async function getRecentBattles(limit: number): Promise<RecentBattle[]> {
  "use cache";
  cacheLife(LIVE_SNAPSHOT_CACHE);
  const target = Math.max(Math.trunc(limit), 1);

  try {
    // Over-fetch slightly so consecutive duplicate votes do not shrink the strip.
    const entries = await getRedis().lrange<unknown>(
      "cute-battles:all",
      0,
      target * 2 - 1,
    );

    const battles: RecentBattle[] = [];
    for (const entry of entries) {
      const record = parseBattle(entry);
      if (!record) continue;
      const winner = getPokemonByDexNumber(record.winner);
      const loser = getPokemonByDexNumber(record.loser);
      if (!winner || !loser) continue;
      const previous = battles.at(-1);
      if (
        previous?.winner.dexNumber === winner.dexNumber &&
        previous.loser.dexNumber === loser.dexNumber
      ) {
        continue;
      }
      battles.push({ winner, loser });
      if (battles.length >= target) break;
    }
    return battles;
  } catch {
    return [];
  }
}
