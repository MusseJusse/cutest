import { getRecentBattles } from "~/sdk/vote";

export default async function RecentVotes() {
  const battles = await getRecentBattles(3);
  if (battles.length === 0) return null;

  return (
    <section
      aria-label="Recent votes"
      className="flex flex-wrap gap-x-6 gap-y-2 py-5 text-[11px] text-studio-muted"
    >
      <h2 className="text-[11px] font-semibold text-studio-ink">
        Recent votes
      </h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {battles.map((battle, index) => (
          <li key={index} className="capitalize">
            {battle.winner.name} <span className="normal-case">over</span>{" "}
            {battle.loser.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
