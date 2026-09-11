import { writeFile } from "node:fs/promises";
import { cpus, platform, arch } from "node:os";
import { setTimeout } from "node:timers/promises";

const hosts = {
  "raw.githubusercontent.com": (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/pokemon/${id}.png`,
  "cdn.jsdelivr.net": (id) =>
    `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${id}.png`,
};
const ids = [1, 25, 39, 52, 94, 131, 133, 143, 150, 152, 196, 212, 248, 282,
  330, 376, 384, 445, 448, 494, 571, 635, 700, 778, 887, 980, 1008, 1025];

async function timeOnce(url) {
  const start = performance.now();
  const response = await fetch(url);
  const headersMs = performance.now() - start;
  const body = await response.arrayBuffer();
  const totalMs = performance.now() - start;
  return {
    status: response.status,
    headersMs,
    totalMs,
    bytes: body.byteLength,
    cacheControl: response.headers.get("cache-control"),
  };
}

// Warm connections and TLS; samples are discarded.
for (const build of Object.values(hosts)) {
  for (const id of ids.slice(0, 4)) await timeOnce(build(id));
  await setTimeout(250);
}

const samples = { raw: [], jsdelivr: [] };
const names = {
  "raw.githubusercontent.com": "raw",
  "cdn.jsdelivr.net": "jsdelivr",
};

for (let round = 0; round < 5; round++) {
  for (const [host, build] of Object.entries(hosts)) {
    for (const id of ids) {
      const sample = await timeOnce(build(id));
      samples[names[host]].push(sample);
    }
    await setTimeout(100);
  }
}

function summarize(list) {
  const values = list.map((sample) => sample.headersMs).sort((a, b) => a - b);
  const totals = list.map((sample) => sample.totalMs).sort((a, b) => a - b);
  const pick = (sorted, quantile) =>
    sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1)];
  return {
    requests: list.length,
    statuses: [...new Set(list.map((sample) => sample.status))],
    bytes: [...new Set(list.map((sample) => sample.bytes))],
    cacheControl: [...new Set(list.map((sample) => sample.cacheControl))],
    medianHeadersMs:
      (values[Math.floor((values.length - 1) / 2)] +
        values[Math.floor(values.length / 2)]) /
      2,
    medianTotalMs:
      (totals[Math.floor((totals.length - 1) / 2)] +
        totals[Math.floor(totals.length / 2)]) /
      2,
    p90TotalMs: pick(totals, 0.9),
    p95TotalMs: pick(totals, 0.95),
    p99TotalMs: pick(totals, 0.99),
    maxTotalMs: totals.at(-1),
    over100ms: totals.filter((value) => value > 100).length,
  };
}

const report = {
  date: new Date().toISOString(),
  node: process.version,
  machine: `${platform()} ${arch()} ${cpus()[0]?.model}`,
  methodology:
    "Sequential HTTPS GETs from this machine, 5 rounds of 28 sprites per host after an excluded warmup round; measures network delivery only, not browser rendering.",
  spriteIds: ids.length,
  raw: summarize(samples.raw),
  jsdelivr: summarize(samples.jsdelivr),
  samples,
};
await writeFile(
  "benchmarks/image-delivery.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
