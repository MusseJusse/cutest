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
      className="flex items-center gap-2 pt-0.5 pb-2 sm:flex-col sm:pt-2 sm:pb-5"
    >
      <h2 className="m-0 shrink-0 text-[11px] font-bold text-ring-muted">
        Recent<span className="hidden sm:inline"> votes</span>
      </h2>
      <ul className="flex [scrollbar-width:none] flex-nowrap items-center gap-1.5 overflow-x-auto [mask-image:linear-gradient(to_right,black_88%,transparent)] pr-4 pb-0.5 sm:flex-wrap sm:justify-center sm:gap-2 sm:overflow-visible sm:[mask-image:none] sm:pr-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {battles.map((battle, index) => (
          <li
            key={`${battle.winner.dexNumber}-${battle.loser.dexNumber}-${index}`}
            className="shrink-0 rounded-full border-[1.5px] border-ring-ink bg-ring-paper px-3 py-1 text-xs font-bold whitespace-nowrap text-ring-ink shadow-[0_2px_0_rgb(25_24_59/0.12)]"
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
