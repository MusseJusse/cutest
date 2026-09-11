"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(
  () => import("./sonner").then((module) => module.Toaster),
  { ssr: false },
);

export function DeferredToaster(props: React.ComponentProps<typeof Toaster>) {
  return <Toaster {...props} />;
}
