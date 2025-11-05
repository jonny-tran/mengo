"use client";

import React from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbContextValue = {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  clear: () => void;
};

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(
  null
);

export function BreadcrumbProvider({
  children,
  initialItems = [],
}: {
  children: React.ReactNode;
  initialItems?: BreadcrumbItem[];
}) {
  const [items, setItemsState] = React.useState<BreadcrumbItem[]>(initialItems);

  const setItems = React.useCallback((next: BreadcrumbItem[]) => {
    setItemsState(next);
  }, []);

  const clear = React.useCallback(() => setItemsState([]), []);

  const value = React.useMemo(
    () => ({ items, setItems, clear }),
    [items, setItems, clear]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const ctx = React.useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return ctx;
}

// Optional helper for pages to set breadcrumb declaratively
export function BreadcrumbSetter({ items }: { items: BreadcrumbItem[] }) {
  const { setItems } = useBreadcrumb();
  React.useEffect(() => {
    setItems(items);
  }, [items, setItems]);
  return null;
}


