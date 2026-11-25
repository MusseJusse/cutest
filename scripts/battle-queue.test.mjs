import assert from "node:assert/strict";
import test from "node:test";
import { createBattleQueue } from "../src/lib/battle-queue.ts";

const pair = (id) => [
  { name: `pokemon-${id}`, dexNumber: id },
  { name: `pokemon-${id + 1}`, dexNumber: id + 1 },
];

const statsFor = (pairs) =>
  Object.fromEntries(
    pairs
      .flat()
      .map((pokemon) => [
        pokemon.dexNumber,
        { wins: pokemon.dexNumber, losses: 1, winRate: 0.5 },
      ]),
  );

function setup(initialPairs, { failVote = false } = {}) {
  const votes = [];
  const nextPairs = [];
  const requests = [];
  let shouldFailVote = failVote;
  let snapshot;

  const queue = createBattleQueue({
    initialPairs,
    initialStats: statsFor(initialPairs),
    submitVote: (current, pick) => {
      votes.push([current, pick]);
      return shouldFailVote
        ? Promise.reject(new Error("redis unavailable"))
        : Promise.resolve();
    },
    fetchMorePairs: () =>
      new Promise((resolve, reject) => {
        requests.push({ resolve, reject });
      }),
    onNextPair: (next) => {
      nextPairs.push(next);
    },
    onChange: (nextSnapshot) => {
      snapshot = nextSnapshot;
    },
  });
  snapshot = queue.getSnapshot();

  return {
    queue,
    votes,
    nextPairs,
    requests,
    setFailVote(value) {
      shouldFailVote = value;
    },
    get snapshot() {
      return snapshot;
    },
  };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

test("rapid clicks consume distinct pairs and keep the final pair", () => {
  const pairs = Array.from({ length: 6 }, (_, index) => pair(index * 2 + 1));
  const app = setup(pairs);
  for (let index = 0; index < 8; index++) app.queue.vote(0);

  assert.equal(app.votes.length, 5);
  app.votes.forEach(([current, pick], index) => {
    assert.deepEqual(current, pairs[index]);
    assert.equal(pick, 0);
  });
  assert.deepEqual(app.nextPairs, pairs.slice(1));
  assert.equal(app.requests.length, 1);
  assert.equal(app.snapshot.pairs.length, 1);
  assert.deepEqual(app.snapshot.pairs[0], pairs[5]);
});

test("a pending refill preserves votes made since it started", async () => {
  const pairs = Array.from({ length: 6 }, (_, index) => pair(index * 2 + 1));
  const app = setup(pairs);
  for (let index = 0; index < 4; index++) app.queue.vote(0);
  assert.equal(app.requests.length, 1);

  app.queue.vote(0);
  const more = [pair(21), pair(23), pair(25), pair(27)];
  app.requests[0].resolve({ pairs: more, stats: statsFor(more) });
  await flush();

  assert.deepEqual(app.snapshot.pairs, [pairs[5], ...more]);
  app.queue.vote(1);
  assert.deepEqual(app.votes.at(-1), [pairs[5], 1]);
  assert.deepEqual(app.snapshot.pairs[0], more[0]);
});

test("failed refills can retry without losing the current pair", async () => {
  const pairs = [pair(1), pair(3)];
  const app = setup(pairs);
  app.queue.vote(0);
  app.requests[0].reject(new Error("offline"));
  await flush();

  app.queue.vote(0);
  assert.equal(app.requests.length, 2);
  assert.equal(app.votes.length, 1);
  assert.deepEqual(app.snapshot.pairs[0], pairs[1]);

  app.requests[1].resolve({ pairs: [pair(5)], stats: statsFor([pair(5)]) });
  await flush();

  app.queue.vote(0);
  assert.equal(app.votes.length, 2);
});

test("long sessions bound both queued pairs and cached contender stats", async () => {
  const app = setup(
    Array.from({ length: 6 }, (_, index) => pair(index * 2 + 1)),
  );
  let handled = 0;
  for (let index = 0; index < 1000; index++) {
    app.queue.vote(0);
    if (app.requests.length > handled) {
      const batch = Array.from({ length: 4 }, (_, offset) =>
        pair(21 + index * 8 + offset * 2),
      );
      app.requests[handled++].resolve({ pairs: batch, stats: statsFor(batch) });
      await flush();
    }
    assert.ok(app.snapshot.pairs.length <= 6);
    assert.ok(Object.keys(app.snapshot.stats).length <= 12);
  }
  assert.equal(app.votes.length, 1000);
});

test("failed vote submissions are recorded and can be retried", async () => {
  const pairs = [pair(1), pair(3), pair(5), pair(7)];
  const app = setup(pairs, { failVote: true });
  app.queue.vote(1);
  await flush();

  assert.equal(app.snapshot.failedVotes.length, 1);
  assert.deepEqual(app.snapshot.failedVotes[0].pair, pairs[0]);
  assert.equal(app.snapshot.failedVotes[0].pick, 1);

  app.setFailVote(false);
  app.queue.retryFailedVotes();
  await flush();

  assert.equal(app.snapshot.failedVotes.length, 0);
  assert.equal(app.votes.length, 2);
  assert.deepEqual(app.votes[1], [pairs[0], 1]);
});
