"use server";

import { cookies } from "next/headers";
import { PokemonPair } from "~/sdk/pokemon";
import { recordBattle } from "~/sdk/vote";
import { ratelimit } from "~/utils/ratelimit";

export async function voteAction(
  currentPair: PokemonPair,
  index: number,
  nextPair: PokemonPair,
) {
  const { success } = await ratelimit.limit("recordBattle");
  if (!success) {
    throw new Error("Rate limit exceeded");
  }

  const loser = currentPair[index === 0 ? 1 : 0];
  await recordBattle(currentPair[index]!.dexNumber, loser.dexNumber);

  const jar = await cookies();
  jar.set("currentPair", JSON.stringify(nextPair));
}
