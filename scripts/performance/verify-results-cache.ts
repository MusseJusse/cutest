import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
import { z } from "zod";

const fixture = "http://127.0.0.1:4310";
const resultsUrl = process.argv[2] ?? "http://127.0.0.1:4312/results";
const schema = z.object({
  counters: z.record(
    z.string(),
    z.object({ requests: z.number(), commands: z.number(), keys: z.number() }),
  ),
});
async function stats() {
  const result = schema.parse(await (await fetch(`${fixture}/stats`)).json());
  return result.counters.optimized ?? { requests: 0, commands: 0, keys: 0 };
}
async function results() {
  const response = await fetch(resultsUrl);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(html.includes("LIVE RESULTS"));
  assert.ok(!html.includes('"digest"'));
}

// Run separately from benchmarks and browser verification to keep counts isolated.
await setTimeout(16050);
await fetch(`${fixture}/reset?delay=0`);
await results();
const cold = await stats();
assert.equal(cold.commands, 2);
for (let i = 0; i < 5; i++) await results();
const warm = await stats();
assert.deepEqual(warm, cold, "Warm requests must not read the database");
await setTimeout(16050);
await results();
const expired = await stats();
assert.equal(
  expired.commands - warm.commands,
  2,
  "Expired rankings must re-read both counter sets",
);
const report = {
  date: new Date().toISOString(),
  cold,
  afterFiveWarmRequests: warm,
  afterExpiry: expired,
};
await writeFile(
  "benchmarks/cache-verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
