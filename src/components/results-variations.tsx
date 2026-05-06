import Link from "next/link";
import { Suspense } from "react";
import { ResultsFallback } from "~/components/ui/fallbacks";
import PokemonSprite from "~/components/ui/pokemon-sprite";
import { cn } from "~/lib/utils";
import { getRankings } from "~/sdk/vote";

export type ResultsVariation = 1 | 2 | 3 | 4 | 5;

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

function ResultsShell({
  children,
  eyebrow,
  title,
  accent = "text-[#3ef3c6]",
  className,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  note: string;
  accent?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-h-screen overflow-x-hidden bg-[#111018] px-5 py-8 text-white sm:px-8 lg:px-12",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p
              className={cn(
                "text-xs font-black uppercase tracking-[0.35em]",
                accent,
              )}
            >
              {eyebrow}
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-none text-white sm:text-7xl">
              {title}
            </h1>
          </div>
          <Link
            href="/"
            className="border border-white/20 px-4 py-3 text-right text-sm font-bold uppercase tracking-[0.18em] text-white/70 transition hover:border-[#3ef3c6] hover:text-[#3ef3c6]"
          >
            battle
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
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

function ChampionCard({
  pokemon,
  accent = "bg-[#3ef3c6]",
  className,
}: {
  pokemon: RankedPokemon;
  accent?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden border border-[#3ef3c6]/50 bg-white/[0.05] p-5",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", accent)} />
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

function ChallengerRow({
  pokemon,
  compact = false,
}: {
  pokemon: RankedPokemon;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "grid items-center gap-4 border border-white/15 bg-white/[0.04] p-3",
        compact
          ? "sm:grid-cols-[42px_1fr_88px_88px_110px]"
          : "sm:grid-cols-[48px_72px_1fr_88px_88px_110px]",
      )}
    >
      <p className="font-black text-[#ff5d8f]">#{pokemon.rank}</p>
      {!compact && (
        <PokemonSprite pokemon={pokemon} className="h-16 w-16" lazy />
      )}
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

function HeroStackResults({
  rankings,
}: {
  rankings: Awaited<ReturnType<typeof getOrderedRankings>>;
}) {
  const champion = rankings[0];
  const challengers = rankings.slice(1);

  return (
    <ResultsShell
      eyebrow="roundest cache"
      title="LIVE RESULTS"
      note="capped champ"
    >
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
    </ResultsShell>
  );
}

function TelemetryStackResults({
  rankings,
}: {
  rankings: Awaited<ReturnType<typeof getOrderedRankings>>;
}) {
  const champion = rankings[0];
  const challengers = rankings.slice(1);

  return (
    <ResultsShell
      eyebrow="Results 02 / Telemetry Stack"
      title="Score feed"
      note="scanline fill"
      accent="text-[#ff5d8f]"
      className="bg-[#090d12]"
    >
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="grid content-start gap-4">
          {champion && (
            <ChampionCard pokemon={champion} accent="bg-[#ff5d8f]" />
          )}
          <FillPanel title="matchup telemetry" className="bg-[#0f171c]">
            <div className="font-mono text-sm uppercase text-white/70">
              <p>INPUT_A: READY</p>
              <p>INPUT_B: READY</p>
              <p>ROUNDNESS: MANUAL</p>
              <p>CACHE: ACTIVE</p>
            </div>
          </FillPanel>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {challengers.map((pokemon) => (
            <article
              key={pokemon.dexNumber}
              className="border border-[#3ef3c6]/25 bg-[#0f171c] p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="truncate text-2xl font-black uppercase">
                  {pokemon.name}
                </h2>
                <span className="font-mono text-sm text-[#3ef3c6]">
                  #{pokemon.rank}
                </span>
              </div>
              <div className="mt-3 font-mono text-sm text-white/70">
                <p>SCORE: {pokemon.score}</p>
                <p>RATE: {pokemon.winRate}%</p>
                <p>
                  RECORD: {pokemon.stats.wins}W/{pokemon.stats.losses}L
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ResultsShell>
  );
}

function BracketStackResults({
  rankings,
}: {
  rankings: Awaited<ReturnType<typeof getOrderedRankings>>;
}) {
  const champion = rankings[0];
  const topFour = rankings.slice(1, 5);
  const queue = rankings.slice(1);

  return (
    <ResultsShell
      eyebrow="Results 03 / Bracket Stack"
      title="Top bracket"
      note="arcade panel"
      accent="text-[#ffdc48]"
      className="bg-[#0f1117]"
    >
      <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
        <div className="grid content-start gap-4">
          {champion && (
            <ChampionCard pokemon={champion} accent="bg-[#ffdc48]" />
          )}
          <FillPanel title="top four">
            <div className="grid grid-cols-2 gap-2">
              {topFour.map((pokemon) => (
                <div
                  key={pokemon.dexNumber}
                  className="border border-white/10 bg-white/[0.04] p-3"
                >
                  <p className="text-sm font-black text-[#ff5d8f]">
                    #{pokemon.rank}
                  </p>
                  <h2 className="truncate text-xl font-black uppercase">
                    {pokemon.name}
                  </h2>
                  <p className="font-mono text-sm text-[#3ef3c6]">
                    {pokemon.score}
                  </p>
                </div>
              ))}
            </div>
          </FillPanel>
        </div>
        <div className="grid content-start gap-3">
          {queue.map((pokemon) => (
            <ChallengerRow key={pokemon.dexNumber} pokemon={pokemon} />
          ))}
        </div>
      </div>
    </ResultsShell>
  );
}

function MonitorStackResults({
  rankings,
}: {
  rankings: Awaited<ReturnType<typeof getOrderedRankings>>;
}) {
  const champion = rankings[0];
  const challengers = rankings.slice(1);
  const stats = rankings.slice(0, 8);

  return (
    <ResultsShell
      eyebrow="Results 04 / Monitor Stack"
      title="Rank monitor"
      note="control deck"
    >
      <div className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-4">
          <FillPanel title="total wins">
            <p className="text-4xl font-black text-[#3ef3c6]">
              {stats.reduce((sum, pokemon) => sum + pokemon.stats.wins, 0)}
            </p>
          </FillPanel>
          <FillPanel title="battles">
            <p className="text-4xl font-black text-[#ffdc48]">
              {stats.reduce((sum, pokemon) => sum + pokemon.battles, 0)}
            </p>
          </FillPanel>
          <FillPanel title="field">
            <p className="text-4xl font-black text-[#ff5d8f]">
              {rankings.length}
            </p>
          </FillPanel>
          <FillPanel title="top rate">
            <p className="text-4xl font-black text-white">
              {champion?.winRate ?? 0}%
            </p>
          </FillPanel>
        </div>

        {champion && (
          <ChampionCard
            pokemon={champion}
            className="mx-auto w-full max-w-3xl"
          />
        )}

        <div className="border border-white/20 bg-white/[0.05]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-white/45">
              remaining field
            </p>
            <p className="font-mono text-sm text-[#3ef3c6]">
              {challengers.length} entries
            </p>
          </div>
          <div className="grid content-start gap-3 p-3">
            {challengers.map((pokemon) => (
              <ChallengerRow
                key={pokemon.dexNumber}
                pokemon={pokemon}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </ResultsShell>
  );
}

function TerminalStackResults({
  rankings,
}: {
  rankings: Awaited<ReturnType<typeof getOrderedRankings>>;
}) {
  const champion = rankings[0];
  const challengers = rankings.slice(1);

  return (
    <ResultsShell
      eyebrow="Results 05 / Terminal Stack"
      title="Rank index"
      note="fast read"
      accent="text-[#ffdc48]"
    >
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="grid content-start gap-4">
          {champion && (
            <ChampionCard pokemon={champion} accent="bg-[#ffdc48]" />
          )}
          <FillPanel title="champion path">
            <div className="font-mono text-sm uppercase text-white/70">
              <p>dex/{champion?.dexNumber ?? "000"}</p>
              <p>wins/{champion?.stats.wins ?? 0}</p>
              <p>losses/{champion?.stats.losses ?? 0}</p>
              <p>score/{champion?.score ?? 0}</p>
            </div>
          </FillPanel>
        </div>
        <div className="border border-white/20 bg-white/[0.05]">
          {challengers.map((pokemon) => (
            <div
              key={pokemon.dexNumber}
              className="grid items-center gap-4 border-b border-white/10 p-3 last:border-b-0 sm:grid-cols-[72px_1fr_110px_110px]"
            >
              <p className="font-mono text-sm text-[#ff5d8f]">
                {String(pokemon.rank).padStart(2, "0")}
              </p>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-black uppercase">
                  {pokemon.name}
                </h2>
                <p className="font-mono text-xs text-white/45">
                  dex/{pokemon.dexNumber}/battles/{pokemon.battles}
                </p>
              </div>
              <p className="font-mono text-lg font-black text-[#3ef3c6]">
                {pokemon.score}
              </p>
              <p className="font-mono text-sm text-white/60">
                {pokemon.stats.wins}W-{pokemon.stats.losses}L
              </p>
            </div>
          ))}
        </div>
      </div>
    </ResultsShell>
  );
}

async function ResultsContent({ variation }: { variation: ResultsVariation }) {
  const rankings = await getOrderedRankings();

  if (variation === 1) return <HeroStackResults rankings={rankings} />;
  if (variation === 2) return <TelemetryStackResults rankings={rankings} />;
  if (variation === 3) return <BracketStackResults rankings={rankings} />;
  if (variation === 4) return <MonitorStackResults rankings={rankings} />;
  return <TerminalStackResults rankings={rankings} />;
}

export function ResultsVariationPage({
  variation,
}: {
  variation: ResultsVariation;
}) {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsContent variation={variation} />
    </Suspense>
  );
}
