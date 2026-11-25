import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Fredoka } from "next/font/google";
import { preconnect } from "react-dom";

const display = Fredoka({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-fredoka",
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
  preconnect("https://raw.githubusercontent.com");

  return (
    <html lang="en" className={`${GeistSans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col justify-between bg-ring-butter font-sans text-ring-ink antialiased">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
