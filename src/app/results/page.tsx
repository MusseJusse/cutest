import Link from "next/link";
import { Suspense, ViewTransition, type ReactNode } from "react";
import BroadcastBar from "~/components/broadcast-bar";
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
  "grid grid-cols-[34px_44px_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[34px_44px_minmax(0,1fr)_65px_48px_60px_60px] lg:grid-cols-[48px_56px_minmax(0,1fr)_96px_76px_76px_84px]";

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
    { label: "Battles", value: pokemon.battles.toLocaleString("en-US") },
    { label: "Wins", value: pokemon.stats.wins.toLocaleString("en-US") },
    { label: "Losses", value: pokemon.stats.losses.toLocaleString("en-US") },
  ];

  return (
    <article>
      <details
        name="pokemon-details"
        className={cn(
          "group relative rounded-lg border border-broadcast-dim/15 bg-white/[0.03] open:border-broadcast-gold/60 open:bg-[#101c2c]",
          champion &&
            "rounded-[10px] border-broadcast-gold/35 bg-[linear-gradient(90deg,rgba(255,210,63,0.1),rgba(255,210,63,0.02))] open:bg-none",
        )}
      >
        <summary className="relative cursor-pointer list-none rounded-[inherit] pr-7 group-open:static group-open:min-h-11 group-open:after:absolute group-open:after:inset-0 group-open:after:z-10 group-open:after:content-[''] hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-broadcast-gold [&::-webkit-details-marker]:hidden">
          <span className="sr-only">{pokemon.name} details</span>
          <div className="group-open:hidden">{children}</div>
          <span
            className="absolute top-0 right-3 flex h-full items-center gap-1 text-xs text-broadcast-gold group-open:h-11"
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
        <div className="grid gap-5 px-4 pb-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:items-center sm:gap-6 sm:px-6 sm:pb-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <PokemonSprite
              pokemon={pokemon}
              className="h-32 w-32 shrink-0 scale-115 sm:h-40 sm:w-40"
              lazy
              priority="low"
            />
            <div className="min-w-0">
              <p className="m-0 text-[10px] tracking-[0.12em] text-broadcast-dim uppercase">
                #{pokemon.dexNumber.toString().padStart(4, "0")} · Rank{" "}
                {pokemon.rank.toString().padStart(2, "0")}
              </p>
              <h2 className="my-2 font-display text-3xl leading-none break-words text-broadcast-ink uppercase sm:text-4xl">
                {pokemon.name}
              </h2>
              <p className="m-0 font-mono text-3xl font-bold text-broadcast-gold">
                {pokemon.score.toLocaleString("en-US")}{" "}
                <span className="text-[10px] font-normal uppercase">pts</span>
              </p>
            </div>
          </div>
          <div className="border-t border-broadcast-dim/20 pt-4 sm:border-0 sm:pt-0">
            <h3 className="mt-0 mb-3 text-[10px] font-normal tracking-[0.12em] text-broadcast-dim uppercase">
              Voting statistics
            </h3>
            <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3">
              {statistics.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-broadcast-dim">{label}</dt>
                  <dd className="m-0 font-mono text-2xl font-bold">{value}</dd>
                </div>
              ))}
            </dl>
            <div
              aria-hidden="true"
              className="mt-4 h-1.5 overflow-hidden bg-broadcast-dim/30"
            >
              <div
                className="h-full bg-broadcast-gold"
                style={{ width: `${pokemon.stats.winRate * 100}%` }}
              />
            </div>
          </div>
        </div>
      </details>
    </article>
  );
}

function ScoreBug({ pokemon }: { pokemon: RankedPokemon }) {
  const cell = "flex flex-col items-end";
  const label = "text-[10px] uppercase tracking-[0.16em] text-broadcast-dim";
  const value =
    "m-0 font-mono text-xl font-bold text-broadcast-gold sm:text-2xl";

  return (
    <dl className="col-span-2 m-0 flex gap-5 sm:col-span-1 sm:gap-6">
      <div className={cell}>
        <dt className={label}>pts</dt>
        <dd className={value}>{pokemon.score}</dd>
      </div>
      <div className={cell}>
        <dt className={label}>win</dt>
        <dd className={value}>{pokemon.winRate}%</dd>
      </div>
      <div className={cell}>
        <dt className={label}>record</dt>
        <dd className={value}>
          {pokemon.stats.wins}-{pokemon.stats.losses}
        </dd>
      </div>
    </dl>
  );
}

function ChampionBanner({ pokemon }: { pokemon: RankedPokemon }) {
  return (
    <PokemonDetails pokemon={pokemon} champion>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <PokemonSprite
          pokemon={pokemon}
          className="h-16 w-16 sm:h-20 sm:w-20"
          priority="high"
        />
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-bold tracking-[0.2em] text-broadcast-gold uppercase">
            League leader
          </p>
          <h2 className="m-0 truncate font-display text-4xl leading-none text-broadcast-ink uppercase sm:text-5xl">
            {pokemon.name}
          </h2>
        </div>
        <ScoreBug pokemon={pokemon} />
      </div>
    </PokemonDetails>
  );
}

function StandingsHeader() {
  const cell =
    "font-mono text-[10px] uppercase tracking-[0.16em] text-broadcast-dim";

  return (
    <div aria-hidden="true" className={cn(GRID, "pr-10 pb-1 pl-3")}>
      <span className={cell}>#</span>
      <span />
      <span className={cell}>Pokémon</span>
      <span className={cn(cell, "sm:hidden")}>Pts</span>
      <span className={cn(cell, "hidden sm:block")}>W-L</span>
      <span className={cn(cell, "hidden sm:block")}>Win</span>
      <span className={cn(cell, "hidden sm:block")}>Pts</span>
      <span className={cn(cell, "hidden sm:block")}>Battles</span>
    </div>
  );
}

function StandingsRow({ pokemon }: { pokemon: RankedPokemon }) {
  return (
    <PokemonDetails pokemon={pokemon}>
      <div className={cn(GRID, "px-3 py-2.5")}>
        <p className="m-0 font-mono text-xs text-broadcast-dim">
          {pokemon.rank.toString().padStart(2, "0")}
        </p>
        <PokemonSprite
          pokemon={pokemon}
          className="h-11 w-11"
          lazy
          priority="low"
        />
        <h2 className="m-0 truncate font-display text-2xl leading-none text-broadcast-ink uppercase">
          {pokemon.name}
        </h2>
        <p className="m-0 hidden font-mono text-sm text-broadcast-ink/80 sm:block">
          {pokemon.stats.wins}-{pokemon.stats.losses}
          <span className="sr-only"> win-loss record</span>
        </p>
        <p className="m-0 hidden font-mono text-sm text-broadcast-ink/80 sm:block">
          {pokemon.winRate}%<span className="sr-only"> win rate</span>
        </p>
        <p className="m-0 font-mono text-sm font-bold text-broadcast-gold sm:text-base">
          {pokemon.score}
          <span className="sr-only"> points</span>
        </p>
        <p className="m-0 hidden font-mono text-sm text-broadcast-ink/80 sm:block">
          {pokemon.battles}
          <span className="sr-only"> battles</span>
        </p>
      </div>
    </PokemonDetails>
  );
}

function Pager({ page, totalPages }: { page: number; totalPages: number }) {
  const item =
    "rounded-md border border-broadcast-ink/25 px-3.5 py-2 text-[11px] uppercase tracking-[0.15em] text-broadcast-ink/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-broadcast-gold";
  const enabled =
    "transition-colors duration-150 ease-out hover:border-broadcast-gold hover:bg-broadcast-gold/10 hover:text-broadcast-gold";
  const disabled = "pointer-events-none opacity-30";

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3">
      {page > 1 ? (
        <Link
          href={page === 2 ? "/results" : `/results?page=${page - 1}`}
          className={cn(item, enabled)}
          rel="prev"
          transitionTypes={["nav-page"]}
        >
          ← previous
        </Link>
      ) : (
        <span className={cn(item, disabled)}>← previous</span>
      )}
      <p className="m-0 font-mono text-[11px] tracking-[0.16em] text-broadcast-dim uppercase">
        page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link
          href={`/results?page=${page + 1}`}
          className={cn(item, enabled)}
          rel="next"
          transitionTypes={["nav-page"]}
        >
          next →
        </Link>
      ) : (
        <span className={cn(item, disabled)}>next →</span>
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
      <div className="flex flex-col gap-1.5">
        <StandingsHeader />
        <div className="grid gap-1.5 [&>article:not(:has(details[open]))]:[contain-intrinsic-size:auto_64px] [&>article:not(:has(details[open]))]:[content-visibility:auto]">
          {visible.map((pokemon) => (
            <StandingsRow key={pokemon.dexNumber} pokemon={pokemon} />
          ))}
        </div>
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
      <section className="broadcast-surface min-h-screen overflow-x-hidden px-4 py-5 text-broadcast-ink sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <h1 className="sr-only">Live standings</h1>
          <BroadcastBar
            slate="Standings · refreshed every 15s"
            href="/"
            linkLabel="Battle"
            transitionTypes={["nav-back"]}
          />
          <Suspense fallback={<ResultsFallback />}>
            <ResultsContent searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </ViewTransition>
  );
}
