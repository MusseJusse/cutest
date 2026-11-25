import type { RecentBattle } from "~/sdk/vote";

export default function RecentVotes({
  battles,
}: {
  battles: readonly RecentBattle[];
}) {
  if (battles.length === 0) return null;

  return (
    <section
      aria-label="Recent votes"
      className="flex flex-col items-center gap-2 pt-2 pb-5"
    >
      <h2 className="m-0 text-[11px] font-bold text-ring-muted">
        Recent votes
      </h2>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {battles.map((battle, index) => (
          <li
            key={`${battle.winner.dexNumber}-${battle.loser.dexNumber}-${index}`}
            className="rounded-full border-[1.5px] border-ring-ink bg-ring-paper px-3 py-1 text-xs font-bold text-ring-ink shadow-[0_2px_0_rgb(25_24_59/0.12)]"
          >
            <span className="capitalize">{battle.winner.name}</span>{" "}
            <span className="font-medium text-ring-muted">over</span>{" "}
            <span className="capitalize">{battle.loser.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
