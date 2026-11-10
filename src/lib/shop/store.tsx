import { useNavigate } from "@tanstack/react-router";
import { cartSummary } from "./pricing";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { CategoryId } from "./categories";
import { products, productById, type Product } from "./products";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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
  register: (a: { name: string; email: string; phone: string; password: string }) => Promise<{ error: string | null; needsConfirm: boolean }>;
  login: (email: string, password: string) => Promise<string | null>;
  loginWithGoogle: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkout: () => void;
};

export type AuthTab = "login" | "register";
export type Account = { id: string; name: string; email: string; phone: string };

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
  const [hasAccount, setHasAccount] = useState(false);
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
    setHasAccount(read(ls, "sholok.hasAccount", false));
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
    if (user) {
      const has = wishlist.includes(id);
      void (has
        ? supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", id)
        : supabase.from("wishlist_items").upsert({ user_id: user.id, product_id: id }));
    }
  }, [user, wishlist]);

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
  const markAccount = () => { setHasAccount(true); write(window.localStorage, "sholok.hasAccount", true); };
  const loadUser = useCallback(async (u: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
    if (!u) { setUser(null); return; }
    markAccount();
    const { data: prof } = await supabase.from("profiles").select("full_name, phone").eq("id", u.id).maybeSingle();
    const meta = u.user_metadata ?? {};
    setUser({ id: u.id, email: u.email ?? "", name: (prof?.full_name || String(meta["full_name"] ?? meta["name"] ?? "") || (u.email ?? "").split("@")[0] || "Customer"), phone: prof?.phone ?? "" });
    // Merge this device's wishlist into the account, then load the saved list.
    const local = read<string[]>(window.localStorage, "sholok.wishlist", []);
    if (local.length) await supabase.from("wishlist_items").upsert(local.map((product_id) => ({ user_id: u.id, product_id })));
    const { data: saved } = await supabase.from("wishlist_items").select("product_id").eq("user_id", u.id);
    if (saved) setWishlist(saved.map((r) => r.product_id).filter((id) => !!productById(id)));
  }, []);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") setTimeout(() => void loadUser(session?.user ?? null), 0);
      if (event === "SIGNED_OUT") setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUser]);
  const refreshUser = useCallback(async () => { const { data } = await supabase.auth.getUser(); await loadUser(data.user); }, [loadUser]);

  const friendly = (m: string) => /invalid login/i.test(m) ? "Incorrect email or password. Please try again." : /not confirmed/i.test(m) ? "Please confirm your email first — check your inbox for the link." : /already registered/i.test(m) ? "An account with this email already exists. Please log in." : m;
  const register = async (a: { name: string; email: string; phone: string; password: string }) => {
    const { data, error } = await supabase.auth.signUp({ email: a.email.trim(), password: a.password, options: { emailRedirectTo: window.location.origin, data: { full_name: a.name.trim(), phone: a.phone.trim() } } });
    if (error) return { error: friendly(error.message), needsConfirm: false };
    if (data.user && data.user.identities?.length === 0) return { error: "An account with this email already exists. Please log in.", needsConfirm: false };
    markAccount();
    return { error: null, needsConfirm: !data.session };
  };
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? friendly(error.message) : null;
  };
  const loginWithGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    return r.error ? (r.error instanceof Error ? r.error.message : "Google sign-in failed. Please try again.") : null;
  };
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    return error ? error.message : null;
  };
  const logout = async () => { await supabase.auth.signOut(); setUser(null); setWishlist([]); toast("You have been logged out"); void navigate({ to: "/" }); };
  const checkout = () => {
    const step = checkoutAuthStep(!!user, hasAccount);
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
    user, hasAccount, authTab, openAuth, authReason, register, login, loginWithGoogle, resetPassword, logout, refreshUser, checkout,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
