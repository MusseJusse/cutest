import Link from "next/link";
import { Suspense, ViewTransition, type ReactNode } from "react";
import SiteHeader from "~/components/site-header";
import { ResultsFallback } from "~/components/ui/fallbacks";
import PokemonSprite from "~/components/ui/pokemon-sprite";
import { cn } from "~/lib/utils";
import { getRankings } from "~/sdk/vote";

const PAGE_SIZE = 50;
const FIRST_PAGE_CHALLENGERS = PAGE_SIZE - 1;

type RankedPokemon = Awaited<ReturnType<typeof getOrderedRankings>>[0];

async function getOrderedRankings() {
  const rankings = await getRankings();

  return rankings
    .sort((a, b) => b.stats.elo - a.stats.elo)
    .map((pokemon, index) => ({
      ...pokemon,
      rank: index + 1,
      score: Math.round(pokemon.stats.elo * 10),
      winRate: Math.round(pokemon.stats.winRate * 100),
      battles: pokemon.stats.wins + pokemon.stats.losses,
    }));
}

const GRID =
  "grid grid-cols-[24px_44px_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[32px_44px_minmax(0,1fr)_72px_72px_88px] sm:gap-3";

// The expanded summary hit area covers the details, so the whole row toggles natively.
function PokemonDetails({
  pokemon,
  children,
  champion = false,
}: {
  pokemon: RankedPokemon;
  children: ReactNode;
  champion?: boolean;
}) {
  const statistics = [
    { label: "Win rate", value: `${pokemon.winRate}%` },
    { label: "Votes", value: pokemon.battles.toLocaleString("en-US") },
    { label: "Wins", value: pokemon.stats.wins.toLocaleString("en-US") },
    { label: "Losses", value: pokemon.stats.losses.toLocaleString("en-US") },
  ];

  return (
    <article>
      <details
        name="pokemon-details"
        className={cn(
          "group relative border-b border-studio-line open:rounded-xl open:border-studio-accent/40 open:bg-studio-lavender/50",
          champion && "rounded-2xl border-0 bg-studio-lavender/70",
        )}
      >
        <summary className="relative cursor-pointer list-none rounded-[inherit] pr-7 group-open:static group-open:min-h-11 group-open:after:absolute group-open:after:inset-0 group-open:after:z-10 group-open:after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-accent [&::-webkit-details-marker]:hidden [details:not([open])_&]:hover:bg-studio-lavender/40">
          <span className="sr-only">{pokemon.name} details</span>
          <div className="group-open:hidden">{children}</div>
          <span
            className="absolute top-0 right-3 flex h-full items-center gap-1 text-xs text-studio-muted group-open:h-11"
            aria-hidden="true"
          >
            <span className="hidden group-open:inline">Collapse</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="group-open:rotate-180"
            >
              <path
                d="m3 4.5 3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <div>
          <div className="grid gap-5 px-4 pb-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:items-center sm:gap-6 sm:px-6 sm:pb-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              <PokemonSprite
                pokemon={pokemon}
                className="h-28 w-28 shrink-0 sm:h-40 sm:w-40"
                lazy
                priority="low"
              />
              <div className="min-w-0">
                <p className="m-0 text-[11px] text-studio-muted">
                  #{pokemon.dexNumber.toString().padStart(4, "0")} · Rank{" "}
                  {pokemon.rank.toString().padStart(2, "0")}
                </p>
                <h2 className="my-2 font-display text-3xl leading-tight font-extrabold tracking-tight break-words text-studio-ink capitalize sm:text-4xl">
                  {pokemon.name}
                </h2>
                <p className="m-0 text-2xl font-semibold text-studio-ink tabular-nums">
                  {pokemon.score.toLocaleString("en-US")}{" "}
                  <span className="text-xs font-normal text-studio-muted">
                    points
                  </span>
                </p>
              </div>
            </div>
            <div className="border-t border-studio-line pt-4 sm:border-0 sm:pt-0">
              <h3 className="mt-0 mb-3 text-xs font-medium text-studio-muted">
                Voting statistics
              </h3>
              <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3">
                {statistics.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-studio-muted">{label}</dt>
                    <dd className="m-0 text-2xl font-semibold tabular-nums">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div
                aria-hidden="true"
                className="mt-4 h-1.5 overflow-hidden bg-studio-line"
              >
                <div
                  className="h-full bg-studio-accent"
                  style={{ width: `${pokemon.stats.winRate * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </details>
    </article>
  );
}

function ChampionBanner({ pokemon }: { pokemon: RankedPokemon }) {
  return (
    <PokemonDetails pokemon={pokemon} champion>
      <div className="flex items-center gap-3 p-3 sm:gap-6 sm:px-6 sm:py-2">
        <div className="grid h-28 w-28 shrink-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] place-items-center overflow-clip sm:h-36 sm:w-36">
          <PokemonSprite
            pokemon={pokemon}
            className="h-44 w-44 max-w-none sm:h-52 sm:w-52"
            priority="high"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-studio-muted">Rank 01</p>
          <h2 className="my-1 font-display text-3xl leading-tight font-extrabold tracking-tight break-words capitalize sm:text-4xl">
            {pokemon.name}
          </h2>
          <p className="text-lg tabular-nums">
            {pokemon.score.toLocaleString("en-US")}{" "}
            <span className="text-xs text-studio-muted">points</span>
          </p>
        </div>
      </div>
    </PokemonDetails>
  );
}

function StandingsHeader() {
  const cell = "text-[10px] text-studio-muted";

  return (
    <div aria-hidden="true" className={cn(GRID, "pr-7 pb-2 pl-1 sm:pl-2")}>
      <span className={cell}>Rank</span>
      <span />
      <span className={cell}>Pokémon</span>
      <span className={cn(cell, "hidden text-right sm:block")}>Win rate</span>
      <span className={cn(cell, "hidden text-right sm:block")}>Votes</span>
      <span className={cn(cell, "text-right")}>Points</span>
    </div>
  );
}

function StandingsRow({ pokemon }: { pokemon: RankedPokemon }) {
  return (
    <PokemonDetails pokemon={pokemon}>
      <div className={cn(GRID, "px-1 py-2 sm:px-2")}>
        <p className="text-[11px] text-studio-muted tabular-nums">
          {pokemon.rank.toString().padStart(2, "0")}
        </p>
        <PokemonSprite
          pokemon={pokemon}
          className="h-11 w-11"
          lazy
          priority="low"
        />
        <h2 className="text-xs font-semibold break-words capitalize sm:text-sm">
          {pokemon.name}
        </h2>
        <p className="hidden text-right text-xs text-studio-muted tabular-nums sm:block">
          {pokemon.winRate}%<span className="sr-only"> win rate</span>
        </p>
        <p className="hidden text-right text-xs text-studio-muted tabular-nums sm:block">
          {pokemon.battles.toLocaleString("en-US")}
          <span className="sr-only"> votes</span>
        </p>
        <p className="text-right text-xs font-semibold tabular-nums sm:text-sm">
          {pokemon.score.toLocaleString("en-US")}
          <span className="sr-only"> points</span>
        </p>
      </div>
    </PokemonDetails>
  );
}

function Pager({ page, totalPages }: { page: number; totalPages: number }) {
  const item =
    "inline-flex min-h-11 items-center py-2 text-xs text-studio-muted";
  const enabled =
    "hover:text-studio-ink hover:underline hover:underline-offset-4";
  const disabled = "opacity-50";

  return (
    <nav
      aria-label="Rankings pages"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      {page > 1 ? (
        <Link
          href={page === 2 ? "/results" : `/results?page=${page - 1}`}
          className={cn(item, enabled)}
          rel="prev"
          transitionTypes={["nav-page"]}
        >
          ← Previous
        </Link>
      ) : (
        <span className={cn(item, disabled)}>← Previous</span>
      )}
      <p className="m-0 text-[11px] text-studio-muted tabular-nums">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link
          href={`/results?page=${page + 1}`}
          className={cn(item, enabled)}
          rel="next"
          transitionTypes={["nav-page"]}
        >
          Next →
        </Link>
      ) : (
        <span className={cn(item, disabled)}>Next →</span>
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

  const rankings = await getOrderedRankings();
  const champion = rankings[0];
  const challengers = rankings.slice(1);
  const totalPages = Math.max(
    1,
    Math.ceil((challengers.length - FIRST_PAGE_CHALLENGERS) / PAGE_SIZE) + 1,
  );
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), totalPages)
    : 1;
  const firstPage = page === 1;
  const start = firstPage ? 0 : FIRST_PAGE_CHALLENGERS + (page - 2) * PAGE_SIZE;
  const visible = challengers.slice(
    start,
    firstPage ? FIRST_PAGE_CHALLENGERS : start + PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-4">
      {firstPage && champion ? <ChampionBanner pokemon={champion} /> : null}
      <Pager page={page} totalPages={totalPages} />
      <div>
        <StandingsHeader />
        {/* Keep content-visibility on open rows too. Flipping it on collapse leaves WebKit painting the stale expanded height. */}
        <ol
          start={firstPage ? 2 : start + 2}
          className="[&>li]:[contain-intrinsic-size:auto_61px] [&>li]:[content-visibility:auto]"
        >
          {visible.map((pokemon) => (
            <li key={pokemon.dexNumber}>
              <StandingsRow pokemon={pokemon} />
            </li>
          ))}
        </ol>
      </div>
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
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        "nav-page": "page-fade",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        "nav-page": "page-fade",
        default: "none",
      }}
      default="none"
    >
      <section className="px-4 py-5 sm:px-6 sm:py-8">
        <div className="@container mx-auto max-w-[1040px]">
          <SiteHeader page="rankings" />
          <div className="pt-7 pb-5">
            <h1 className="font-display text-[clamp(1.75rem,5cqi,2.5rem)] leading-tight font-extrabold tracking-tight">
              Cutest Pokémon
            </h1>
            <p className="mt-2 text-xs text-studio-muted">
              Ranked by your votes
            </p>
          </div>
          <Suspense fallback={<ResultsFallback />}>
            <ResultsContent searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </ViewTransition>
  );
}
