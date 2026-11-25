"use server";

import {
  parsePokemonPair,
  parseVoteId,
  selectPokemonPairs,
} from "~/sdk/pokemon";
import { getContenderStats, recordBattle } from "~/sdk/vote";

const REFILL_SIZE = 4;

export async function voteAction(
  currentPair: unknown,
  index: unknown,
  voteId: unknown,
) {
  const current = parsePokemonPair(currentPair);
  const pick = index === 0 || index === 1 ? index : undefined;
  const id = parseVoteId(voteId);

  if (!current || pick === undefined || !id) {
    throw new Error("Invalid vote payload");
  }

  const loser = current[pick === 0 ? 1 : 0];
  await recordBattle(current[pick].dexNumber, loser.dexNumber, id);
}

export async function getMorePairsAction() {
  const pairs = selectPokemonPairs(REFILL_SIZE);
  const stats = await getContenderStats(pairs.flat());
  return { pairs, stats };
}
