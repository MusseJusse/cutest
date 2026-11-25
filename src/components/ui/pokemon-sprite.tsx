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
    "my-1 flex h-[108px] w-[108px] items-center justify-center rounded-2xl border-2 border-ring-ink bg-ring-paper p-1 shadow-[0_3px_0_rgb(25_24_59/0.14)] min-[420px]:h-[116px] min-[420px]:w-[116px] min-[420px]:p-2 sm:h-[212px] sm:w-[212px] sm:rounded-[18px] sm:p-2",
  podiumFirst:
    "my-2 flex h-[116px] w-[116px] items-center justify-center rounded-xl border-2 border-ring-ink bg-ring-paper p-2 shadow-[0_3px_0_rgb(25_24_59/0.12)]",
  podium:
    "my-2 flex h-[108px] w-[108px] items-center justify-center rounded-xl border-2 border-ring-ink bg-ring-paper p-1 shadow-[0_3px_0_rgb(25_24_59/0.12)] sm:h-[116px] sm:w-[116px] sm:p-2",
  detail:
    "flex h-[116px] w-[116px] shrink-0 items-center justify-center rounded-xl border-2 border-ring-ink bg-ring-butter p-2",
  row: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ring-ink bg-ring-butter p-0.5 sm:h-12 sm:w-12 sm:rounded-xl sm:p-0",
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
