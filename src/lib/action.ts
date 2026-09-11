"use server";

import { getContenderStats, recordBattle } from "~/sdk/vote";
import { cookies } from "next/headers";
import { parsePokemonPair, selectPokemonPairs } from "~/sdk/pokemon";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function voteAction(
  currentPair: unknown,
  nextPair: unknown,
  index: unknown,
) {
  const current = parsePokemonPair(currentPair);
  const next = parsePokemonPair(nextPair);
  const pick = index === 0 || index === 1 ? index : undefined;

  if (!current || !next || pick === undefined) {
    throw new Error("Invalid vote payload");
  }

  const loser = current[pick === 0 ? 1 : 0];

  void recordBattle(current[pick].dexNumber, loser.dexNumber);

  const jar = await cookies();
  jar.set("currentPair", JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function getMorePairsAction(count: number) {
  const size = Math.min(Math.max(Math.trunc(count) || 1, 1), 10);
  const pairs = await selectPokemonPairs(size);
  const stats = await getContenderStats(pairs.flat());
  return { pairs, stats };
}
