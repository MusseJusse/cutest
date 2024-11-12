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

  recordBattle(currentPair[index]!.dexNumber, loser.dexNumber);

  const jar = await cookies();
  jar.set("currentPair", JSON.stringify(nextPair));
}
