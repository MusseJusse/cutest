import catalogue from "~/data/pokemon.json";
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

export async function selectPokemonPairs(count: number): Promise<PokemonPair[]> {
  const allPokemon = await getAllPokemon();
  return Array.from({ length: count }, () => selectTwoPokemon(allPokemon));
}
