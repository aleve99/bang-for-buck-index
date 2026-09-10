import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { getCountries, getSearchCatalog } from "@/db/queries";

export const metadata: Metadata = {
  title: "PureHop — Global Alcohol Bang-for-Buck Index",
  description:
    "Rank beers across countries by Cost per Liter of Pure Alcohol (CLPA). Find where pure ethanol is cheapest.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [catalog, countryRows] = await Promise.all([getSearchCatalog(), getCountries()]);
  const countries = countryRows.map((c) => ({
    code: c.code,
    name: c.name,
    currencyCode: c.currencyCode,
  }));

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <Navbar catalog={catalog} countries={countries} />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-muted">
            PureHop · CLPA = price ÷ (pack × volume × ABV). Drink responsibly.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
