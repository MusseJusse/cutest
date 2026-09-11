import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { DeferredToaster } from "~/components/ui/deferred-toaster";

export const metadata: Metadata = {
  title: "Roundest Cache",
  description:
    "Vote on which Pokémon is rounder and watch the live leaderboard.",
  icons: [{ rel: "icon", url: "/poke-favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex min-h-screen flex-col justify-between bg-broadcast-night font-sans text-broadcast-ink antialiased">
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <main className="flex-1">{children}</main>

        <DeferredToaster />
      </body>
    </html>
  );
}
