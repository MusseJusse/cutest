"use client";

import { cn } from "~/lib/utils";

export default function VoteButton(props: {
  onVote: () => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={props.onVote}
      className={cn(
        "w-28 rounded-lg px-4 py-2 text-base font-semibold text-white transition sm:w-36 sm:px-8 sm:py-3 sm:text-lg",
        "bg-blue-500 hover:bg-blue-600",
        props.className,
      )}
    >
      {props.label ?? "Vote"}
    </button>
  );
}
