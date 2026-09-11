# Roundest-Cache

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

Built to test server components and the "use cache" directive.

Performance changes, measured results, and reproduction commands are documented in
[docs/performance.md](docs/performance.md). The leaderboard caches vote counters
for 15 seconds, with a 16-second hard expiry. Ordinary link navigation checks the
server snapshot; browser back/forward can restore the previous view.

Votes advance through a client-side queue prepared on the server, so the next pair
appears immediately and the vote persists in the background. Results are paginated
at 50 entries per page, and sprites load from jsDelivr's CDN.

# Getting Started

- Run `pnpm install`
- Rename `.env.example` to `.env`
- Create Vercel KV
- Copy the .env.local code snippet into `.env`
- Create Upstash Ratelimit DB
- Copy the .env code snippet into `.env`
- Run `pnpm dev`

## Pokemon catalogue

The server imports the fixed National Dex catalogue from `src/data/pokemon.json`.
It contains IDs 1 through 1025 and uses species names, matching the original
PokeAPI GraphQL query. Client components import only the SDK's types.

Run `node scripts/refresh-pokemon.js` to refresh the catalogue from the public
PokeAPI endpoint, then review and commit the JSON diff. The script validates the
response and requires all 1025 unique IDs before replacing the file. Catalogue
changes take effect with the next app build; requests no longer fetch PokeAPI.
