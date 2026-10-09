"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-studio-line group-[.toaster]:bg-studio-paper group-[.toaster]:text-studio-ink group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-studio-muted",
          actionButton:
            "group-[.toast]:bg-studio-accent group-[.toast]:font-bold group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-studio-lavender group-[.toast]:text-studio-ink",
          error: "group-[.toaster]:border-destructive/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
