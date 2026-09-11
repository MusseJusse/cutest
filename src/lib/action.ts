"use server";

import { getContenderStats, recordBattle } from "~/sdk/vote";
import { cookies } from "next/headers";
import { selectPokemonPairs } from "~/sdk/pokemon";
import type { PokemonPair } from "~/sdk/pokemon";

export async function voteAction(
  currentPair: PokemonPair,
  nextPair: PokemonPair,
  index: number,
) {
  // 60-70ms
  // const { success } = await ratelimit.limit("battle");
  // if (!success) {
  //   throw new Error("Rate limit exceeded");
  // }

  const loser = currentPair[index === 0 ? 1 : 0];

  // 2-3ms
  void recordBattle(currentPair[index]!.dexNumber, loser.dexNumber);

  const jar = await cookies();
  jar.set("currentPair", JSON.stringify(nextPair));
}

export async function getMorePairsAction(count: number) {
  const size = Math.min(Math.max(Math.trunc(count) || 1, 1), 10);
  const pairs = await selectPokemonPairs(size);
  const stats = await getContenderStats(pairs.flat());
  return { pairs, stats };
}
