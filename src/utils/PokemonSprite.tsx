import { Pokemon } from "~/sdk/pokemon";

export default function PokemonSprite(props: {
  pokemon: Pokemon;
  className?: string;
  lazy?: boolean;
}) {
  return (
    <img
      src={`https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/pokemon/${props.pokemon.dexNumber}.png`}
      alt={props.pokemon.name}
      className={props.className}
      style={{ imageRendering: "pixelated" }}
      loading={props.lazy ? "lazy" : "eager"}
    />
  );
}
