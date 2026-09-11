"use client";

import { cn } from "~/lib/utils";

const tones = {
  home: "bg-broadcast-home shadow-[0_5px_0_rgba(255,75,62,0.3)]",
  away: "bg-broadcast-away shadow-[0_5px_0_rgba(59,130,246,0.32)]",
} as const;

export default function VoteButton(props: {
  onVote: () => void;
  tone: keyof typeof tones;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={props.onVote}
      className={cn(
        "w-full rounded-lg px-4 py-2.5 font-display text-lg uppercase tracking-[0.06em] text-white",
        "transition duration-150 ease-out-strong",
        "hover:brightness-110 active:scale-[0.97]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-broadcast-ink",
        tones[props.tone],
        props.className,
      )}
    >
      {props.label ?? "Vote"}
    </button>
  );
}
