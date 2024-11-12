import { kv } from "@vercel/kv";
import { waitUntil } from "@vercel/functions";

export async function recordBattle(winner: number, loser: number) {
  const recordPromises = Promise.all([
    // Record battle
    kv.lpush(
      "battles:all",
      JSON.stringify({
        winner,
        loser,
        timestamp: Date.now(),
      }),
    ),

    // Increment win/loss counters
    kv.incr(`pokemon:${winner}:wins`),
    kv.incr(`pokemon:${loser}:losses`),
  ]);

  void waitUntil(recordPromises);
}
