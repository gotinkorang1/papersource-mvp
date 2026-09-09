"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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
      setSyncError(null);

      if (persist) {
        void addToCartAction({ variantId: product.variantId, quantity })
          .then((state) => {
            setCartLines(state.cartLines);
            setQuoteLines(state.quoteLines);
          })
          .catch((error) => {
            console.error("Could not persist the retail cart", error);
            setSyncError("Your cart could not be synced. Please try again.");
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
      setSyncError(null);

      if (persist) {
        void addToQuoteAction({ variantId: product.variantId, quantity })
          .then((state) => {
            setCartLines(state.cartLines);
            setQuoteLines(state.quoteLines);
          })
          .catch((error) => {
            console.error("Could not persist the quote basket", error);
            setSyncError("Your quote list could not be synced. Please try again.");
          });
      }
    },
    [persist],
  );

  const clearCart = useCallback(() => {
    setCartLines([]);
    setSyncError(null);
    if (persist) {
      void clearCartAction().then((state) => {
        setCartLines(state.cartLines);
        setQuoteLines(state.quoteLines);
      }).catch((error) => {
        console.error("Could not clear the retail cart", error);
        setSyncError("Your cart could not be cleared. Please try again.");
      });
    }
  }, [persist]);

  const clearQuote = useCallback(() => {
    setQuoteLines([]);
    setSyncError(null);
    if (persist) {
      void clearQuoteAction().then((state) => {
        setCartLines(state.cartLines);
        setQuoteLines(state.quoteLines);
      }).catch((error) => {
        console.error("Could not clear the quote basket", error);
        setSyncError("Your quote list could not be cleared. Please try again.");
      });
    }
  }, [persist]);

  const value = useMemo(
    () => ({
      cartLines,
      quoteLines,
      cartOpen,
      quoteOpen,
      syncError,
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
