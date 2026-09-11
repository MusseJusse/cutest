import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = await readFile(
  new URL("../src/components/battle-arena.tsx", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
  },
});

const pair = (id) => [
  { name: `pokemon-${id}`, dexNumber: id },
  { name: `pokemon-${id + 1}`, dexNumber: id + 1 },
];

// Run the component's handlers with deferred renders and controlled server replies.
// Layout and effects are outside these queue tests.
function arena(initialPairs) {
  const slots = [];
  let cursor = 0;
  const votes = [];
  const requests = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value) => {
          slots[index] =
            typeof value === "function" ? value(slots[index]) : value;
        },
      ];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect() {
      // Queue handlers do not depend on animation effects.
    },
  };
  const jsx = (type, props) => ({ type, props });
  const modules = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "~/lib/action": {
      voteAction: (...args) => {
        votes.push(args);
        return Promise.resolve();
      },
      getMorePairsAction: (count) =>
        new Promise((resolve, reject) => {
          requests.push({ count, resolve, reject });
        }),
    },
    "~/lib/utils": { cn: () => "" },
    "./ui/pokemon-sprite": { default: "sprite" },
    "./ui/vote-button": { default: "button" },
  };
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require(name) {
      assert.ok(name in modules, `Unexpected import: ${name}`);
      return modules[name];
    },
  });
  function render() {
    cursor = 0;
    const tree = exports.default({ initialPairs, initialStats: {} });
    function findHome(node) {
      if (!node || typeof node !== "object") return;
      if (node.props?.side === "home") return node.props;
      for (const child of [node.props?.children].flat()) {
        const home = findHome(child);
        if (home) return home;
      }
    }
    return findHome(tree);
  }
  return {
    render,
    votes,
    requests,
    get pairs() {
      return slots[0];
    },
  };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

test("rapid clicks consume distinct pairs before a render and keep the final pair", () => {
  const pairs = Array.from({ length: 6 }, (_, index) => pair(index * 2));
  const app = arena(pairs);
  const { onVote } = app.render();
  for (let index = 0; index < 8; index++) onVote();
  assert.equal(app.votes.length, 5);
  app.votes.forEach(([current, next, pick], index) => {
    assert.equal(current, pairs[index]);
    assert.equal(next, pairs[index + 1]);
    assert.equal(pick, 0);
  });
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].count, 4);
  assert.equal(app.pairs.length, 1);
  assert.equal(app.render().pokemon, pairs[5][0]);
});

test("a pending refill preserves votes made since it started", async () => {
  const pairs = Array.from({ length: 6 }, (_, index) => pair(index * 2));
  const app = arena(pairs);
  const { onVote } = app.render();
  for (let index = 0; index < 4; index++) onVote();
  assert.equal(app.requests.length, 1);
  onVote();
  const more = [pair(20), pair(22), pair(24), pair(26)];
  app.requests[0].resolve({ pairs: more, stats: {} });
  await flush();
  assert.deepEqual([...app.pairs], [pairs[5], ...more]);
  // Even a handler from before the refill reads the latest queue.
  onVote();
  assert.equal(app.votes.at(-1)[0], pairs[5]);
  assert.equal(app.votes.at(-1)[1], more[0]);
  assert.equal(app.render().pokemon, more[0][0]);
});

test("failed refills can retry without losing the current pair", async () => {
  const pairs = [pair(0), pair(2)];
  const app = arena(pairs);
  const { onVote } = app.render();
  onVote();
  app.requests[0].reject(new Error("offline"));
  await flush();
  onVote();
  assert.equal(app.requests.length, 2);
  assert.equal(app.votes.length, 1);
  assert.equal(app.render().pokemon, pairs[1][0]);
  app.requests[1].resolve({ pairs: [pair(4)], stats: {} });
  await flush();
  onVote();
  assert.equal(app.votes.length, 2);
});

test("long sessions keep at most six pairs with the normal refill threshold", async () => {
  const app = arena(Array.from({ length: 6 }, (_, index) => pair(index * 2)));
  let handled = 0;
  for (let index = 0; index < 1000; index++) {
    app.render().onVote();
    if (app.requests.length > handled) {
      app.requests[handled++].resolve({
        pairs: Array.from({ length: 4 }, (_, offset) =>
          pair(20 + index * 8 + offset * 2),
        ),
        stats: {},
      });
      await flush();
    }
    assert.ok(app.pairs.length <= 6);
  }
  assert.equal(app.votes.length, 1000);
});
