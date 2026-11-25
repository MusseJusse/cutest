import "server-only";

import catalogue from "~/data/pokemon.json";
import { z } from "zod";
import { selectTwoPokemon } from "./pokemon-pair";

export type Pokemon = {
  name: string;
  dexNumber: number;
};

export type PokemonPair = [Pokemon, Pokemon];

export const POKEMON_CATALOGUE: readonly Pokemon[] = catalogue;

const catalogueByDex = new Map<number, Pokemon>(
  catalogue.map((pokemon) => [pokemon.dexNumber, pokemon]),
);

export function getPokemonByDexNumber(dexNumber: number): Pokemon | undefined {
  return catalogueByDex.get(dexNumber);
}

export function selectPokemonPairs(count: number): PokemonPair[] {
  return Array.from({ length: count }, () =>
    selectTwoPokemon(POKEMON_CATALOGUE),
  );
}

const pokemonSchema = z.object({
  name: z.string().min(1).max(100),
  dexNumber: z.number().int().min(1),
});

const pokemonPairSchema = z.tuple([pokemonSchema, pokemonSchema]);
const voteIdSchema = z.uuid();

export function parseVoteId(value: unknown): string | undefined {
  const parsed = voteIdSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

/**
 * Validate untrusted input against the bundled catalogue. Server action
 * arguments arrive from the network, so a forged payload could otherwise
 * record battles for entries the leaderboard has never heard of.
 */
export function parsePokemonPair(value: unknown): PokemonPair | undefined {
  const parsed = pokemonPairSchema.safeParse(value);
  if (!parsed.success) return undefined;

  const [first, second] = parsed.data;
  if (first.dexNumber === second.dexNumber) return undefined;
  if (catalogueByDex.get(first.dexNumber)?.name !== first.name) {
    return undefined;
  }
  if (catalogueByDex.get(second.dexNumber)?.name !== second.name) {
    return undefined;
  }

  return [first, second];
}
