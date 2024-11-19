"use server";

import { recordBattle } from "~/sdk/vote";
import { ratelimit } from "./ratelimit";
import { cookies } from "next/headers";
import { PokemonPair } from "~/sdk/pokemon";

export async function voteAction(
  currentPair: PokemonPair,
  nextPair: PokemonPair,
  index: number,
) {
  const start2 = performance.now();

  // 60-70ms
  const { success } = await ratelimit.limit("battle");
  if (!success) {
    throw new Error("Rate limit exceeded");
  }

  const loser = currentPair[index === 0 ? 1 : 0];

  // 2-3ms
  recordBattle(currentPair[index]!.dexNumber, loser.dexNumber);

  const jar = await cookies();
  jar.set("currentPair", JSON.stringify(nextPair));

  const end2 = performance.now();
  console.log(`Vote Request: ${(end2 - start2).toFixed(2)}ms`);
}
