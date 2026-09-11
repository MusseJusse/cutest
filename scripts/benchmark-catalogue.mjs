import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const directory = fileURLToPath(new URL("../", import.meta.url));
const shared = `import { createRequire } from 'node:module'; import assert from 'node:assert/strict'; const require = createRequire(import.meta.url); const started = performance.now();`;
const remote = `${shared}
const query = 'query GetAllPokemon { pokemon_v2_pokemon(where: {id: {_lte: 1025}}) { id pokemon_v2_pokemonspecy { name } } }';
const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({query}) });
assert.equal(response.status, 200);
const raw = await response.text();
const {data} = JSON.parse(raw);
const result = data.pokemon_v2_pokemon.map(p => ({name: p.pokemon_v2_pokemonspecy.name, dexNumber: p.id}));
const elapsed = performance.now() - started;
assert.deepEqual(result.sort((a,b) => a.dexNumber - b.dexNumber), require('./src/data/pokemon.json'));
console.log(JSON.stringify({elapsed, bytes: Buffer.byteLength(raw), count: result.length}));`;
const local = `${shared}
const result = [...require('./src/data/pokemon.json')];
const elapsed = performance.now() - started;
assert.equal(result.length, 1025);
assert(result.every((p,i) => p.dexNumber === i + 1));
console.log(JSON.stringify({elapsed, count: result.length}));`;
const samples = { remote: [], local: [] };
for (let index = 0; index < 15; index++) {
  for (const [label, code] of [
    ["remote", remote],
    ["local", local],
  ]) {
    const child = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", code],
      { cwd: directory, encoding: "utf8" },
    );
    if (child.status !== 0) throw new Error(child.stderr);
    samples[label].push(JSON.parse(child.stdout));
  }
}
function summary(values) {
  const sorted = values.map((v) => v.elapsed).sort((a, b) => a - b);
  return {
    n: sorted.length,
    medianMs: sorted[Math.floor(sorted.length / 2)],
    p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
    minMs: sorted[0],
    maxMs: sorted.at(-1),
  };
}
const output = {
  node: process.version,
  arch: process.arch,
  platform: process.platform,
  methodology:
    "15 independent Node processes per implementation, interleaved; process startup excluded. Remote fetch, JSON decode and map; local require JSON and array copy. OS disk cache uncontrolled. Asserted each remote result equals bundled catalogue.",
  remote: summary(samples.remote),
  local: summary(samples.local),
  samples,
};
output.medianReductionPercent =
  (1 - output.local.medianMs / output.remote.medianMs) * 100;
writeFileSync(
  new URL("../benchmarks/catalogue-results.json", import.meta.url),
  JSON.stringify(output, null, 2) + "\n",
);
console.log(JSON.stringify(output, null, 2));
