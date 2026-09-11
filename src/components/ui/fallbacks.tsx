function VoteFallbackPanel({ side }: { side: "home" | "away" }) {
  const isHome = side === "home";

  return (
    <article className="relative flex flex-col items-center justify-center gap-2 overflow-hidden border-0 border-broadcast-dim/25 px-2.5 pb-3 pt-4 sm:items-stretch sm:justify-start sm:gap-3 sm:rounded-[10px] sm:border sm:bg-white/[0.04] sm:p-4 sm:pt-5">
      <span
        aria-hidden="true"
        className={
          isHome
            ? "absolute inset-x-0 top-0 h-1 bg-broadcast-home/60"
            : "absolute inset-x-0 top-0 h-1 bg-broadcast-away/60"
        }
      />
      <div className="h-2.5 w-20 rounded bg-white/10 sm:h-3 sm:w-28" />
      <div className="h-6 w-32 rounded bg-white/10 sm:h-10 sm:w-56" />
      <div className="grid min-h-32 place-items-center py-2 sm:min-h-44 sm:py-3">
        <div className="h-28 w-28 rounded-full bg-white/[0.07] min-[400px]:h-32 min-[400px]:w-32 sm:h-40 sm:w-40" />
      </div>
      <div className="h-2.5 w-24 rounded bg-white/10 sm:hidden" />
      <div className="hidden h-1.5 w-full rounded-full bg-white/10 sm:block" />
      <div className="h-11 w-full rounded-lg bg-white/10" />
    </article>
  );
}

export function VoteFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative grid min-h-[440px] grid-cols-2 sm:min-h-0 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3">
        <VoteFallbackPanel side="home" />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-broadcast-dim/20 sm:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[44%] z-10 grid h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-broadcast-gold/60 bg-broadcast-night sm:hidden"
        >
          <div className="h-4 w-7 rounded bg-broadcast-gold/30" />
        </div>
        <div className="hidden sm:flex sm:items-center sm:justify-center sm:px-5">
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
