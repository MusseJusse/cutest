function VoteFallbackPanel({ side }: { side: "home" | "away" }) {
  const isHome = side === "home";

  return (
    <article className="relative flex flex-col gap-3 overflow-hidden rounded-[10px] border border-broadcast-dim/25 bg-white/[0.04] p-4 pt-5">
      <span
        aria-hidden="true"
        className={
          isHome
            ? "absolute inset-x-0 top-0 h-1 bg-broadcast-home/60"
            : "absolute inset-x-0 top-0 h-1 bg-broadcast-away/60"
        }
      />
      <div className="h-3 w-28 rounded bg-white/10" />
      <div className="h-9 w-44 rounded bg-white/10 sm:h-10 sm:w-56" />
      <div className="grid min-h-44 place-items-center py-3">
        <div className="h-36 w-36 rounded-full bg-white/[0.07] sm:h-40 sm:w-40" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10" />
      <div className="h-11 w-full rounded-lg bg-white/10" />
    </article>
  );
}

export function VoteFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <VoteFallbackPanel side="home" />
        <div className="flex items-center justify-center py-1 sm:px-5 sm:py-0">
          <div className="h-9 w-14 rounded bg-broadcast-gold/30" />
        </div>
        <VoteFallbackPanel side="away" />
      </div>
      <div className="h-4 w-36 self-center rounded bg-white/[0.07]" />
    </div>
  );
}

export function ResultsFallback() {
  return (
    <div className="flex flex-col gap-4">
      <article className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-[10px] border border-broadcast-gold/35 bg-broadcast-gold/[0.06] p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="h-16 w-16 rounded bg-white/10 sm:h-20 sm:w-20" />
        <div>
          <div className="h-3 w-28 rounded bg-white/10" />
          <div className="mt-2 h-9 w-52 rounded bg-white/10" />
        </div>
        <div className="col-span-2 flex gap-6 sm:col-span-1">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <div className="h-2.5 w-10 rounded bg-white/10" />
              <div className="mt-1.5 h-6 w-14 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </article>
      <div className="flex items-center justify-between">
        <div className="h-9 w-24 rounded-md border border-broadcast-ink/25 bg-white/[0.03]" />
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="h-9 w-20 rounded-md border border-broadcast-ink/25 bg-white/[0.03]" />
      </div>
      <div className="grid gap-1.5">
        {Array.from({ length: 8 }, (_, row) => (
          <div
            key={row}
            className="grid grid-cols-[34px_44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-broadcast-dim/15 bg-white/[0.03] px-3 py-2.5 sm:grid-cols-[48px_56px_minmax(0,1fr)_96px_76px_76px_84px]"
          >
            <div className="h-3 w-5 rounded bg-white/10" />
            <div className="h-11 w-11 rounded bg-white/10" />
            <div className="h-6 w-32 rounded bg-white/10" />
            <div className="h-4 w-10 rounded bg-white/10" />
            <div className="hidden h-4 w-10 rounded bg-white/10 sm:block" />
            <div className="hidden h-4 w-10 rounded bg-white/10 sm:block" />
            <div className="hidden h-4 w-10 rounded bg-white/10 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
