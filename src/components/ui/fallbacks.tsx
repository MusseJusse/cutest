function VoteFallbackPanel({ side }: { side: "home" | "away" }) {
  return (
    <div
      className={`row-span-4 grid min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-3 p-3.5 sm:p-6 ${side === "home" ? "bg-studio-lavender" : "bg-studio-sky"}`}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="h-8 w-24 max-w-full rounded bg-studio-ink/10" />
        <div className="h-3 w-8 rounded bg-studio-ink/10" />
      </div>
      <div className="grid h-[170px] place-items-center sm:h-[220px]">
        <div className="h-20 w-20 rounded-full bg-studio-ink/5 sm:h-28 sm:w-28" />
      </div>
      <div className="h-3 w-20 rounded bg-studio-ink/10" />
      <div className="h-12 rounded-lg border border-studio-ink/15" />
    </div>
  );
}

export function VoteFallback() {
  return (
    <div role="status" aria-label="Loading Pokémon">
      <span className="sr-only">Loading Pokémon</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-2 gap-y-3 overflow-clip rounded-2xl"
      >
        <VoteFallbackPanel side="home" />
        <VoteFallbackPanel side="away" />
      </div>
    </div>
  );
}

export function ResultsFallback() {
  return (
    <div role="status" aria-label="Loading rankings">
      <span className="sr-only">Loading rankings</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-studio-lavender/70 p-3 sm:gap-6 sm:px-6 sm:py-2">
          <div className="grid h-28 w-28 shrink-0 place-items-center sm:h-36 sm:w-36">
            <div className="h-20 w-20 rounded-full bg-studio-ink/5" />
          </div>
          <div className="grid min-w-0 gap-3">
            <div className="h-3 w-16 rounded bg-studio-ink/10" />
            <div className="h-9 w-32 max-w-full rounded bg-studio-ink/10" />
            <div className="h-5 w-20 rounded bg-studio-ink/10" />
          </div>
        </div>
        <div className="flex h-11 items-center justify-between">
          <div className="h-3 w-20 rounded bg-studio-ink/10" />
          <div className="h-3 w-20 rounded bg-studio-ink/10" />
        </div>
        <div>
          {Array.from({ length: 8 }, (_, row) => (
            <div
              key={row}
              className="flex h-[61px] items-center gap-3 border-b border-studio-line px-1 sm:px-2"
            >
              <div className="h-3 w-6 rounded bg-studio-ink/10" />
              <div className="h-11 w-11 rounded bg-studio-ink/5" />
              <div className="h-4 w-24 rounded bg-studio-ink/10" />
              <div className="ml-auto h-4 w-10 rounded bg-studio-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
