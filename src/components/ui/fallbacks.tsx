export function VoteFallback() {
  return (
    <div className="relative grid gap-6 lg:grid-cols-2">
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 border border-white/20 bg-[#ffdc48] px-5 py-3 text-3xl font-black text-[#101014] lg:block">
        VS
      </div>
      {[0, 1].map((index) => (
        <article
          key={index}
          className="relative min-h-[520px] overflow-hidden border border-white/20 bg-white/[0.05] p-6"
        >
          <div className="flex h-full flex-col justify-between">
            <div
              className={
                index === 0 ? "lg:text-left" : "flex flex-col lg:items-end"
              }
            >
              <div className="h-3 w-16 bg-[#ff5d8f]/45" />
              <div className="mt-2 h-14 w-52 bg-white/15 sm:h-16 sm:w-72" />
            </div>
            <div className="my-6 grid min-h-80 place-items-center bg-[radial-gradient(circle,#31313b_0_2px,transparent_2px)] [background-size:18px_18px]">
              <div className="h-64 w-64 bg-white/10 sm:h-80 sm:w-80" />
            </div>
            <div className="h-10 w-28 bg-[#3ef3c6]/45 sm:h-12 sm:w-36" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function ResultsFallback() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-stretch">
        <article className="relative overflow-hidden border border-[#3ef3c6]/50 bg-white/[0.05] p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#3ef3c6]" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="h-3 w-28 bg-[#ff5d8f]/45" />
              <div className="mt-2 h-12 w-64 bg-white/15" />
            </div>
            <div className="h-4 w-12 bg-[#3ef3c6]/35" />
          </div>
          <div className="my-5 grid max-h-60 min-h-60 place-items-center overflow-hidden bg-[radial-gradient(circle,#31313b_0_2px,transparent_2px)] [background-size:18px_18px]">
            <div className="h-48 w-48 bg-white/10 sm:h-56 sm:w-56" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <div className="h-2 w-12 bg-white/20" />
                <div className="mt-2 h-6 w-16 bg-white/15" />
              </div>
            ))}
          </div>
        </article>

        <aside className="grid content-start border border-white/15 bg-white/[0.04] p-4">
          <div className="h-3 w-36 bg-white/20" />
          <div className="mt-4 grid gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <div className="h-2 w-16 bg-white/20" />
                <div className="mt-2 h-6 w-20 bg-white/15" />
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="grid content-start gap-3 xl:grid-cols-2">
        {Array.from({ length: 8 }, (_, index) => (
          <article
            key={index}
            className="grid items-center gap-4 border border-white/15 bg-white/[0.04] p-3 sm:grid-cols-[48px_72px_1fr_88px_88px_110px]"
          >
            <div className="h-6 w-8 bg-[#ff5d8f]/35" />
            <div className="h-16 w-16 bg-white/10" />
            <div />
            {Array.from({ length: 3 }, (_, statIndex) => (
              <div
                key={statIndex}
                className="border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <div className="h-2 w-10 bg-white/20" />
                <div className="mt-2 h-5 w-12 bg-white/15" />
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
