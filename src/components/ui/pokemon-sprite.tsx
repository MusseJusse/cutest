import type { Pokemon } from "~/sdk/pokemon";

export const spriteUrl = (dexNumber: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;

type SpritePriority = "high" | "low";

export default function PokemonSprite(props: {
  pokemon: Pokemon;
  className?: string;
  lazy?: boolean;
  priority?: SpritePriority;
  decorative?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={spriteUrl(props.pokemon.dexNumber)}
      alt={props.decorative ? "" : props.pokemon.name}
      aria-hidden={props.decorative ? true : undefined}
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
