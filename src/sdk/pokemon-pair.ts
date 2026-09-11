import type { Pokemon, PokemonPair } from "./pokemon";

/** Select an ordered pair uniformly without reordering the cached catalogue. */
export function selectTwoPokemon(
  pokemon: readonly Pokemon[],
  random = Math.random,
): PokemonPair {
  if (pokemon.length < 2) {
    throw new RangeError("At least two Pokémon are required to select a pair");
  }

  const firstIndex = Math.floor(random() * pokemon.length);
  const remainingIndex = Math.floor(random() * (pokemon.length - 1));
  const secondIndex =
    remainingIndex >= firstIndex ? remainingIndex + 1 : remainingIndex;
  const first = pokemon[firstIndex];
  const second = pokemon[secondIndex];

  if (!first || !second) {
    throw new RangeError(
      "Random values must be between zero and one, exclusive of one",
    );
  }

  return [first, second];
}
