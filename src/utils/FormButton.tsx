"use client";

import { PokemonPair } from "~/sdk/pokemon";
import { voteAction } from "./action";
import { useFormStatus } from "react-dom";
import { useState } from "react";

export default function FormButton(props: {
  currentPair: PokemonPair;
  nextPair: PokemonPair;
  index: number;
}) {
  const { pending } = useFormStatus();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        formAction={async () => {
          try {
            setError(null);
            await voteAction(props.currentPair, props.index, props.nextPair);
          } catch (e) {
            if (e instanceof Error) {
              setError(e.message);
            } else {
              setError("Something went wrong");
            }
          }
        }}
        disabled={pending}
        className={`w-24 rounded-lg px-4 py-2 text-base font-semibold text-white transition-colors sm:w-32 sm:px-8 sm:py-3 sm:text-lg ${
          pending
            ? "animate-pulse bg-gray-600"
            : "bg-blue-500 hover:bg-blue-600"
        } disabled:opacity-40`}
      >
        {pending ? "Voting..." : "Vote"}
      </button>
      {error && <p className="animate-fade-in text-sm text-red-500">{error}</p>}
    </div>
  );
}
