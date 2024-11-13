"use client";

import { PokemonPair } from "~/sdk/pokemon";
import { voteAction } from "~sdk/action";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

export default function FormButton(props: {
  currentPair: PokemonPair;
  nextPair: PokemonPair;
  index: number;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      formAction={async () => {
        try {
          await voteAction(props.currentPair, props.index, props.nextPair);
        } catch (e) {
          if (e instanceof Error) {
            // setError(e.message);
            toast.error("Rate limit exceeded");
          } else {
            toast.error("Something went wrong");
          }
        }
      }}
      disabled={pending}
      className={`w-24 rounded-lg px-4 py-2 text-base font-semibold text-white transition-colors sm:w-32 sm:px-8 sm:py-3 sm:text-lg ${
        pending ? "animate-pulse bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
      } disabled:opacity-40`}
    >
      {pending ? "Voting..." : "Vote"}
    </button>
  );
}
