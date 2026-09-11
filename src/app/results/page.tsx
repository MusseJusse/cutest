import Link from "next/link";
import { Suspense } from "react";
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
  "grid grid-cols-[34px_44px_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[48px_56px_minmax(0,1fr)_96px_76px_76px_84px]";

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
    <article className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-[10px] border border-broadcast-gold/35 bg-[linear-gradient(90deg,rgba(255,210,63,0.1),rgba(255,210,63,0.02))] p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
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
    </article>
  );
}

function StandingsHeader() {
  const cell =
    "font-mono text-[10px] uppercase tracking-[0.16em] text-broadcast-dim";

  return (
    <div aria-hidden="true" className={cn(GRID, "px-3 pb-1")}>
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
    <article
      className={cn(
        GRID,
        "rounded-lg border border-broadcast-dim/15 bg-white/[0.03] px-3 py-2.5 transition-colors duration-150 ease-out hover:bg-white/[0.06]",
      )}
    >
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
    </article>
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
        <div className="grid gap-1.5 [&>article]:[contain-intrinsic-size:auto_64px] [&>article]:[content-visibility:auto]">
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
    <section className="broadcast-surface min-h-screen overflow-x-hidden px-4 py-5 text-broadcast-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <h1 className="sr-only">Live standings</h1>
        <BroadcastBar
          slate="Standings · refreshed every 15s"
          href="/"
          linkLabel="Battle"
        />
        <Suspense fallback={<ResultsFallback />}>
          <ResultsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
