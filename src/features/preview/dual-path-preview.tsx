"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addToCartAction, addToQuoteAction } from "@/features/preview/actions";
import type {
  CartLinePreview,
  ProductCardModel,
  QuoteLinePreview,
} from "@/types/catalogue";

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

function mergeCartLine(
  current: CartLinePreview[],
  product: ProductCardModel,
  quantity: number,
): CartLinePreview[] {
  const existing = current.find((line) => line.id === product.variantId);
  if (existing) {
    return current.map((line) =>
      line.id === product.variantId
        ? { ...line, quantity: line.quantity + quantity }
        : line,
    );
  }

  return [
    ...current,
    {
      id: product.variantId,
      name: product.name,
      specLine: product.specLine,
      quantity,
      unitPricePesewas: product.unitPricePesewas,
      unitLabel: product.unitLabel,
    },
  ];
}

function mergeQuoteLine(
  current: QuoteLinePreview[],
  product: ProductCardModel,
  quantity: number,
): QuoteLinePreview[] {
  const existing = current.find((line) => line.id === product.variantId);
  if (existing) {
    return current.map((line) =>
      line.id === product.variantId
        ? { ...line, quantity: line.quantity + quantity }
        : line,
    );
  }

  return [
    ...current,
    {
      id: product.variantId,
      name: product.name,
      sku: product.sku,
      specLine: product.specLine,
      quantity,
      unitPricePesewas: product.unitPricePesewas,
      unitLabel: product.unitLabel,
    },
  ];
}

export function DualPathPreviewProvider({
  children,
  persist = false,
  initialCartLines = [],
  initialQuoteLines = [],
}: {
  children: ReactNode;
  persist?: boolean;
  initialCartLines?: CartLinePreview[];
  initialQuoteLines?: QuoteLinePreview[];
}) {
  const [cartLines, setCartLines] = useState<CartLinePreview[]>(initialCartLines);
  const [quoteLines, setQuoteLines] = useState<QuoteLinePreview[]>(initialQuoteLines);
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

  const addToCart = useCallback(
    (product: ProductCardModel, quantity: number) => {
      setCartLines((current) => mergeCartLine(current, product, quantity));
      setQuoteOpen(false);
      setCartOpen(true);

      if (persist) {
        void addToCartAction({ variantId: product.variantId, quantity })
          .then((state) => {
            setCartLines(state.cartLines);
            setQuoteLines(state.quoteLines);
          })
          .catch((error) => {
            console.error("Could not persist the retail cart", error);
          });
      }
    },
    [persist],
  );

  const addToQuote = useCallback(
    (product: ProductCardModel, quantity: number) => {
      setQuoteLines((current) => mergeQuoteLine(current, product, quantity));
      setCartOpen(false);
      setQuoteOpen(true);

      if (persist) {
        void addToQuoteAction({ variantId: product.variantId, quantity })
          .then((state) => {
            setCartLines(state.cartLines);
            setQuoteLines(state.quoteLines);
          })
          .catch((error) => {
            console.error("Could not persist the quote basket", error);
          });
      }
    },
    [persist],
  );

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
