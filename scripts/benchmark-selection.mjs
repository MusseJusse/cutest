import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { cpus, platform, release } from "node:os";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { selectTwoPokemon } from "./selection-source.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const baselineCommit =
  process.argv[2] ?? "f8d07ad1486192a4b8f262d51c20bb7fa23c03c9";
const baselineSource = execFileSync(
  "git",
  ["show", `${baselineCommit}:src/sdk/pokemon.ts`],
  {
    cwd: root,
    encoding: "utf8",
  },
);
const parsed = ts.createSourceFile(
  "pokemon.ts",
  baselineSource,
  ts.ScriptTarget.ES2022,
  true,
);
const declaration = parsed.statements.find(
  (statement) =>
    ts.isFunctionDeclaration(statement) &&
    statement.name?.text === "getTwoPokemon",
);
// Exclude await connection() and await getAllPokemon(), preserving the original selection statements.
const body = declaration.body.statements
  .slice(2)
  .map((statement) => statement.getText(parsed))
  .join("\n");
assertBaseline(body);
const { outputText } = ts.transpileModule(
  `export function baseline(allPokemon) { ${body} }`,
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  },
);
const { baseline } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const pokemon = Array.from({ length: 1025 }, (_, index) => ({
  name: `pokemon-${index + 1}`,
  dexNumber: index + 1,
}));
let checksum = 0;

function assertBaseline(source) {
  if (
    !source.includes("allPokemon.sort") ||
    !source.includes("shuffled.slice")
  ) {
    throw new Error(
      "Baseline source changed; inspect the extracted selection before benchmarking",
    );
  }
}

function run(select, iterations) {
  let sum = 0;
  const start = performance.now();
  for (let index = 0; index < iterations; index++) {
    const pair = select(pokemon);
    sum += pair[0].dexNumber + pair[1].dexNumber;
  }
  const duration = performance.now() - start;
  checksum += sum;
  return (duration * 1000) / iterations;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const beforeIterations = 3000;
const afterIterations = 1000000;
const samples = 11;
run(baseline, 1000);
run(selectTwoPokemon, 100000);
const before = [];
const after = [];
for (let sample = 0; sample < samples; sample++) {
  // Alternate execution order to reduce effects from temperature and background activity.
  if (sample % 2 === 0) {
    before.push(run(baseline, beforeIterations));
    after.push(run(selectTwoPokemon, afterIterations));
  } else {
    after.push(run(selectTwoPokemon, afterIterations));
    before.push(run(baseline, beforeIterations));
  }
}
const beforeMedian = median(before);
const afterMedian = median(after);
const helper = await readFile(
  new URL("../src/sdk/pokemon-pair.ts", import.meta.url),
);
const result = {
  measuredAt: new Date().toISOString(),
  node: process.version,
  platform: `${platform()} ${release()}`,
  cpu: cpus()[0].model,
  baselineCommit,
  helperSha256: createHash("sha256").update(helper).digest("hex"),
  catalogueSize: pokemon.length,
  samples,
  warmupIterations: { before: 1000, after: 100000 },
  iterationsPerSample: { before: beforeIterations, after: afterIterations },
  beforeMicrosecondsPerSelection: before,
  afterMicrosecondsPerSelection: after,
  beforeMedianMicroseconds: beforeMedian,
  afterMedianMicroseconds: afterMedian,
  savedMicroseconds: beforeMedian - afterMedian,
  percentReduction: (1 - afterMedian / beforeMedian) * 100,
  speedup: beforeMedian / afterMedian,
  checksum,
  scope:
    "Synchronous pair selection only; excludes catalogue fetch/cache, Next.js connection, rendering, browser and network work. Both use native Math.random. Baseline sorts the shared catalogue in place as in production.",
};
const json = JSON.stringify(result, null, 2) + "\n";
if (process.argv[3]) await writeFile(process.argv[3], json);
process.stdout.write(json);
