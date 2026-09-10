"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { CurrencyUnit } from "@/types";

export type { CurrencyUnit };

const STORAGE_KEY = "purehop-currency";

type CurrencyContextValue = {
  unit: CurrencyUnit;
  setUnit: (u: CurrencyUnit) => void;
  ppp: boolean;
  setPpp: (v: boolean) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function isCurrencyUnit(value: unknown): value is CurrencyUnit {
  return value === "USD" || value === "EUR" || value === "LOCAL";
}

export function CurrencyProvider({ children }: { children: ReactNode }): ReactElement {
  const [unit, setUnitState] = useState<CurrencyUnit>("USD");
  const [ppp, setPppState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const rec = parsed as { unit?: unknown; ppp?: unknown };
          if (isCurrencyUnit(rec.unit)) setUnitState(rec.unit);
          if (typeof rec.ppp === "boolean") setPppState(rec.ppp);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unit, ppp }));
  }, [unit, ppp, hydrated]);

  const setUnit = useCallback((u: CurrencyUnit) => setUnitState(u), []);
  const setPpp = useCallback((v: boolean) => setPppState(v), []);

  const value = useMemo(
    () => ({ unit, setUnit, ppp, setPpp }),
    [unit, setUnit, ppp, setPpp],
  );

  return createElement(CurrencyContext.Provider, { value }, children);
}

export function useCurrencyToggle(): {
  unit: CurrencyUnit;
  setUnit: (u: CurrencyUnit) => void;
  ppp: boolean;
  setPpp: (v: boolean) => void;
} {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrencyToggle must be used within CurrencyProvider");
  return ctx;
}
