import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import PageShell from "~/components/page-shell";
import { ResultsFallback } from "~/components/ui/fallbacks";
import PokemonSprite from "~/components/ui/pokemon-sprite";
import { cn } from "~/lib/utils";
import { getRankingsPage, type RankedPokemon } from "~/sdk/vote";

const PAGE_SIZE = 50;
const EAGER_CHALLENGERS = 6;

const ROW_GRID =
  "grid grid-cols-[minmax(40px,auto)_40px_minmax(0,1fr)_auto] items-center gap-2.5 sm:grid-cols-[minmax(50px,auto)_44px_minmax(0,1fr)_auto_86px] sm:gap-3";

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
        !compact && "sm:border-0 sm:pt-0",
      )}
    >
      <h3 className="mt-0 mb-2.5 text-xs font-bold text-ring-muted">
        Voting statistics
      </h3>
      <dl
        className={cn(
          "m-0 grid gap-x-3 gap-y-2.5",
          compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {statistics.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11px] font-medium text-ring-muted">{label}</dt>
            <dd
              className={cn(
                "m-0 font-display font-bold text-ring-ink tabular-nums",
                compact ? "text-base sm:text-lg" : "text-lg sm:text-xl",
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

// The expanded summary hit area lets the whole standings row toggle natively.
function PokemonDetails({
  pokemon,
  children,
}: {
  pokemon: RankedPokemon;
  children: ReactNode;
}) {
  return (
    <article>
      <details
        name="pokemon-details"
        className="group relative overflow-hidden rounded-2xl border-2 border-ring-ink bg-ring-paper shadow-[0_2px_0_rgb(25_24_59/0.12)] open:bg-ring-cream"
      >
        <summary className="relative cursor-pointer list-none rounded-[14px] pr-8 group-open:static group-open:min-h-11 group-open:rounded-b-none group-open:after:absolute group-open:after:inset-0 group-open:after:z-10 group-open:after:content-[''] focus-visible:-outline-offset-4 [&::-webkit-details-marker]:hidden [details:not([open])_&]:hover:bg-ring-cream">
          <span className="sr-only hidden group-open:inline">
            Collapse {pokemon.name} details
          </span>
          <span className="block group-open:hidden">{children}</span>
          <span
            className="absolute top-0 right-3 flex h-full items-center gap-1 text-xs font-bold text-ring-muted group-open:h-11"
            aria-hidden="true"
          >
            <span className="hidden group-open:inline">Collapse</span>
            <Chevron className="group-open:rotate-180" />
          </span>
        </summary>
        <div>
          <div className="grid gap-4 px-4 pt-0 pb-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] sm:items-center sm:gap-6 sm:px-6 sm:pt-0 sm:pb-5">
            <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28">
                <span
                  aria-hidden="true"
                  className="absolute inset-1.5 rounded-full border-2 border-ring-ink bg-ring-butter"
                />
                <PokemonSprite
                  pokemon={pokemon}
                  decorative
                  className="relative z-10 h-24 w-24 max-w-none shrink-0 object-contain sm:h-28 sm:w-28"
                  lazy
                  priority="low"
                />
              </div>
              <div className="min-w-0">
                <p className="m-0 text-xs font-bold text-ring-muted tabular-nums">
                  #{pokemon.dexNumber.toString().padStart(4, "0")} Rank{" "}
                  {pokemon.rank}
                </p>
                <h2 className="my-1 font-display text-2xl leading-tight font-bold tracking-tight break-words text-ring-ink capitalize sm:text-3xl">
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
          <span
            className={cn(
              "relative my-2 flex items-center justify-center",
              isFirst
                ? "h-24 w-24 sm:h-28 sm:w-28"
                : "h-20 w-20 sm:h-24 sm:w-24",
            )}
          >
            <span
              aria-hidden="true"
              className="absolute inset-1.5 rounded-full border-2 border-ring-ink bg-ring-paper shadow-[0_3px_0_rgb(25_24_59/0.12)]"
            />
            <PokemonSprite
              pokemon={pokemon}
              decorative
              className={cn(
                "relative z-10 max-w-none shrink-0 object-contain",
                isFirst
                  ? "h-[104px] w-[104px] sm:h-[124px] sm:w-[124px]"
                  : "h-[88px] w-[88px] sm:h-[104px] sm:w-[104px]",
              )}
              priority="high"
            />
          </span>
          <h2
            className={cn(
              "m-0 max-w-full font-display leading-tight font-bold tracking-tight break-words hyphens-auto text-ring-ink capitalize",
              isFirst ? "text-xl sm:text-2xl" : "text-base sm:text-xl",
            )}
          >
            {pokemon.name}
          </h2>
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
          #{pokemon.rank}
        </span>
        <span className="relative flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-[1.5px] border-ring-ink bg-ring-butter"
          />
          <PokemonSprite
            pokemon={pokemon}
            decorative
            className="relative z-10 h-11 w-11 max-w-none shrink-0 object-contain sm:h-12 sm:w-12"
            lazy={!eager}
            priority={eager ? undefined : "low"}
          />
        </span>
        <span className="font-display text-sm font-bold break-words text-ring-ink capitalize sm:text-base">
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
        className="flex flex-col gap-1.5 [&>li]:pb-0.5 [&>li]:[contain-intrinsic-size:auto_66px] [&>li]:[content-visibility:auto] sm:[&>li]:[contain-intrinsic-size:auto_70px]"
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
      headingSpacingClassName="pt-6 pb-5 sm:pt-7 sm:pb-6"
      pageFade
    >
      <Suspense fallback={<ResultsFallback />}>
        <ResultsContent searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}
