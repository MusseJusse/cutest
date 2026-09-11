import { connection } from "next/server";
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

export async function getTwoPokemon() {
  await connection();
  const allPokemon = await getAllPokemon();
  return selectTwoPokemon(allPokemon);
}
