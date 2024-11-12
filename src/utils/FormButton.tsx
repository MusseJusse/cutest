"use client";

import { PokemonPair } from "~/sdk/pokemon";
import { voteAction } from "./action";
import { useFormStatus } from "react-dom";

export default function FormButton(props: {
  currentPair: PokemonPair;
  nextPair: PokemonPair;
  index: number;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      formAction={() =>
        voteAction(props.currentPair, props.index, props.nextPair)
      }
      disabled={pending}
      className={`w-32 rounded-lg px-8 py-3 text-lg font-semibold text-white transition-colors ${
        pending ? "animate-pulse bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
      } disabled:opacity-40`}
    >
      {pending ? "Voting..." : "Vote"}
    </button>
  );
}
