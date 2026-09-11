import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import BattleArena from "~/components/battle-arena";
import { VoteFallback } from "~/components/ui/fallbacks";
import { selectPokemonPairs } from "~/sdk/pokemon";
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

  return <BattleArena initialPairs={pairs} />;
}

export default function FinalHomepage() {
  return (
    <section className="min-h-screen overflow-x-hidden bg-[#111018] px-5 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#3ef3c6]">
              Roundest Cache
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-none text-white sm:text-7xl">
              BATTLE
            </h1>
          </div>
          <Link
            href="/results"
            className="border border-white/20 px-4 py-3 text-right text-sm font-bold uppercase tracking-[0.18em] text-white/70 transition hover:border-[#3ef3c6] hover:text-[#3ef3c6]"
          >
            results
          </Link>
        </div>

        <Suspense fallback={<VoteFallback />}>
          <FinalHomepageContent />
        </Suspense>
      </div>
    </section>
  );
}
