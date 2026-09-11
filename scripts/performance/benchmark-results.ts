import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { cpus, platform, arch } from "node:os";
import { setTimeout } from "node:timers/promises";

const apps = {
  baseline: "http://127.0.0.1:4311/results",
  optimized: "http://127.0.0.1:4312/results",
};
const fixture = "http://127.0.0.1:4310";
type Sample = Awaited<ReturnType<typeof measure>>;

async function measure(url: string) {
  const start = performance.now();
  const response = await fetch(url);
  const headersMs = performance.now() - start;
  const html = await response.text();
  const totalMs = performance.now() - start;
  assert.equal(response.status, 200);
  assert.ok(!html.includes('"digest"'), "Server rendering error in response");
  const articles = [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)]
    .map((match) => match[0])
    .filter((article) => article.includes("<img"));
  assert.equal(articles.length, 1025, "All ranked Pokémon must be rendered");
  // React can stream stat blocks through placeholders at different chunk boundaries.
  // Compare the ordered identities, not the transient raw HTML placeholders.
  const identities = articles.map((article) => ({
    name: /<h2[^>]*>(.*?)<\/h2>/.exec(article)?.[1],
    sprite: /<img[^>]*src="([^"]+)"/.exec(article)?.[1],
  }));
  assert.ok(identities.every(({ name, sprite }) => name && sprite));
  const articleHash = createHash("sha256")
    .update(JSON.stringify(identities))
    .digest("hex");
  return {
    headersMs,
    totalMs,
    decodedBytes: Buffer.byteLength(html),
    articleHash,
  };
}

function summarize(samples: Sample[]) {
  const sorted = samples.map((sample) => sample.totalMs).sort((a, b) => a - b);
  return {
    samples: samples.length,
    medianMs:
      (sorted[Math.floor((sorted.length - 1) / 2)]! +
        sorted[Math.floor(sorted.length / 2)]!) /
      2,
    p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1]!,
    minMs: sorted[0]!,
    maxMs: sorted.at(-1)!,
    meanDecodedBytes:
      samples.reduce((sum, sample) => sum + sample.decodedBytes, 0) /
      samples.length,
  };
}

const scenarios = [];
for (const delayMs of [0, 50]) {
  await fetch(`${fixture}/reset?delay=${delayMs}`);
  // Expire the previous snapshot before warming this scenario's cache.
  await setTimeout(16050);
  for (let i = 0; i < 3; i++) {
    await measure(apps.baseline);
    await measure(apps.optimized);
  }
  // Warmup is excluded from both timing samples and database counts.
  await fetch(`${fixture}/reset?delay=${delayMs}`);
  const samples: Record<keyof typeof apps, Sample[]> = {
    baseline: [],
    optimized: [],
  };
  const started = performance.now();
  for (let i = 0; i < 30; i++) {
    const order =
      i % 2
        ? (["optimized", "baseline"] as const)
        : (["baseline", "optimized"] as const);
    for (const name of order) samples[name].push(await measure(apps[name]));
  }
  const elapsedMs = performance.now() - started;
  assert.ok(
    elapsedMs < 14000,
    "Samples must fit inside the 15-second cache interval",
  );
  assert.equal(
    new Set(
      [...samples.baseline, ...samples.optimized].map(
        (sample) => sample.articleHash,
      ),
    ).size,
    1,
    "Ranked identities and order must match before and after",
  );
  const baseline = summarize(samples.baseline);
  const optimized = summarize(samples.optimized);
  const stats: unknown = await (await fetch(`${fixture}/stats`)).json();
  scenarios.push({
    delayMs,
    elapsedMs,
    baseline,
    optimized,
    medianReductionPercent: (1 - optimized.medianMs / baseline.medianMs) * 100,
    fixture: stats,
    raw: samples,
  });
}
const report = {
  date: new Date().toISOString(),
  node: process.version,
  machine: `${platform()} ${arch()} ${cpus()[0]?.model}`,
  methodology:
    "Alternating sequential HTTP GETs to local next start builds; 3 warmups and 30 samples per variant per scenario. Total response time includes full decoded HTML body, excludes images/browser layout. Fixed deterministic 1025-Pokémon fixture; 50 ms scenario is simulated upstream delay, not production latency.",
  scenarios,
};
await writeFile(
  "docs/performance-results.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      ...report,
      scenarios: scenarios.map(({ raw: _raw, ...summary }) => summary),
    },
    null,
    2,
  ),
);
