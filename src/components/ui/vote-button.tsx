"use client";

export default function VoteButton({
  onVote,
  name,
}: {
  onVote: () => void;
  name: string;
}) {
  return (
    <button
      type="button"
      onClick={onVote}
      className="flex min-h-12 w-full items-center justify-between gap-2 rounded-lg border border-studio-ink/25 px-3 py-2.5 text-left text-xs font-medium hover:bg-studio-ink/5 motion-safe:transition-[background-color,transform] motion-safe:duration-150 motion-safe:active:scale-[0.96] sm:px-4 sm:text-sm"
    >
      <span className="min-w-0 break-words">
        Vote <span className="capitalize">{name}</span>
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="h-[1.2cap] w-[1.2cap] shrink-0"
      >
        <path
          d="M5 15 15 5M5 5h10v10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
