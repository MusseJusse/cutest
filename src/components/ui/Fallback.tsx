export function VoteFallback() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 sm:flex-row sm:gap-12">
      {[0, 1].map((index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="h-64 w-64 rounded bg-gray-600/40" />
          <div className="mt-4 flex flex-col items-center">
            <div className="mt-4 h-10 w-24 rounded-lg bg-gray-600/40" />
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
          className="flex items-center gap-6 rounded-lg bg-gray-100/20 p-6 shadow"
        >
          <div className="h-8 w-8 rounded bg-gray-600/40" />
          <div className="h-20 w-20 rounded bg-gray-600/40" />
          <div className="flex-grow">
            <div className="mb-2 h-4 w-16 rounded bg-gray-600/40" />
            <div className="h-6 w-24 rounded bg-gray-600/40" />
          </div>
          <div className="flex flex-col items-end">
            <div className="mb-2 h-8 w-16 rounded bg-gray-600/40" />
            <div className="mb-2 h-8 w-16 rounded bg-gray-600/40" />
            <div className="h-4 w-20 rounded bg-gray-600/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
