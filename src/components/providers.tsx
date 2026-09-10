"use client";

import type { ReactNode } from "react";
import { CurrencyProvider } from "@/hooks/use-currency-toggle";

export function Providers({ children }: { children: ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
