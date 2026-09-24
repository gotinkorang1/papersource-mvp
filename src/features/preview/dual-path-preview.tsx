"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { addToCartAction, addToQuoteAction, clearCartAction, clearQuoteAction } from "@/features/preview/actions";
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
  syncError: string | null;
  clearSyncError: () => void;
  setCartOpen: (open: boolean) => void;
  setQuoteOpen: (open: boolean) => void;
  addToCart: (product: ProductCardModel, quantity: number) => void;
  addToQuote: (product: ProductCardModel, quantity: number) => void;
  clearCart: () => void;
  clearQuote: () => void;
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
  const [syncError, setSyncError] = useState<string | null>(null);
  const cartLinesRef = useRef(initialCartLines);
  const quoteLinesRef = useRef(initialQuoteLines);
  const syncRequestRef = useRef(0);
  const clearSyncError = useCallback(() => setSyncError(null), []);

  const replaceLines = useCallback((nextCartLines: CartLinePreview[], nextQuoteLines: QuoteLinePreview[]) => {
    cartLinesRef.current = nextCartLines;
    quoteLinesRef.current = nextQuoteLines;
    setCartLines(nextCartLines);
    setQuoteLines(nextQuoteLines);
  }, []);

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
      const nextCartLines = mergeCartLine(cartLinesRef.current, product, quantity);
      replaceLines(nextCartLines, quoteLinesRef.current);
      setQuoteOpen(false);
      setCartOpen(true);
      setSyncError(null);

      if (persist) {
        const requestId = ++syncRequestRef.current;
        void addToCartAction({ variantId: product.variantId, quantity })
          .then((state) => {
            if (requestId === syncRequestRef.current) replaceLines(state.cartLines, state.quoteLines);
          })
          .catch((error) => {
            console.error("Could not persist the retail cart", error);
            if (requestId === syncRequestRef.current) setSyncError("Your cart could not be synced. Please try again.");
          });
      }
    },
    [persist, replaceLines],
  );

  const addToQuote = useCallback(
    (product: ProductCardModel, quantity: number) => {
      const nextQuoteLines = mergeQuoteLine(quoteLinesRef.current, product, quantity);
      replaceLines(cartLinesRef.current, nextQuoteLines);
      setCartOpen(false);
      setQuoteOpen(true);
      setSyncError(null);

      if (persist) {
        const requestId = ++syncRequestRef.current;
        void addToQuoteAction({ variantId: product.variantId, quantity })
          .then((state) => {
            if (requestId === syncRequestRef.current) replaceLines(state.cartLines, state.quoteLines);
          })
          .catch((error) => {
            console.error("Could not persist the quote basket", error);
            if (requestId === syncRequestRef.current) setSyncError("Your quote list could not be synced. Please try again.");
          });
      }
    },
    [persist, replaceLines],
  );

  const clearCart = useCallback(() => {
    const previousCartLines = cartLinesRef.current;
    replaceLines([], quoteLinesRef.current);
    setSyncError(null);
    if (persist) {
      const requestId = ++syncRequestRef.current;
      void clearCartAction().then((state) => {
        if (requestId === syncRequestRef.current) replaceLines(state.cartLines, state.quoteLines);
      }).catch((error) => {
        console.error("Could not clear the retail cart", error);
        if (requestId === syncRequestRef.current) {
          replaceLines(previousCartLines, quoteLinesRef.current);
          setSyncError("Your cart could not be cleared. Please try again.");
        }
      });
    }
  }, [persist, replaceLines]);

  const clearQuote = useCallback(() => {
    const previousQuoteLines = quoteLinesRef.current;
    replaceLines(cartLinesRef.current, []);
    setSyncError(null);
    if (persist) {
      const requestId = ++syncRequestRef.current;
      void clearQuoteAction().then((state) => {
        if (requestId === syncRequestRef.current) replaceLines(state.cartLines, state.quoteLines);
      }).catch((error) => {
        console.error("Could not clear the quote basket", error);
        if (requestId === syncRequestRef.current) {
          replaceLines(cartLinesRef.current, previousQuoteLines);
          setSyncError("Your quote list could not be cleared. Please try again.");
        }
      });
    }
  }, [persist, replaceLines]);

  const value = useMemo(
    () => ({
      cartLines,
      quoteLines,
      cartOpen,
      quoteOpen,
      syncError,
      clearSyncError,
      setCartOpen: setCartOpenExclusive,
      setQuoteOpen: setQuoteOpenExclusive,
      addToCart,
      addToQuote,
      clearCart,
      clearQuote,
    }),
    [
      addToCart,
      addToQuote,
      clearCart,
      clearQuote,
      cartLines,
      cartOpen,
      quoteLines,
      quoteOpen,
      syncError,
      clearSyncError,
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
