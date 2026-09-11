# Pokémon selection benchmark

On Apple M4 with Node v22.23.2, selecting a pair from 1,025 entries took a median **122.920667 µs before** and **0.021539 µs after**. The measured saving was **122.899128 µs per pair**, or **99.982477% of the selection CPU time**. Raw samples and environment details are in [selection-results.json](./selection-results.json).

This saves about **0.123 ms per pair**. It is a microbenchmark of synchronous selection and does not measure page load, vote response, rendering, cache access, or network latency.

The script reads the original selection statements from Git commit `f8d07ad1486192a4b8f262d51c20bb7fa23c03c9` and imports the current TypeScript helper after transpilation. Both implementations use native `Math.random`. The baseline sorts the shared catalogue in place, matching its original behavior. The new implementation reads two indices and leaves the catalogue unchanged.

The run used 11 samples with alternating execution order. Before timing, the baseline ran 1,000 warmup iterations and the new implementation ran 100,000. Each timed sample contained 3,000 baseline selections or 1,000,000 new selections. A checksum consumes every selected pair. Application builds and application benchmarks had not started during this run. Other operating-system activity was not controlled, and subsequent runs will vary.

Reproduce from the branch with dependencies installed:

```sh
node --test scripts/selection.test.mjs
node scripts/benchmark-selection.mjs f8d07ad1486192a4b8f262d51c20bb7fa23c03c9 benchmarks/selection-results.json
```

The focused tests exhaust every index combination in a five-entry catalogue, verify that each ordered pair occurs exactly once, cover random-number boundaries and two-entry catalogues, and check rejection of undersized catalogues. The constant-time mapping removes random-sort bias as well as the full-array sort.
