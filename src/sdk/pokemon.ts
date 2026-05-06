import { cacheLife } from "next/cache";
import { connection } from "next/server";

export type Pokemon = {
  name: string;
  dexNumber: number;
};

export type PokemonPair = [Pokemon, Pokemon];

type PokemonGraphqlResponse = {
  data: {
    pokemon_v2_pokemon: {
      id: number;
      pokemon_v2_pokemonspecy: {
        name: string;
      };
    }[];
  };
};

export async function getAllPokemon() {
  "use cache";
  cacheLife("forever");
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

  const { data } = (await response.json()) as PokemonGraphqlResponse;

  return data.pokemon_v2_pokemon.map((pokemon) => ({
    name: pokemon.pokemon_v2_pokemonspecy.name,
    dexNumber: pokemon.id,
  }));
}

export async function getTwoPokemon() {
  await connection();
  const allPokemon = await getAllPokemon();
  const shuffled = allPokemon.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2) as PokemonPair;
}
