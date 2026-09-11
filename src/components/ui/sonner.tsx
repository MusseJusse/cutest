"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-broadcast-dim/30 group-[.toaster]:bg-[#0b1220] group-[.toaster]:text-broadcast-ink group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-broadcast-dim",
          actionButton:
            "group-[.toast]:bg-broadcast-gold group-[.toast]:font-bold group-[.toast]:text-[#0a0e18]",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-broadcast-ink",
          error: "group-[.toaster]:border-broadcast-home/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
