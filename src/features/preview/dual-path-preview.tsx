"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLinePreview, ProductCardModel, QuoteLinePreview } from "@/types/catalogue";

type DualPathPreview = {
  cartLines: CartLinePreview[];
  quoteLines: QuoteLinePreview[];
  cartOpen: boolean;
  quoteOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setQuoteOpen: (open: boolean) => void;
  addToCart: (product: ProductCardModel, quantity: number) => void;
  addToQuote: (product: ProductCardModel, quantity: number) => void;
};

const DualPathPreviewContext = createContext<DualPathPreview | null>(null);

export function DualPathPreviewProvider({ children }: { children: ReactNode }) {
  const [cartLines, setCartLines] = useState<CartLinePreview[]>([]);
  const [quoteLines, setQuoteLines] = useState<QuoteLinePreview[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const setCartOpenExclusive = useCallback((open: boolean) => {
    setCartOpen(open);
    if (open) {
      setQuoteOpen(false);
    }
  }, []);

  const setQuoteOpenExclusive = useCallback((open: boolean) => {
    setQuoteOpen(open);
    if (open) {
      setCartOpen(false);
    }
  }, []);

  const addToCart = useCallback((product: ProductCardModel, quantity: number) => {
    setCartLines((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.id === product.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          specLine: product.specLine,
          quantity,
          unitPricePesewas: product.unitPricePesewas,
          unitLabel: product.unitLabel,
        },
      ];
    });
    setQuoteOpen(false);
    setCartOpen(true);
  }, []);

  const addToQuote = useCallback((product: ProductCardModel, quantity: number) => {
    setQuoteLines((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.id === product.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          sku: product.slug.toUpperCase(),
          specLine: product.specLine,
          quantity,
          unitPricePesewas: product.unitPricePesewas,
          unitLabel: product.unitLabel,
        },
      ];
    });
    setCartOpen(false);
    setQuoteOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      cartLines,
      quoteLines,
      cartOpen,
      quoteOpen,
      setCartOpen: setCartOpenExclusive,
      setQuoteOpen: setQuoteOpenExclusive,
      addToCart,
      addToQuote,
    }),
    [
      addToCart,
      addToQuote,
      cartLines,
      cartOpen,
      quoteLines,
      quoteOpen,
      setCartOpenExclusive,
      setQuoteOpenExclusive,
    ],
  );

  return (
    <DualPathPreviewContext.Provider value={value}>
      <div className="flex min-h-full flex-1 flex-col" data-store-shell="">
        {children}
      </div>
    </DualPathPreviewContext.Provider>
  );
}

export function useOptionalDualPathPreview() {
  return useContext(DualPathPreviewContext);
}

export function useDualPathPreview() {
  const value = useOptionalDualPathPreview();

  if (!value) {
    throw new Error("useDualPathPreview must be used within DualPathPreviewProvider");
  }

  return value;
}
