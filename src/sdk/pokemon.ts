import { connection } from "next/server";
import catalogue from "~/data/pokemon.json";

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
  const shuffled = allPokemon.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2) as PokemonPair;
}
