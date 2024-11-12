import { unstable_cacheLife } from "next/cache";
import { connection } from "next/server";
import "server-only";

export type Pokemon = {
  name: string;
  dexNumber: number;
};

export type PokemonPair = [Pokemon, Pokemon];

/**
 * Fetches all Pokemon from Gen 1-9 (up to #1025) from the PokeAPI GraphQL endpoint.
 * Each Pokemon includes their name, Pokedex number, and sprite URL.
 */

export async function getAllPokemon() {
  "use cache";
  unstable_cacheLife("forever");

  const query = `
      query GetAllPokemon {
        pokemon_v2_pokemon(where: {id: {_lte: 1025}}) {
          id
          pokemon_v2_pokemonspecy {
            name
          }
        }
      }
    `;

  const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = (await response.json()).data as {
    pokemon_v2_pokemon: {
      id: number;
      pokemon_v2_pokemonspecy: {
        name: string;
      };
    }[];
  };

  return data.pokemon_v2_pokemon.map((pokemon) => ({
    name: pokemon.pokemon_v2_pokemonspecy.name,
    dexNumber: pokemon.id,
  }));
}

/**
 * Randomly reorder all objects in the Pokemon array
 * Returns the first two Pokemon in the shuffled array.
 */
export async function getTwoPokemon() {
  await connection();
  const allPokemon = await getAllPokemon();
  const shuffled = allPokemon.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}
