import catalogue from "~/data/pokemon.json";
import { z } from "zod";
import { selectTwoPokemon } from "./pokemon-pair";

export type Pokemon = {
  name: string;
  dexNumber: number;
};

export type PokemonPair = [Pokemon, Pokemon];

export async function getAllPokemon() {
  // Keep callers free to sort the list without changing the bundled catalogue.
  return [...catalogue];
}

export async function selectPokemonPairs(
  count: number,
): Promise<PokemonPair[]> {
  const allPokemon = await getAllPokemon();
  return Array.from({ length: count }, () => selectTwoPokemon(allPokemon));
}

const catalogueByName = new Map(
  catalogue.map((pokemon) => [pokemon.dexNumber, pokemon.name] as const),
);

const pokemonSchema = z.object({
  name: z.string().min(1).max(100),
  dexNumber: z.number().int().min(1),
});

const pokemonPairSchema = z.tuple([pokemonSchema, pokemonSchema]);

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
  if (catalogueByName.get(first.dexNumber) !== first.name) return undefined;
  if (catalogueByName.get(second.dexNumber) !== second.name) return undefined;

  return [first, second];
}
