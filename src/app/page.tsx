import { cookies } from "next/headers";
import { Suspense } from "react";
import BattleArena from "~/components/battle-arena";
import PageShell from "~/components/page-shell";
import RecentVotes from "~/components/recent-votes";
import { VoteFallback } from "~/components/ui/fallbacks";
import {
  parsePokemonPair,
  selectPokemonPairs,
  type PokemonPair,
} from "~/sdk/pokemon";
import { getContenderStats } from "~/sdk/vote";

const QUEUE_SIZE = 6;

function parsePairCookie(value: string | undefined): PokemonPair | undefined {
  if (!value) return undefined;
  try {
    return parsePokemonPair(JSON.parse(value) as unknown);
  } catch {
    return undefined;
  }
}

async function HomeContent() {
  const cookieStore = await cookies();
  // Prefer the client-managed cookie, falling back to the legacy HttpOnly cookie until first vote.
  const storedPair =
    cookieStore.get("battlePair")?.value ??
    cookieStore.get("currentPair")?.value;

  const pairs = selectPokemonPairs(QUEUE_SIZE);
  const cookiePair = parsePairCookie(storedPair);
  if (cookiePair) pairs[0] = cookiePair;

  const stats = await getContenderStats(pairs.flat());

  return <BattleArena initialPairs={pairs} initialStats={stats} />;
}

export default function HomePage() {
  return (
    <PageShell
      page="vote"
      title="Which is cutest?"
      titleClassName="text-[clamp(1.85rem,5.5cqi,2.75rem)] tracking-[-0.03em]"
      headingSpacingClassName="pt-6 pb-5 sm:pt-7 sm:pb-6"
    >
      <Suspense fallback={<VoteFallback />}>
        <HomeContent />
      </Suspense>
      <Suspense fallback={null}>
        <RecentVotes />
      </Suspense>
    </PageShell>
  );
}
