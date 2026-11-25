import type { PokemonPair } from "~/sdk/pokemon";
import type { ContenderStats } from "~/sdk/vote";

export const REFILL_THRESHOLD = 3;

export type Pick = 0 | 1;
export type StatsMap = Record<number, ContenderStats>;

export type FailedVote = {
  id: number;
  pair: PokemonPair;
  pick: Pick;
};

export type BattleQueueSnapshot = {
  pairs: PokemonPair[];
  stats: StatsMap;
  failedVotes: FailedVote[];
};

export function pruneStats(
  pairs: readonly PokemonPair[],
  stats: StatsMap,
): StatsMap {
  const next: StatsMap = {};
  for (const [home, away] of pairs) {
    const homeStats = stats[home.dexNumber];
    if (homeStats) next[home.dexNumber] = homeStats;
    const awayStats = stats[away.dexNumber];
    if (awayStats) next[away.dexNumber] = awayStats;
  }
  return next;
}

export function createBattleQueue({
  initialPairs,
  initialStats,
  submitVote,
  fetchMorePairs,
  onNextPair,
  onChange,
}: {
  initialPairs: PokemonPair[];
  initialStats: StatsMap;
  submitVote: (pair: PokemonPair, pick: Pick) => Promise<void>;
  fetchMorePairs: () => Promise<{ pairs: PokemonPair[]; stats: StatsMap }>;
  onNextPair?: (nextPair: PokemonPair) => void;
  onChange: (snapshot: BattleQueueSnapshot) => void;
}) {
  let pairs = [...initialPairs];
  let stats = pruneStats(pairs, initialStats);
  let failedVotes: FailedVote[] = [];
  let nextFailureId = 1;
  let refillPending = false;

  const notify = () => {
    onChange({ pairs, stats, failedVotes });
  };

  function dispatchVote(pair: PokemonPair, pick: Pick) {
    void submitVote(pair, pick).catch(() => {
      failedVotes = [...failedVotes, { id: nextFailureId++, pair, pick }];
      notify();
    });
  }

  async function refill() {
    if (refillPending) return;
    refillPending = true;
    try {
      const more = await fetchMorePairs();
      pairs = [...pairs, ...more.pairs];
      stats = pruneStats(pairs, { ...stats, ...more.stats });
      notify();
    } catch {
      // The next vote tries the refill again.
    } finally {
      refillPending = false;
    }
  }

  function vote(pick: Pick) {
    const [currentPair, nextPair] = pairs;
    if (!currentPair || !nextPair) {
      void refill();
      return;
    }
    pairs = pairs.slice(1);
    stats = pruneStats(pairs, stats);
    onNextPair?.(nextPair);
    notify();
    dispatchVote(currentPair, pick);
    if (pairs.length < REFILL_THRESHOLD) void refill();
  }

  function retryFailedVotes() {
    if (failedVotes.length === 0) return;
    const toRetry = failedVotes;
    failedVotes = [];
    notify();
    for (const entry of toRetry) {
      dispatchVote(entry.pair, entry.pick);
    }
  }

  function dismissFailedVotes() {
    if (failedVotes.length === 0) return;
    failedVotes = [];
    notify();
  }

  return {
    vote,
    retryFailedVotes,
    dismissFailedVotes,
    getSnapshot: (): BattleQueueSnapshot => ({ pairs, stats, failedVotes }),
  };
}
