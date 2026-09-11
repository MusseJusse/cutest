import { writeFile } from "node:fs/promises";
import { z } from "zod";

const count = 1025;
const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `query GetAllPokemon {
      pokemon_v2_pokemon(where: {id: {_lte: ${count}}}) {
        id
        pokemon_v2_pokemonspecy { name }
      }
    }`,
  }),
});

if (!response.ok) throw new Error(`PokeAPI returned HTTP ${response.status}`);

const schema = z.object({
  data: z.object({
    pokemon_v2_pokemon: z
      .array(
        z.object({
          id: z.number().int().min(1).max(count),
          pokemon_v2_pokemonspecy: z.object({ name: z.string().min(1) }),
        }),
      )
      .length(count),
  }),
});
const { data } = schema.parse(await response.json());
const catalogue = data.pokemon_v2_pokemon
  .map((pokemon) => ({
    name: pokemon.pokemon_v2_pokemonspecy.name,
    dexNumber: pokemon.id,
  }))
  .sort((a, b) => a.dexNumber - b.dexNumber);

if (catalogue.some((pokemon, index) => pokemon.dexNumber !== index + 1)) {
  throw new Error("PokeAPI must contain each National Dex number exactly once");
}

await writeFile(
  new URL("../src/data/pokemon.json", import.meta.url),
  JSON.stringify(catalogue, null, 2) + "\n",
);
console.log(`Updated ${catalogue.length} Pokemon from PokeAPI species names.`);
