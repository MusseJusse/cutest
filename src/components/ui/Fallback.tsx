export function VoteFallback() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center gap-8 sm:gap-12">
      {[1, 2].map((index) => (
        <div className="flex flex-col items-center gap-2 sm:gap-4" key={index}>
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/52427d467f3e3b22af3c9cefc807a7452196ccd7/sprites/pokemon/0.png"
            className="h-32 w-32 sm:h-64 sm:w-64"
          />
          <div className="text-center">
            <span className="text-base text-gray-600 sm:text-lg">#0</span>
            <h2 className="text-xl font-bold capitalize sm:text-2xl">
              Loading
            </h2>
            <form className="mt-2 sm:mt-4">
              <button className="w-24 animate-pulse rounded-lg bg-gray-600 px-4 py-2 text-base font-semibold text-white sm:w-32 sm:px-8 sm:py-3 sm:text-lg">
                Vote
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResultsFallback() {
  return (
    <div className="grid gap-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-6 rounded-lg bg-gray-100/40 p-6 shadow"
        >
          <div className="h-8 w-8 rounded bg-gray-600/40" />
          <div className="h-20 w-20 rounded bg-gray-600/40" />
          <div className="flex-grow">
            <div className="mb-2 h-4 w-16 rounded bg-gray-600/40" />
            <div className="h-6 w-32 rounded bg-gray-600/40" />
          </div>
          <div className="text-right">
            <div className="mb-2 h-8 w-16 rounded bg-gray-600/40" />
            <div className="h-4 w-24 rounded bg-gray-600/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
