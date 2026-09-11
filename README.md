# Roundest-Cache

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

Built to test server components and the "use cache" directive.

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
