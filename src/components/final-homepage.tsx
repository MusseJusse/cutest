import { cookies } from "next/headers";
import { Suspense } from "react";
import BattleArena from "~/components/battle-arena";
import RecentVotes from "~/components/recent-votes";
import SiteHeader from "~/components/site-header";
import { VoteFallback } from "~/components/ui/fallbacks";
import { parsePokemonPair, selectPokemonPairs } from "~/sdk/pokemon";
import { getContenderStats } from "~/sdk/vote";
import type { PokemonPair } from "~/sdk/pokemon";

const QUEUE_SIZE = 6;

function parsePair(value: string | undefined): PokemonPair | undefined {
  if (!value) return undefined;
  try {
    return parsePokemonPair(JSON.parse(value) as unknown);
  } catch {
    return undefined;
  }
}

async function FinalHomepageContent() {
  const currentPairCookie = (await cookies()).get("currentPair")?.value;

  const pairs = await selectPokemonPairs(QUEUE_SIZE);
  const cookiePair = parsePair(currentPairCookie);
  if (cookiePair) pairs[0] = cookiePair;

  const stats = await getContenderStats(pairs.flat());

  return <BattleArena initialPairs={pairs} initialStats={stats} />;
}

export default function FinalHomepage() {
  return (
    <section className="px-4 py-5 sm:px-6 sm:py-8">
      <div className="@container mx-auto max-w-[1040px]">
        <SiteHeader page="vote" />
        <div className="pt-7 pb-6">
          <h1 className="font-display text-[clamp(1.75rem,5.8cqi,2.875rem)] leading-tight font-extrabold tracking-[-0.045em]">
            Which is cutest?
          </h1>
        </div>
        <Suspense fallback={<VoteFallback />}>
          <FinalHomepageContent />
        </Suspense>
        <Suspense fallback={null}>
          <RecentVotes />
        </Suspense>
      </div>
    </section>
  );
}
