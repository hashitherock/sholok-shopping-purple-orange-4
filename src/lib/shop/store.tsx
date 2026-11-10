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
  user: Account | null;
  hasAccount: boolean;
  authTab: AuthTab;
  openAuth: (tab: AuthTab, reason?: string) => void;
  authReason: string | null;
  register: (a: { name: string; email: string; password: string }) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  checkout: () => void;
};

export type AuthTab = "login" | "register";
export type Account = { name: string; email: string };
type StoredAccount = Account & { password: string };

/** Checkout rule: signed-in shoppers proceed; known accounts are asked to log in; everyone else to register. */
export function checkoutAuthStep(signedIn: boolean, hasAccount: boolean): "proceed" | AuthTab {
  if (signedIn) return "proceed";
  return hasAccount ? "login" : "register";
}

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
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [user, setUser] = useState<Account | null>(null);
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [authReason, setAuthReason] = useState<string | null>(null);

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
    setAccounts(read(ls, "sholok.accounts", []));
    setUser(read(ls, "sholok.user", null));
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

  const openAuth = useCallback((tab: AuthTab, reason?: string) => { setAuthTab(tab); setAuthReason(reason ?? null); setDialog("account"); }, []);
  const signIn = (a: Account) => { setUser(a); write(window.localStorage, "sholok.user", a); };
  const register = (a: { name: string; email: string; password: string }) => {
    const email = a.email.trim().toLowerCase();
    if (accounts.some((x) => x.email === email)) return "An account with this email already exists. Please log in.";
    const next = [...accounts, { name: a.name.trim(), email, password: a.password }];
    setAccounts(next); write(window.localStorage, "sholok.accounts", next);
    signIn({ name: a.name.trim(), email });
    return null;
  };
  const login = (email: string, password: string) => {
    const acc = accounts.find((x) => x.email === email.trim().toLowerCase());
    if (!acc) return "No account found with this email. Please register first.";
    if (acc.password !== password) return "Incorrect password. Please try again.";
    signIn({ name: acc.name, email: acc.email });
    return null;
  };
  const logout = () => { setUser(null); try { window.localStorage.removeItem("sholok.user"); } catch { /* ignore */ } toast("You have been logged out"); };
  const checkout = () => {
    const step = checkoutAuthStep(!!user, accounts.length > 0);
    if (step === "login") openAuth("login", "Please log in to your account to continue to checkout.");
    else if (step === "register") openAuth("register", "Please create an account to continue to checkout.");
    else toast.success("Thank you! Your order request has been received.", { description: "Our team will contact you to confirm delivery." });
  };

  const summary = useMemo(() => cartSummary(cart, products, now), [cart, now]);
  const cartItems = summary.items;
  const cartCount = summary.count;
  const cartTotal = summary.total;

  const value: Ctx = {
    compare, toggleCompare, cart, cartItems, cartCount, cartTotal, addToCart, setQty, removeFromCart,
    wishlist, toggleWishlist, view, setView, lastSearch, submitSearch, clearSearchContext, seed,
    location, setLocation, dialog, openDialog: setDialog, productId, openProduct: setProductId, showCategory,
    user, hasAccount: accounts.length > 0, authTab, openAuth, authReason, register, login, logout, checkout,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
