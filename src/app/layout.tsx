import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "PureHop — Global Alcohol Bang-for-Buck Index",
  description:
    "Rank beers across countries by Cost per Liter of Pure Alcohol (CLPA). Find where pure ethanol is cheapest.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-muted">
          PureHop · CLPA = price ÷ (pack × volume × ABV). Drink responsibly.
        </footer>
      </body>
    </html>
  );
}
