# cutest

A cuteness contest for all 1,025 Pokémon. Two contenders enter, you pick the cuter one, and the winner climbs a live leaderboard. The UI plays it like a sports broadcast under the name Cuteness Super League, or CSL.

The project started as a Next.js App Router test bed for server components and the `"use cache"` directive, so the data path is deliberately small and the caching behavior is measured instead of guessed. Numbers and reproduction commands are in [docs/performance.md](docs/performance.md).

## How it works

The homepage shows a Home and Away contender. Voting is split in two:

- The client advances to the next pair from a queue the server prepared, so the next matchup appears immediately.
- A server action records the result in Redis in the background. If it fails, a toast offers a retry.

The queue starts with six pairs and refills four at a time once it drops below three. Pair selection is uniform over ordered pairs and never sorts or copies the catalogue.

The results page ranks every Pokémon by an Elo-style score, `wins * 0.3 + winRate * 0.7 - losses * 0.3`, displayed as points scaled by ten. Standings paginate at 50 rows, with the champion pinned above page one, and each row expands into full voting stats.

## Stack

- Next.js 16 App Router with `cacheComponents` enabled, React 19, and View Transitions.
- Server actions live in `src/lib/action.ts`. Every argument is validated against the bundled catalogue before it reaches Redis.
- Upstash Redis stores wins, losses, and a recent-battles list. Counter reads use `cacheLife({ stale: 0, revalidate: 15, expire: 16 })`.
- Tailwind CSS 4 with a custom broadcast theme.
- Sprites come from the PokeAPI sprites repository on `raw.githubusercontent.com`.

## Getting started

You need Node.js 22 and pnpm. The package manager is pinned to `pnpm@8.15.6`.

```sh
pnpm install
cp .env.example .env
```

Fill in one Redis credential pair in `.env`, either `KV_REST_API_URL` and `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Both pairs are optional at build time so CI can build without secrets, but Redis throws a descriptive error on first use if neither is set. Create a free Upstash Redis database if you don't have one.

Start the dev server with Turbopack:

```sh
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm check` | ESLint and `tsc --noEmit`, run before committing |
| `pnpm lint` / `pnpm typecheck` | The two checks on their own |
| `pnpm format:check` / `pnpm format:write` | Prettier |
| `node --test scripts/selection.test.mjs scripts/battle-queue.test.mjs` | Pair sampler and vote queue tests |

## Project layout

```
src/
  app/            routes: / (battle) and /results (standings)
  components/     broadcast UI, battle arena, ticker
  sdk/            catalogue, pair selection, Redis vote store
  lib/action.ts   server actions
  data/           bundled National Dex catalogue
next.config.ts    Content Security Policy and cache profiles
```

The `~/*` import alias maps to `src/*`.

## Pokémon catalogue

The server imports all 1,025 National Dex entries from `src/data/pokemon.json` as species names and IDs. Client components import only the SDK's types.

Refresh it with:

```sh
node scripts/refresh-pokemon.js
```

The script queries the public PokeAPI GraphQL endpoint, checks that every ID from 1 to 1025 appears exactly once, and only then replaces the file. Review and commit the diff. The catalogue is baked in at build time, so the running app never calls PokeAPI.

## Notes

- Any module that reads Redis credentials or talks to the datastore starts with `import "server-only"`.
- The CSP in `next.config.ts` is static on purpose. A nonce would force per-request rendering and break `cacheComponents`.
- `voteAction` input arrives from the network, so it is validated against the catalogue. A forged payload cannot record votes for entries the leaderboard has never heard of.
