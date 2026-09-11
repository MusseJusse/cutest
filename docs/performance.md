# Performance measurements

Measured September 11, 2026 on an Apple M4, macOS arm64, Node 22.23.2,
Next.js 16.2.4. These are local measurements, not production performance claims.
No live database or deployment was accessed.

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| Pair selection CPU, median | 122.920667 µs | 0.021539 µs | 99.982477% less time |
| Cold catalogue source loading, median | 187.316458 ms | 0.988917 ms | 99.472061% less time |
| Results response, 50 ms simulated database delay, median | 158.390750 ms | 115.300083 ms | 27.205292% less time |
| Results response, zero added database delay, median | 103.259917 ms | 116.493855 ms | 12.816142% more time |
| Database commands across 30 warm results requests | 60 | 0 | 100% fewer commands |

The cache reduces database traffic, but does not universally reduce response time.
With the zero-delay fixture, cache handling and the changed streaming output cost
more than the database reads they replace. Keep this change separate until real
deployment latency confirms the tradeoff is useful. The two other improvements
can be adopted independently.

The decoded results response grew from 3,118,693 to 3,218,398 bytes, an increase
of 99,705 bytes or 3.197012%. This is decoded HTML and RSC data, not compressed
wire size. The full list of 1,025 entries remains in that comparison; pagination
was implemented later, in the interaction and delivery pass below.

## Branches

- `perf/pokemon-selection`: uniform pair selection without sorting the catalogue;
  focused tests and the CPU benchmark.
- `perf/local-catalogue`: bundled Pokémon species names and IDs, with a validated
  refresh script. Removes PokeAPI from application runtime.
- `perf/leaderboard-cache`: caches compact win/loss counter arrays. Includes the
  measured cache tradeoff described above.
- `perf/measured-improvements`: integrates the three changes, benchmark tooling,
  raw results, and UI options. This is the current working branch.

All branches are local. No PR, push, or deployment was performed. The selection
and catalogue subagents used separate worktrees; the root agent integrated and
measured the application. A separate subagent prepared the UI mocks and another
review pass checked cache navigation semantics.

## What the measurements include

The selection benchmark imports the actual changed helper and extracts the old
algorithm from baseline commit `f8d07ad1486192a4b8f262d51c20bb7fa23c03c9`.
Eleven alternating samples use warmup and a consumed checksum. It measures only
synchronous selection. The complete `getTwoPokemon()` path still includes
Next.js request handling and a catalogue array copy. See
[selection methodology](../benchmarks/selection.md) and
[raw selection samples](../benchmarks/selection-results.json).

Catalogue loading used 15 fresh Node processes per variant, alternating the
original public GraphQL fetch/decode/map with local JSON module loading and an
array copy. Process startup is excluded; OS disk cache was not controlled.
Every remote response matched all 1,025 local records. This measures cold source
loading, not warm-cache requests or page load. See
[raw catalogue samples](../benchmarks/catalogue-results.json).

The application benchmark compares the unchanged baseline with integrated source
at commit `c3d4d82`. Both use `next build --webpack` and `next start`, identical
dependencies, and a local REST database fixture containing deterministic counts.
The fixture accepts only MGET and rejects database mutations. The Vercel KV SDK
automatically pipelines the two MGET commands into one HTTP request.

Each scenario waits for cache expiry, warms both apps three times, then alternates
30 sequential requests per app. Measured samples fit within a single cache
interval. The median averages the middle two sorted samples; p95 uses nearest
rank. Total response time includes receiving the entire decoded response body.
Images, hydration, layout, LCP, INP, and vote interaction latency are not measured.
The 50 ms delay is deliberately simulated, not a measured production database RTT.
Operating-system activity was not controlled; subsequent runs will vary.

| Results scenario | Before p95 | After p95 |
| --- | ---: | ---: |
| Zero added database delay | 145.426833 ms | 146.456167 ms |
| 50 ms simulated database delay | 164.758917 ms | 117.735625 ms |

The harness verifies 1,025 ranked identities and their order in every response.
Raw HTML chunk boundaries differ because React streams some stat blocks through
temporary placeholders, so byte equality is not a valid rendering assertion.
See [all response timing samples and fixture counts](performance-results.json).

Two earlier cache approaches were measured and replaced. Caching the component
tree regressed the zero-delay median by 22.67%; caching expanded ranking objects
regressed it by 11.31%. The final code caches counter arrays. Differences between
the latter two runs are too small and noisy to claim another speedup. Raw
experiments are retained in [rendered cache](../benchmarks/rendered-cache-rejected.json)
and [ranking object cache](../benchmarks/ranking-data-cache-experiment.json).

## Freshness and verification

The counter cache uses `stale: 0`, `revalidate: 15`, `expire: 16`. Ordinary
`next/link` navigation requests the server snapshot. It does not poll while the
user stays on the page. Browser back/forward can restore an older view.

In the installed Next.js implementation, `stale: 0` excludes this cache entry
from runtime prefetching. The default local cache handler treats the 15-second
revalidation interval as expiration. Platform cache handlers can serve the old
snapshot between 15 and 16 seconds while refreshing. Cache reuse is subject to
the configured handler and instance lifetime.

The cache verification checks two commands on a cold request, no additional
commands for five warm requests, and two new commands after expiry. See
[verification counts](../benchmarks/cache-verification.json). TypeScript, ESLint,
the three focused selection tests, and both production builds passed.

A browser check also verified all 1,025 rendered scores, win rates, and records
against the fixture, with zero mismatches. Returning through the battle/results
links issued another results RSC request, confirming ordinary navigation checks
the server even when a snapshot was previously viewed.

## Reproduce

Install dependencies with `npx pnpm@8.15.6 install --frozen-lockfile`.
Node 22.23.2 can execute the typed harness scripts with
`--experimental-strip-types`. Run these source benchmarks from the integration
checkout:

```sh
node --test scripts/selection.test.mjs
node scripts/benchmark-selection.mjs f8d07ad1486192a4b8f262d51c20bb7fa23c03c9 benchmarks/selection-results.json
node scripts/benchmark-catalogue.mjs
```

For the app comparison, keep these three local processes in separate terminals.
The existing `../roundest-baseline` worktree is detached at the baseline commit;
if reproducing in a fresh checkout, create it first with
`git worktree add ../roundest-baseline f8d07ad` and install its dependencies.

Fixture, from the integration checkout:

```sh
node --experimental-strip-types scripts/performance/fixture-kv.ts
```

Baseline, from the baseline checkout:

```sh
KV_REST_API_URL=http://127.0.0.1:4310/baseline KV_REST_API_TOKEN=fixture npx pnpm build --webpack
KV_REST_API_URL=http://127.0.0.1:4310/baseline KV_REST_API_TOKEN=fixture npx pnpm start --hostname 127.0.0.1 --port 4311
```

Improved version, from the integration checkout:

```sh
KV_REST_API_URL=http://127.0.0.1:4310/optimized KV_REST_API_TOKEN=fixture npx pnpm build --webpack
KV_REST_API_URL=http://127.0.0.1:4310/optimized KV_REST_API_TOKEN=fixture npx pnpm start --hostname 127.0.0.1 --port 4312
```

Then run these sequentially from the integration checkout, with no browser or
other requests using the fixture:

```sh
node --experimental-strip-types scripts/performance/benchmark-results.ts
node --experimental-strip-types scripts/performance/verify-results-cache.ts
```

## Interaction and delivery pass

Measured September 11, 2026 on the same machine as the earlier runs. Baseline is
`c3d4d82` served from the `../roundest-preui` worktree on port 4313; integrated
is the current working tree on port 4314. Both are production builds backed by
the local fixture. Raw samples: [interaction results](../benchmarks/ui-interaction-results.json),
[bundle sizes](../benchmarks/bundle-js-results.json),
[image delivery](../benchmarks/image-delivery.json), and
[page responses](../benchmarks/results-page-baseline.json).

| Measurement | Baseline | Integrated | Change |
| --- | ---: | ---: | ---: |
| Vote click to visible next pair, median of 10 | 17.3 ms | 2.65 ms | 84.7% less |
| Results page decoded response, median | 3,219,532 B | 195,498 B | 93.9% less |
| Results page gzipped response, median | 106,372 B | 11,604 B | 89.1% less |
| Results response total time, median | 111.1 ms | 11.3 ms | 89.8% less |
| Results page DOM nodes | 16,463 | 876 | 94.7% less |
| Sprite requests per results view | 1,025 | 50 | 95.1% less |
| First-load JS `/`, uncompressed | 580,177 B | 550,804 B | 5.1% less |
| First-load JS `/results`, uncompressed | 558,947 B | 527,312 B | 5.7% less |

The click metric is local, where the baseline server action round trip is
already only about 17 ms. On a real network the baseline grows with RTT while
the optimistic path stays in single-digit milliseconds. A rapid-burst test
exposed an index-batching bug (synchronous clicks advanced past the queue and
unmounted the arena); the index now lives in a ref, and the burst test passes.

Pagination renders 50 entries per page: champion plus 49 challengers on page 1,
50 per page after that, and 25 on the final page. Every response still verifies
all 1,025 ranked identities and their order, and the counter cache behavior is
unchanged: two MGET commands cold, none over five warm requests, two after the
15-second expiry ([cache verification](../benchmarks/cache-verification.json)).

The sprite benchmark is more nuanced. Median delivery was effectively unchanged
(raw GitHub 17.3 ms vs jsDelivr 16.9 ms) and bytes are identical. The gains are
cache lifetime, from `max-age=300` to
`public, max-age=604800, s-maxage=43200` (2,016 times longer browser cache), and
tail behavior: across two runs the raw host showed a 228 ms p95 and a 65 ms max,
while jsDelivr stayed under 32 ms. Sprites also gained intrinsic `width` and
`height`, `decoding="async"`, and explicit priorities; the champion sprite is
eager with high priority instead of lazy.

Not changed: the win/loss key layout. Moving counters into one hash would shave
the cold path from two commands to one, but the 15-second cache already makes
warm requests free and migrating keys would risk existing production votes.

## Sprite hints and paint pass

Measured September 11, 2026 on the same machine. Before is commit `9b03128`
served from a `../roundest-prehints` worktree on port 4315; after is the current
working tree on port 4316. Both are production builds backed by the local
fixture with zero added delay. Raw samples:
[paired server responses](../benchmarks/hints-paired.json),
[page responses](../benchmarks/hints-home-before.json),
[browser measurements](../benchmarks/hints-browser.json). The page-response
medians below come from `benchmarks/hints-home-*.json` and
`benchmarks/hints-results-*.json`, one set per variant and route.

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| Homepage response, median of 30 alternating | 3.76 ms | 3.61 ms | within noise |
| Results response, median of 30 alternating | 10.42 ms | 10.50 ms | within noise |
| Homepage decoded response, median | 16,978 B | 17,173 B | 195 B more |
| Results decoded response, median | 195,498 B | 195,988 B | 490 B more |
| Results forced full-document layout, median | 3.50 ms | 1.15 ms | 67% less |
| Results DOM nodes | 877 | 878 | one more |
| Vote click to visible next pair, median of 10 | 2.65 ms | 2.65 ms | unchanged |

The changes: the current pair's sprites use `fetchpriority="high"` while the
hidden next-pair prefetch stays `low`; a `Link: <https://cdn.jsdelivr.net>;
rel=preconnect` response header plus a matching head link; and
`content-visibility: auto` on results challenger rows with
`contain-intrinsic-size: auto 65px` above the `sm` breakpoint and `auto 411px`
below it. The intrinsic sizes match the measured 91 px desktop and 437 px mobile
border-box row heights, and the document height is unchanged, so skipped
offscreen rows do not cause scrollbar jitter.

Honest limits. The preconnect could not be isolated locally because the shared
browser profile already had a warm HTTP/3 connection to the CDN. On this machine
results LCP is the headline text, not a sprite, so the priority hint does not
move LCP here; its expected benefit is cold, high-latency sprite fetches. The
layout probe is a forced full-document relayout, not a page-load trace, and
paint entries varied with tab focus. The extra decoded bytes are 0.25% of the
results response.

Reproduce with the fixture and both builds from the app-comparison section,
using ports 4315 and 4316 and distinct fixture paths, then run
`benchmark-page.ts` against both origins; the paired spreadsheet run alternated
the two origins request by request after three warmups.

## UI options artifact

[performance-ui-options.html](performance-ui-options.html) retains the A/B/C
mocks that preceded implementation. The measured numbers above supersede its
estimates for the chosen queue plus pagination option.
