"use client";

import { PokemonPair } from "~/sdk/pokemon";
import { voteAction } from "./action";
import { useFormStatus } from "react-dom";
import { useState, useRef, useEffect } from "react";

export default function FormButton(props: {
  currentPair: PokemonPair;
  nextPair: PokemonPair;
  index: number;
}) {
  const { pending } = useFormStatus();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (error && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [error]);

  return (
    <>
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

      <dialog
        ref={dialogRef}
        className="rounded-lg p-4 backdrop:bg-gray-500/50"
        onClick={() => dialogRef.current?.close()}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">{error}</p>
          <button
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
