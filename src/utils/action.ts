"use server";

import { cookies, headers } from "next/headers";
import { PokemonPair } from "~/sdk/pokemon";
import { recordBattle } from "~/sdk/vote";
import { ratelimit } from "~/utils/ratelimit";

export async function voteAction(
  currentPair: PokemonPair,
  index: number,
  nextPair: PokemonPair,
) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    throw new Error("Rate limit exceeded");
  }

  const loser = currentPair[index === 0 ? 1 : 0];
  await recordBattle(currentPair[index]!.dexNumber, loser.dexNumber);

  const jar = await cookies();
  jar.set("currentPair", JSON.stringify(nextPair));
}
