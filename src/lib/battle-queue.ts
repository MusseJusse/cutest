import type { PokemonPair } from "~/sdk/pokemon";
import type { ContenderStats } from "~/sdk/vote";

export const REFILL_THRESHOLD = 3;

export type Pick = 0 | 1;
export type StatsMap = Record<number, ContenderStats>;

export type FailedVote = {
  voteId: string;
  pair: PokemonPair;
  pick: Pick;
};

export type BattleQueueSnapshot = {
  pairs: PokemonPair[];
  stats: StatsMap;
  failedVotes: FailedVote[];
  refilling: boolean;
  refillFailed: boolean;
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
  createVoteId = () => crypto.randomUUID(),
  onNextPair,
  onChange,
}: {
  initialPairs: PokemonPair[];
  initialStats: StatsMap;
  submitVote: (pair: PokemonPair, pick: Pick, voteId: string) => Promise<void>;
  fetchMorePairs: () => Promise<{ pairs: PokemonPair[]; stats: StatsMap }>;
  createVoteId?: () => string;
  onNextPair?: (nextPair: PokemonPair) => void;
  onChange: (snapshot: BattleQueueSnapshot) => void;
}) {
  let pairs = [...initialPairs];
  let stats = pruneStats(pairs, initialStats);
  let failedVotes: FailedVote[] = [];
  let refilling = false;
  let refillFailed = false;

  const getSnapshot = (): BattleQueueSnapshot => ({
    pairs,
    stats,
    failedVotes,
    refilling,
    refillFailed,
  });

  const notify = () => {
    onChange(getSnapshot());
  };

  function dispatchVote(pair: PokemonPair, pick: Pick, voteId: string) {
    void submitVote(pair, pick, voteId).catch(() => {
      failedVotes = [...failedVotes, { voteId, pair, pick }];
      notify();
    });
  }

  async function refill() {
    if (refilling) return;
    refilling = true;
    refillFailed = false;
    notify();
    try {
      const more = await fetchMorePairs();
      pairs = [...pairs, ...more.pairs];
      stats = pruneStats(pairs, { ...stats, ...more.stats });
    } catch {
      refillFailed = true;
    } finally {
      refilling = false;
      notify();
    }
  }

  function vote(pick: Pick) {
    const [currentPair, nextPair] = pairs;
    if (!currentPair || !nextPair) {
      void refill();
      return;
    }
    const voteId = createVoteId();
    pairs = pairs.slice(1);
    stats = pruneStats(pairs, stats);
    onNextPair?.(nextPair);
    notify();
    // Start refill before submitting the vote so it does not wait behind the vote write
    // in Next.js's serial Server Action queue.
    if (pairs.length < REFILL_THRESHOLD) void refill();
    dispatchVote(currentPair, pick, voteId);
  }

  function retryFailedVotes() {
    if (failedVotes.length === 0) return;
    const toRetry = failedVotes;
    failedVotes = [];
    notify();
    for (const entry of toRetry) {
      dispatchVote(entry.pair, entry.pick, entry.voteId);
    }
  }

  function dismissFailedVotes() {
    if (failedVotes.length === 0) return;
    failedVotes = [];
    notify();
  }

  return {
    vote,
    refill,
    retryFailedVotes,
    dismissFailedVotes,
    getSnapshot,
  };
}
