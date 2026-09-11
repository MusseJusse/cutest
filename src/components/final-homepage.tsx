import { cookies } from "next/headers";
import { Suspense } from "react";
import BattleArena from "~/components/battle-arena";
import BattleTicker from "~/components/battle-ticker";
import BroadcastBar from "~/components/broadcast-bar";
import { VoteFallback } from "~/components/ui/fallbacks";
import { selectPokemonPairs } from "~/sdk/pokemon";
import { getContenderStats } from "~/sdk/vote";
import type { PokemonPair } from "~/sdk/pokemon";

const QUEUE_SIZE = 6;

function parsePair(value: string | undefined): PokemonPair | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 2) return undefined;
    const [first, second] = parsed as PokemonPair;
    if (
      typeof first?.dexNumber !== "number" ||
      typeof first.name !== "string" ||
      typeof second?.dexNumber !== "number" ||
      typeof second.name !== "string"
    ) {
      return undefined;
    }
    return [first, second];
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
    <section className="broadcast-surface min-h-screen overflow-x-hidden px-4 py-5 text-broadcast-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <h1 className="sr-only">Which Pokémon is cutest?</h1>
        <BroadcastBar
          slate="Pick the cutest. Climb the table."
          href="/results"
          linkLabel="Rankings"
          transitionTypes={["nav-forward"]}
        />
        <Suspense fallback={<VoteFallback />}>
          <FinalHomepageContent />
        </Suspense>
        <Suspense fallback={null}>
          <BattleTicker />
        </Suspense>
      </div>
    </section>
  );
}
