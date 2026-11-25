import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import PageShell from "~/components/page-shell";
import { ResultsFallback } from "~/components/ui/fallbacks";
import { SpriteTile } from "~/components/ui/pokemon-sprite";
import { cn } from "~/lib/utils";
import { getRankingsPage, type RankedPokemon } from "~/sdk/vote";

const PAGE_SIZE = 50;
const EAGER_CHALLENGERS = 6;

const ROW_GRID =
  "grid grid-cols-[minmax(40px,auto)_40px_minmax(0,1fr)_auto] items-center gap-2.5 sm:grid-cols-[minmax(50px,auto)_48px_minmax(0,1fr)_auto_minmax(86px,auto)] sm:gap-3";

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
      <path
        d="m3 4.5 3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function PointsValue({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-display font-bold text-ring-ink tabular-nums",
        className,
      )}
    >
      {score.toLocaleString("en-US")}{" "}
      <span
        aria-hidden="true"
        className="font-sans text-[11px] font-semibold text-ring-muted"
      >
        pts
      </span>
      <span className="sr-only"> points</span>
    </span>
  );
}

function VotingStatistics({
  pokemon,
  compact = false,
}: {
  pokemon: RankedPokemon;
  compact?: boolean;
}) {
  const statistics = [
    {
      label: "Win rate",
      value: pokemon.battles > 0 ? `${pokemon.winRate}%` : "No votes",
    },
    { label: "Votes", value: pokemon.battles.toLocaleString("en-US") },
    { label: "Wins", value: pokemon.stats.wins.toLocaleString("en-US") },
    { label: "Losses", value: pokemon.stats.losses.toLocaleString("en-US") },
  ];

  return (
    <div
      className={cn(
        "border-t border-ring-line pt-3",
        !compact && "md:border-0 md:pt-0",
      )}
    >
      {compact ? (
        <p className="mt-0 mb-2.5 text-xs font-bold text-ring-muted">
          Voting statistics
        </p>
      ) : (
        <h3 className="mt-0 mb-2.5 text-xs font-bold text-ring-muted">
          Voting statistics
        </h3>
      )}
      <dl
        className={cn(
          "m-0 grid gap-x-3 gap-y-2.5",
          compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4",
        )}
      >
        {statistics.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11px] font-medium text-ring-muted">{label}</dt>
            <dd
              className={cn(
                "m-0 font-display font-bold text-ring-ink tabular-nums",
                compact ? "text-sm sm:text-base" : "text-lg md:text-xl",
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div
        aria-hidden="true"
        className="mt-3 h-2 overflow-hidden rounded-full bg-ring-line"
      >
        <div
          className="h-full rounded-full bg-ring-mint"
          style={{ width: `${pokemon.stats.winRate * 100}%` }}
        />
      </div>
    </div>
  );
}

function PokemonDetails({
  pokemon,
  children,
}: {
  pokemon: RankedPokemon;
  children: ReactNode;
}) {
  const dexLabel = `#${pokemon.dexNumber.toString().padStart(4, "0")}`;

  return (
    <article>
      <details
        name="pokemon-details"
        className="group relative overflow-hidden rounded-2xl border-2 border-ring-ink bg-ring-paper shadow-[0_2px_0_rgb(25_24_59/0.12)] open:bg-ring-cream"
      >
        <summary className="relative cursor-pointer list-none rounded-[14px] pr-8 group-open:flex group-open:min-h-11 group-open:items-center group-open:justify-between group-open:rounded-b-none group-open:border-b group-open:border-ring-line group-open:px-4 group-open:py-2 group-open:hover:bg-ring-butter/50 focus-visible:-outline-offset-4 sm:group-open:px-6 [&::-webkit-details-marker]:hidden [details:not([open])_&]:hover:bg-ring-cream">
          <span className="hidden text-xs font-bold text-ring-muted tabular-nums group-open:inline">
            {dexLabel} Rank {pokemon.rank}
            <span className="sr-only">, collapse {pokemon.name} details</span>
          </span>
          <span className="block group-open:hidden">{children}</span>
          <span
            className="absolute top-0 right-3 flex h-full items-center gap-1 text-xs font-bold text-ring-muted group-open:static group-open:h-auto"
            aria-hidden="true"
          >
            <span className="hidden group-open:inline">Collapse</span>
            <Chevron className="group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-150" />
          </span>
        </summary>
        <div>
          <div className="grid gap-4 px-4 py-4 sm:px-6 sm:py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:items-center md:gap-6">
            <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
              <SpriteTile pokemon={pokemon} size="detail" lazy priority="low" />
              <div className="min-w-0">
                <h2 className="mt-0 mb-1 font-display text-[clamp(1.375rem,3.5cqi,1.875rem)] leading-tight font-bold tracking-tight break-words hyphens-auto text-ring-ink capitalize">
                  {pokemon.name}
                </h2>
                <p className="m-0">
                  <PointsValue score={pokemon.score} className="text-xl" />
                </p>
              </div>
            </div>
            <VotingStatistics pokemon={pokemon} />
          </div>
        </div>
      </details>
    </article>
  );
}

function PodiumCard({
  pokemon,
  place,
}: {
  pokemon: RankedPokemon;
  place: 1 | 2 | 3;
}) {
  const isFirst = place === 1;
  const surface =
    place === 1
      ? "bg-ring-peach"
      : place === 2
        ? "bg-ring-sky"
        : "bg-ring-mint-soft";

  return (
    <article
      className={cn(
        "min-w-0",
        isFirst
          ? "col-span-2 sm:col-span-1"
          : place === 2
            ? "sm:order-first sm:mt-6"
            : "sm:mt-6",
      )}
    >
      <details
        name="pokemon-details"
        className={cn(
          "podium-details group overflow-hidden rounded-2xl border-2 border-ring-ink shadow-[0_3px_0_var(--color-ring-ink)]",
          surface,
        )}
      >
        <summary
          className={cn(
            "relative flex cursor-pointer list-none flex-col items-center rounded-[14px] text-center group-open:rounded-b-none focus-visible:-outline-offset-4 [&::-webkit-details-marker]:hidden",
            isFirst
              ? "px-3 pt-4 pb-3.5 sm:px-4 sm:pt-5 sm:pb-4"
              : "px-2.5 py-3 sm:px-4 sm:py-4",
          )}
        >
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 font-display text-xs font-bold tabular-nums",
              isFirst
                ? "bg-ring-coral text-white"
                : "bg-ring-ink text-ring-butter",
            )}
          >
            <span className="sr-only">Rank </span>#{pokemon.rank}
          </span>
          <SpriteTile
            pokemon={pokemon}
            size={isFirst ? "podiumFirst" : "podium"}
            priority="high"
          />
          <span
            className={cn(
              "block max-w-full font-display leading-tight font-bold tracking-tight break-words hyphens-auto text-ring-ink capitalize",
              isFirst ? "text-xl sm:text-2xl" : "text-base sm:text-xl",
            )}
          >
            {pokemon.name}
          </span>
          <PointsValue
            score={pokemon.score}
            className="mt-0.5 block text-sm sm:text-base"
          />
          <span className="block text-[11px] font-semibold text-ring-muted tabular-nums">
            {pokemon.battles > 0 ? `${pokemon.winRate}% win` : "No votes yet"}
          </span>
          <span
            aria-hidden="true"
            className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-ring-muted"
          >
            <Chevron className="group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-150" />
          </span>
        </summary>
        <div>
          <div className="bg-ring-paper/85 px-3 pb-3.5 sm:px-4 sm:pb-4">
            <VotingStatistics pokemon={pokemon} compact />
          </div>
        </div>
      </details>
    </article>
  );
}

function TopPodium({ items }: { items: readonly RankedPokemon[] }) {
  const [first, second, third] = items;
  if (!first || !second || !third) return null;

  return (
    <section
      aria-label="Top 3 cutest Pokémon"
      className="grid grid-cols-2 items-start gap-2.5 sm:grid-cols-3 sm:gap-4"
    >
      <PodiumCard pokemon={first} place={1} />
      <PodiumCard pokemon={second} place={2} />
      <PodiumCard pokemon={third} place={3} />
    </section>
  );
}

function StandingsRow({
  pokemon,
  eager = false,
}: {
  pokemon: RankedPokemon;
  eager?: boolean;
}) {
  return (
    <PokemonDetails pokemon={pokemon}>
      <span className={cn(ROW_GRID, "py-2.5 pr-1 pl-3 sm:pr-2 sm:pl-4")}>
        <span className="font-display text-xs font-bold text-ring-muted tabular-nums sm:text-sm">
          <span className="sr-only">Rank </span>#{pokemon.rank}
        </span>
        <SpriteTile
          pokemon={pokemon}
          size="row"
          lazy={!eager}
          priority={eager ? undefined : "low"}
        />
        <span className="font-display text-sm font-bold break-words hyphens-auto text-ring-ink capitalize sm:text-base">
          {pokemon.name}
        </span>
        <span
          className={cn(
            "hidden rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums sm:inline-block",
            pokemon.battles > 0
              ? "bg-ring-mint-soft text-ring-mint-ink"
              : "bg-ring-butter text-ring-muted",
          )}
        >
          {pokemon.battles > 0 ? `${pokemon.winRate}% win` : "No votes yet"}
        </span>
        <PointsValue
          score={pokemon.score}
          className="text-right text-xs sm:text-sm"
        />
      </span>
    </PokemonDetails>
  );
}

function Pager({ page, totalPages }: { page: number; totalPages: number }) {
  const base =
    "inline-flex min-h-11 items-center rounded-full border-2 border-ring-ink bg-ring-paper px-4 text-xs font-bold text-ring-ink";
  const enabled =
    "shadow-[0_2px_0_var(--color-ring-ink)] hover:bg-ring-cream motion-safe:transition-transform motion-safe:duration-100 motion-safe:active:translate-y-0.5 motion-safe:active:shadow-none";
  const disabled = "opacity-45";

  return (
    <nav
      aria-label="Rankings pages"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      {page > 1 ? (
        <Link
          href={page === 2 ? "/results" : `/results?page=${page - 1}`}
          className={cn(base, enabled)}
          rel="prev"
          transitionTypes={["nav-page"]}
        >
          Previous
        </Link>
      ) : (
        <span className={cn(base, disabled)}>Previous</span>
      )}
      <p className="m-0 text-xs font-bold text-ring-muted tabular-nums">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link
          href={`/results?page=${page + 1}`}
          className={cn(base, enabled)}
          rel="next"
          transitionTypes={["nav-page"]}
        >
          Next
        </Link>
      ) : (
        <span className={cn(base, disabled)}>Next</span>
      )}
    </nav>
  );
}

async function ResultsContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requested = Number.parseInt(
    typeof params.page === "string" ? params.page : "1",
    10,
  );

  const { page, totalPages, pageStart, items } = await getRankingsPage(
    requested,
    PAGE_SIZE,
  );
  const showPodium = page === 1 && items.length >= 3;
  const podium = showPodium ? items.slice(0, 3) : [];
  const visible = showPodium ? items.slice(3) : items;

  return (
    <div className="flex flex-col gap-5">
      {showPodium ? <TopPodium items={podium} /> : null}
      <Pager page={page} totalPages={totalPages} />
      {/* Keep content-visibility on open rows too. Flipping it on collapse leaves WebKit painting the stale expanded height. */}
      <ol
        start={showPodium ? 4 : pageStart + 1}
        className="flex flex-col gap-1.5 [&>li]:pb-0.5 [&>li]:[contain-intrinsic-size:auto_64px] [&>li]:[content-visibility:auto] sm:[&>li]:[contain-intrinsic-size:auto_72px]"
      >
        {visible.map((pokemon, index) => (
          <li key={pokemon.dexNumber}>
            <StandingsRow pokemon={pokemon} eager={index < EAGER_CHALLENGERS} />
          </li>
        ))}
      </ol>
      <Pager page={page} totalPages={totalPages} />
    </div>
  );
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <PageShell
      page="rankings"
      title="Cutest Pokémon"
      titleClassName="text-[clamp(1.85rem,5cqi,2.5rem)] tracking-[-0.03em]"
      headingSpacingClassName="pt-5 pb-4 sm:pt-6 sm:pb-5"
      pageFade
    >
      <Suspense fallback={<ResultsFallback />}>
        <ResultsContent searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
