import type { CSSProperties } from "react";
import { getRecentBattles } from "~/sdk/vote";

const TICKER_LIMIT = 10;
const SECONDS_PER_ITEM = 6;

export default async function BattleTicker() {
  const battles = await getRecentBattles(TICKER_LIMIT);
  if (battles.length === 0) return null;

  return (
    <section
      aria-label="Recent battles"
      className="overflow-hidden border-y border-broadcast-dim/25 py-2.5"
    >
      <ul className="sr-only">
        {battles.map((battle, index) => (
          <li key={index}>
            {battle.winner.name} defeated {battle.loser.name}
          </li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="ticker-track"
        style={
          {
            "--ticker-duration": `${battles.length * SECONDS_PER_ITEM}s`,
          } as CSSProperties
        }
      >
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 gap-6 pr-6">
            {battles.map((battle, index) => (
              <span
                key={index}
                className="text-xs tracking-[0.05em] whitespace-nowrap text-broadcast-dim uppercase"
              >
                <b className="font-semibold text-broadcast-ink">
                  {battle.winner.name}
                </b>{" "}
                def. {battle.loser.name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
