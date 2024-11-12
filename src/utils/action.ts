"use server";

import { cookies } from "next/headers";
import { PokemonPair } from "~/sdk/pokemon";
import { recordBattle } from "~/sdk/vote";

export async function voteAction(
  currentPair: PokemonPair,
  index: number,
  nextPair: PokemonPair,
) {
  const loser = currentPair[index === 0 ? 1 : 0];
  if (!loser) {
    throw new Error("Loser pokemon not found in current pair");
  }

  if (!currentPair[index]) {
    throw new Error("Loser pokemon not found in current pair");
  }

  if (!currentPair[index]?.dexNumber) {
    throw new Error("Winner pokemon not found in current pair");
  }

  recordBattle(currentPair[index]!.dexNumber, loser.dexNumber);

  const jar = await cookies();
  jar.set("currentPair", JSON.stringify(nextPair));
}
