"use client";

import { useFormStatus } from "react-dom";
import { voteAction } from "../../lib/action";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import type { PokemonPair } from "~/sdk/pokemon";

export default function VoteButton(props: {
  currentPair: PokemonPair;
  nextPair: PokemonPair;
  index: number;
  className?: string;
  label?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      formAction={async () => {
        try {
          await voteAction(props.currentPair, props.nextPair, props.index);
        } catch (e) {
          if (e instanceof Error) {
            toast.error("Rate limit exceeded");
          } else {
            toast.error("Something went wrong");
          }
        }
      }}
      disabled={pending}
      className={cn(
        "w-28 rounded-lg px-4 py-2 text-base font-semibold text-white transition sm:w-36 sm:px-8 sm:py-3 sm:text-lg",
        pending ? "animate-pulse bg-gray-600" : "bg-blue-500 hover:bg-blue-600",
        "disabled:opacity-50",
        props.className,
      )}
    >
      {pending ? (props.pendingLabel ?? "Voting...") : (props.label ?? "Vote")}
    </button>
  );
}
