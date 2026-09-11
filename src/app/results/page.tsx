import Link from "next/link";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { ResultsFallback } from "~/components/ui/fallbacks";
import PokemonSprite from "~/components/ui/pokemon-sprite";
import { cn } from "~/lib/utils";
import { getRankings } from "~/sdk/vote";

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

function StatBlock({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function ChampionCard({ pokemon }: { pokemon: RankedPokemon }) {
  return (
    <article className="relative overflow-hidden border border-[#3ef3c6]/50 bg-white/[0.05] p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#3ef3c6]" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#ff5d8f]">
            rank {pokemon.rank}
          </p>
          <h2 className="mt-2 truncate text-5xl font-black uppercase leading-none">
            {pokemon.name}
          </h2>
        </div>
        <p className="font-mono text-sm text-[#3ef3c6]">
          #{pokemon.dexNumber.toString().padStart(3, "0")}
        </p>
      </div>
      <div className="my-5 grid max-h-60 place-items-center overflow-hidden bg-[radial-gradient(circle,#31313b_0_2px,transparent_2px)] [background-size:18px_18px]">
        <PokemonSprite pokemon={pokemon} className="h-64 w-64" lazy />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatBlock label="score" value={pokemon.score} />
        <StatBlock label="win" value={`${pokemon.winRate}%`} />
        <StatBlock
          label="record"
          value={`${pokemon.stats.wins}-${pokemon.stats.losses}`}
        />
      </div>
    </article>
  );
}

function ChallengerRow({ pokemon }: { pokemon: RankedPokemon }) {
  return (
    <article className="grid items-center gap-4 border border-white/15 bg-white/[0.04] p-3 sm:grid-cols-[48px_72px_1fr_88px_88px_110px]">
      <p className="font-black text-[#ff5d8f]">#{pokemon.rank}</p>
      <PokemonSprite pokemon={pokemon} className="h-16 w-16" lazy />
      <div className="min-w-0">
        <h2 className="truncate text-2xl font-black uppercase">
          {pokemon.name}
        </h2>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
          dex {pokemon.dexNumber.toString().padStart(3, "0")}
        </p>
      </div>
      <StatBlock label="score" value={pokemon.score} />
      <StatBlock label="win" value={`${pokemon.winRate}%`} />
      <StatBlock
        label="record"
        value={`${pokemon.stats.wins}-${pokemon.stats.losses}`}
      />
    </article>
  );
}

function FillPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn("border border-white/15 bg-white/[0.04] p-4", className)}
    >
      <p className="text-xs font-black uppercase tracking-[0.32em] text-white/45">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </aside>
  );
}

async function ResultsContent() {
  "use cache";
  // Share the database reads, ranking calculation, and rendered list between requests.
  // Refresh on demand after 15 seconds; block for fresh data after 60 seconds.
  cacheLife({ stale: 30, revalidate: 15, expire: 60 });

  const rankings = await getOrderedRankings();
  const champion = rankings[0];
  const challengers = rankings.slice(1);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-stretch">
        {champion && <ChampionCard pokemon={champion} />}
        <FillPanel title="field summary" className="grid content-start">
          <div className="grid gap-2">
            <StatBlock label="entries" value={rankings.length} />
            <StatBlock
              label="wins"
              value={rankings.reduce(
                (sum, pokemon) => sum + pokemon.stats.wins,
                0,
              )}
            />
            <StatBlock
              label="battles"
              value={rankings.reduce(
                (sum, pokemon) => sum + pokemon.battles,
                0,
              )}
            />
          </div>
        </FillPanel>
      </div>
      <div className="grid content-start gap-3 xl:grid-cols-2">
        {challengers.map((pokemon) => (
          <ChallengerRow key={pokemon.dexNumber} pokemon={pokemon} />
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <section className="min-h-screen overflow-x-hidden bg-[#111018] px-5 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#3ef3c6]">
              roundest cache
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-none text-white sm:text-7xl">
              LIVE RESULTS
            </h1>
          </div>
          <Link
            href="/"
            className="border border-white/20 px-4 py-3 text-right text-sm font-bold uppercase tracking-[0.18em] text-white/70 transition hover:border-[#3ef3c6] hover:text-[#3ef3c6]"
          >
            battle
          </Link>
        </div>

        <Suspense fallback={<ResultsFallback />}>
          <ResultsContent />
        </Suspense>
      </div>
    </section>
  );
}
