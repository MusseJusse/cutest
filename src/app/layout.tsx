import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { DeferredToaster } from "~/components/ui/deferred-toaster";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cutest Pokémon",
  description: "Pick the cutest Pokémon and see how your favourites rank.",
  icons: [{ rel: "icon", url: "/poke-favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col justify-between bg-studio-paper font-sans text-studio-ink antialiased">
        <main className="flex-1">{children}</main>

        <DeferredToaster />
      </body>
    </html>
  );
}
