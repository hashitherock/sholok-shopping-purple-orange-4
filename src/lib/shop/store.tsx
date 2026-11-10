import { useNavigate } from "@tanstack/react-router";
import { cartSummary } from "./pricing";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { CategoryId } from "./categories";
import { products, productById, type Product } from "./products";

export type View = { type: "all" } | { type: "category"; id: CategoryId } | { type: "search"; query: string } | null;
type Dialog = "account" | "seller" | "cart" | "wishlist" | "location" | "offer" | "compare" | null;

type Ctx = {
  compare: string[];
  toggleCompare: (id: string) => void;
  cart: Record<string, number>;
  cartItems: { product: Product; qty: number }[];
  cartCount: number;
  cartTotal: number;
  addToCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  view: View;
  setView: (v: View) => void;
  lastSearch: string | null;
  submitSearch: (q: string) => void;
  clearSearchContext: () => void;
  seed: number;
  location: string | null;
  setLocation: (l: string) => void;
  dialog: Dialog;
  openDialog: (d: Dialog) => void;
  productId: string | null;
  openProduct: (id: string | null) => void;
  showCategory: (id: CategoryId) => void;
};

const ShopContext = createContext<Ctx | null>(null);

const read = <T,>(store: Storage | undefined, key: string, fallback: T): T => {
  try {
    const v = store?.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (store: Storage | undefined, key: string, value: unknown) => {
  try {
    store?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

export function scrollToId(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [compare, setCompare] = useState<string[]>([]);
  const [now, setNow] = useState(() => new Date("2026-01-01T00:00:00Z"));
  useEffect(() => { setNow(new Date()); const t = window.setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const toggleCompare = useCallback((id: string) => { setCompare((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]); setDialog("compare"); }, []);
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [view, setViewState] = useState<View>(null);
  const [lastSearch, setLastSearch] = useState<string | null>(null);
  const [seed, setSeed] = useState(1);
  const [location, setLocationState] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    const ls = window.localStorage;
    const ss = window.sessionStorage;
    setCart(read(ls, "sholok.cart", {}));
    setWishlist(read(ls, "sholok.wishlist", []));
    setLocationState(read(ls, "sholok.location", null));
    setLastSearch(read(ss, "sholok.lastSearch", null));
    let s = read<number | null>(ss, "sholok.seed", null);
    if (!s) {
      s = Math.floor(Math.random() * 1e9) + 1;
      write(ss, "sholok.seed", s);
    }
    setSeed(s);
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) write(window.localStorage, "sholok.cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) write(window.localStorage, "sholok.wishlist", wishlist); }, [wishlist, hydrated]);

  const addToCart = useCallback((id: string) => {
    const p = productById(id);
    if (!p || !p.inStock) return;
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    setProductId(null);
    setDialog("cart");
    toast.success("Added to cart", { description: p.name });
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) => {
      const n = { ...c };
      if (qty <= 0) delete n[id];
      else n[id] = Math.min(qty, 99);
      return n;
    });
  }, []);
  const removeFromCart = useCallback((id: string) => setQty(id, 0), [setQty]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((w) => {
      const has = w.includes(id);
      toast(has ? "Removed from wishlist" : "Saved to wishlist", { description: productById(id)?.name });
      return has ? w.filter((x) => x !== id) : [...w, id];
    });
  }, []);

  const setView = useCallback((v: View) => {
    setViewState(v);
    if (!v) { void navigate({ to: "/" }); return; }
    if (v.type === "category") void navigate({ to: "/category/$categoryId", params: { categoryId: v.id } });
    else if (v.type === "search") void navigate({ to: "/search", search: { q: v.query } });
    else void navigate({ to: "/shop" });
  }, [navigate]);

  const submitSearch = useCallback((q: string) => {
    const query = q.trim();
    if (!query) return;
    setLastSearch(query);
    write(window.sessionStorage, "sholok.lastSearch", query);
    setView({ type: "search", query });
  }, [setView]);

  const clearSearchContext = useCallback(() => {
    setLastSearch(null);
    try { window.sessionStorage.removeItem("sholok.lastSearch"); } catch { /* ignore */ }
    setViewState((v) => (v?.type === "search" ? null : v));
  }, []);

  const setLocation = useCallback((l: string) => {
    setLocationState(l);
    write(window.localStorage, "sholok.location", l);
  }, []);

  const showCategory = useCallback((id: CategoryId) => setView({ type: "category", id }), [setView]);

  const summary = useMemo(() => cartSummary(cart, products, now), [cart, now]);
  const cartItems = summary.items;
  const cartCount = summary.count;
  const cartTotal = summary.total;

  const value: Ctx = {
    compare, toggleCompare, cart, cartItems, cartCount, cartTotal, addToCart, setQty, removeFromCart,
    wishlist, toggleWishlist, view, setView, lastSearch, submitSearch, clearSearchContext, seed,
    location, setLocation, dialog, openDialog: setDialog, productId, openProduct: setProductId, showCategory,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
