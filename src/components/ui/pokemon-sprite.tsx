import { cn } from "~/lib/utils";
import type { Pokemon } from "~/sdk/pokemon";

export const spriteUrl = (dexNumber: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;

type SpritePriority = "high" | "low";

export type SpriteTileSize =
  "arena" | "podiumFirst" | "podium" | "detail" | "row";

// Every >= 1x tile sizes its inner content box to an exact 96px (1x) or 192px (2x)
// integer multiple of the 96x96 PokeAPI sprites so nearest-neighbor scaling stays crisp.
export const SPRITE_TILE_CLASS: Record<SpriteTileSize, string> = {
  arena:
    "my-1 flex h-[104px] w-[104px] items-center justify-center rounded-2xl bg-ring-paper/85 p-1 ring-1 ring-ring-ink/12 min-[420px]:h-28 min-[420px]:w-28 min-[420px]:p-2 sm:h-[208px] sm:w-[208px] sm:rounded-[18px] sm:p-2",
  podiumFirst:
    "my-2 flex h-28 w-28 items-center justify-center rounded-xl bg-ring-paper/85 p-2 ring-1 ring-ring-ink/12",
  podium:
    "my-2 flex h-[104px] w-[104px] items-center justify-center rounded-xl bg-ring-paper/85 p-1 ring-1 ring-ring-ink/12 sm:h-28 sm:w-28 sm:p-2",
  detail:
    "flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-ring-butter p-2 ring-1 ring-ring-ink/12",
  row: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ring-butter p-0.5 ring-1 ring-ring-ink/12 sm:h-12 sm:w-12 sm:rounded-xl sm:p-0",
};

export default function PokemonSprite(props: {
  pokemon: Pokemon;
  className?: string;
  lazy?: boolean;
  priority?: SpritePriority;
  decorative?: boolean;
  pixelated?: boolean;
}) {
  const pixelated = props.pixelated ?? true;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={spriteUrl(props.pokemon.dexNumber)}
      alt={props.decorative ? "" : props.pokemon.name}
      aria-hidden={props.decorative ? true : undefined}
      width={96}
      height={96}
      className={props.className}
      style={pixelated ? { imageRendering: "pixelated" } : undefined}
      loading={props.lazy ? "lazy" : "eager"}
      decoding="async"
      fetchPriority={props.priority}
    />
  );
}

export function SpriteTile({
  pokemon,
  size,
  className,
  lazy,
  priority,
  decorative = true,
}: {
  pokemon: Pokemon;
  size: SpriteTileSize;
  className?: string;
  lazy?: boolean;
  priority?: SpritePriority;
  decorative?: boolean;
}) {
  const isRow = size === "row";

  return (
    <span className={cn(SPRITE_TILE_CLASS[size], className)}>
      <PokemonSprite
        key={pokemon.dexNumber}
        pokemon={pokemon}
        decorative={decorative}
        pixelated={!isRow}
        className="h-full w-full"
        lazy={lazy}
        priority={priority}
      />
    </span>
  );
}
