# AGENTS.md

Next.js 16 App Router project. Votes are recorded in Upstash Redis; the Pokémon catalogue is bundled JSON in `src/data/pokemon.json`.

## Commands

- `pnpm dev` starts the dev server with Turbopack.
- `pnpm check` runs ESLint and `tsc --noEmit`. Run this before committing.
- `pnpm lint` and `pnpm typecheck` run them separately.
- `pnpm build` produces a production build.
- `pnpm format:check` and `pnpm format:write` run Prettier.
- `node --test scripts/selection.test.mjs` checks the pair-selection sampler.

## Environment

Copy `.env.example` to `.env` and fill in one Redis credential pair: `KV_REST_API_URL` plus `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` plus `UPSTASH_REDIS_REST_TOKEN`. `src/env.js` declares both pairs as optional so CI can build without secrets. The Redis client throws a descriptive error on first use if neither pair is set.

## Conventions

- The `~/*` import alias maps to `src/*`.
- Do not add comments unless they explain a non-obvious decision.
- Server actions live in `src/lib/action.ts` and validate every argument through `src/sdk/pokemon.ts` before touching Redis. Keep it that way, since `voteAction` input comes from the network.
- Any module that reads Redis credentials or talks to the datastore starts with `import "server-only"`.
- The CSP in `next.config.ts` is static on purpose. Do not add a nonce. A nonce forces per-request rendering and breaks `cacheComponents` caching.
