import assert from "node:assert/strict";
import test from "node:test";
import { selectTwoPokemon } from "./selection-source.mjs";

const catalogue = (length) =>
  Array.from({ length }, (_, index) => ({
    name: `pokemon-${index + 1}`,
    dexNumber: index + 1,
  }));

test("every ordered pair has exactly one equal-probability index combination", () => {
  const pokemon = Object.freeze(catalogue(5));
  const pairs = new Set();
  for (let first = 0; first < pokemon.length; first++) {
    for (let remaining = 0; remaining < pokemon.length - 1; remaining++) {
      const values = [
        (first + 0.5) / pokemon.length,
        (remaining + 0.5) / (pokemon.length - 1),
      ];
      let calls = 0;
      const pair = selectTwoPokemon(pokemon, () => values[calls++]);
      assert.equal(calls, 2);
      assert.notEqual(pair[0], pair[1]);
      assert.ok(pokemon.includes(pair[0]) && pokemon.includes(pair[1]));
      pairs.add(pair.map((item) => item.dexNumber).join(","));
    }
  }
  assert.equal(pairs.size, 20);
  assert.deepEqual(pokemon, catalogue(5));
});

test("random boundaries produce distinct pairs in a full catalogue", () => {
  const pokemon = catalogue(1025);
  assert.deepEqual(
    selectTwoPokemon(pokemon, () => 0),
    [pokemon[0], pokemon[1]],
  );
  assert.deepEqual(
    selectTwoPokemon(pokemon, () => 1 - Number.EPSILON),
    [pokemon[1024], pokemon[1023]],
  );
});

test("two entries always yield both, and smaller catalogues fail clearly", () => {
  const pokemon = catalogue(2);
  assert.deepEqual(
    selectTwoPokemon(pokemon, () => 0),
    pokemon,
  );
  assert.deepEqual(
    selectTwoPokemon(pokemon, () => 0.75),
    [...pokemon].reverse(),
  );
  assert.throws(() => selectTwoPokemon([]), RangeError);
  assert.throws(() => selectTwoPokemon(pokemon.slice(0, 1)), RangeError);
});
