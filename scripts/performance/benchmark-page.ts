import assert from "node:assert/strict";
import { cpus, platform, arch } from "node:os";
import { writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const [url, expectedArticlesArg = "50", label = "page", outFile] =
  process.argv.slice(2);
const expectedArticles = Number(expectedArticlesArg);

type Sample = {
  headersMs: number;
  totalMs: number;
  decodedBytes: number;
  gzipBytes: number;
  articles: number;
  images: number;
  hosts: string[];
};

async function measure(): Promise<Sample> {
  const start = performance.now();
  const response = await fetch(url!);
  const headersMs = performance.now() - start;
  const html = await response.text();
  const totalMs = performance.now() - start;
  assert.equal(response.status, 200);
  assert.ok(!html.includes('"digest"'), "Server rendering error in response");
  const articles = [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)];
  // Fallback skeletons have neither an image nor a streaming placeholder.
  const withContent = articles.filter(
    (match) => match[0].includes("<img") || match[0].includes("<template"),
  );
  const images = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(
    (match) => match[1]!,
  );
  assert.equal(
    withContent.length,
    expectedArticles,
    `Expected ${expectedArticles} rendered articles, found ${withContent.length}`,
  );
  return {
    headersMs,
    totalMs,
    decodedBytes: Buffer.byteLength(html),
    gzipBytes: gzipSync(html).byteLength,
    articles: withContent.length,
    images: images.length,
    hosts: [...new Set(images.map((src) => new URL(src).host))],
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return (
    (sorted[Math.floor((sorted.length - 1) / 2)]! +
      sorted[Math.floor(sorted.length / 2)]!) /
    2
  );
}

for (let i = 0; i < 3; i++) await measure();
const samples: Sample[] = [];
for (let i = 0; i < 15; i++) samples.push(await measure());

const report = {
  date: new Date().toISOString(),
  node: process.version,
  machine: `${platform()} ${arch()} ${cpus()[0]?.model}`,
  url,
  label,
  expectedArticles,
  scenario:
    "local next start, warm ranking cache, fixture with zero added delay",
  samples: samples.length,
  medianHeadersMs: median(samples.map((sample) => sample.headersMs)),
  medianTotalMs: median(samples.map((sample) => sample.totalMs)),
  p95TotalMs: [...samples]
    .map((sample) => sample.totalMs)
    .sort((a, b) => a - b)
    .at(Math.ceil(samples.length * 0.95) - 1),
  medianDecodedBytes: median(samples.map((sample) => sample.decodedBytes)),
  medianGzipBytes: median(samples.map((sample) => sample.gzipBytes)),
  articles: samples[0]!.articles,
  images: samples[0]!.images,
  hosts: samples[0]!.hosts,
  raw: samples,
};
const serialized = JSON.stringify(report, null, 2) + "\n";
if (outFile) await writeFile(outFile, serialized);
console.log(
  JSON.stringify(
    {
      ...report,
      raw: undefined,
    },
    null,
    2,
  ),
);
