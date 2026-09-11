import type { Pokemon } from "~/sdk/pokemon";

const spriteUrl = (dexNumber: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;

type SpritePriority = "high" | "low";

export default function PokemonSprite(props: {
  pokemon: Pokemon;
  className?: string;
  lazy?: boolean;
  priority?: SpritePriority;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={spriteUrl(props.pokemon.dexNumber)}
      alt={props.pokemon.name}
      width={96}
      height={96}
      className={props.className}
      style={{ imageRendering: "pixelated" }}
      loading={props.lazy ? "lazy" : "eager"}
      decoding="async"
      fetchPriority={props.priority}
    />
  );
}
