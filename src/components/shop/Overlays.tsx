import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { deliveryAreas } from "@/lib/shop/delivery";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Heart, MapPin, Check, Store, BadgePercent, Truck, Users, Mail, Lock, UserRound, Eye, EyeOff, LogOut, ShieldCheck, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatPrice, isOfferActive, shopConfig } from "@/lib/shop/config";
import { productById } from "@/lib/shop/products";
import { useShop } from "@/lib/shop/store";
import { Price } from "./ProductCard";
import offerImg from "@/assets/banner-women.jpg";

export function CartDrawer() {
  const { dialog, openDialog, cartItems, setQty, removeFromCart, cartTotal, cartCount, checkout } = useShop();
  return (
    <Sheet open={dialog === "cart"} onOpenChange={(o) => openDialog(o ? "cart" : null)}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle>Your Cart ({cartCount})</SheetTitle>
          <SheetDescription>Review your items before checkout.</SheetDescription>
        </SheetHeader>
        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary"><ShoppingBag className="size-7" /></span>
            <p className="font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add something you love to get started.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {cartItems.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-3 py-4">
                  <img src={product.image} alt="" className="size-18 shrink-0 rounded-lg border border-border bg-surface object-contain p-1" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(product.sellingPrice)} each</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-border">
                        <Button variant="plain" onClick={() => setQty(product.id, qty - 1)} aria-label={`Decrease ${product.name}`} className="p-1.5 hover:bg-muted"><Minus className="size-3.5" /></Button>
                        <span className="w-7 text-center text-sm font-semibold">{qty}</span>
                        <Button variant="plain" onClick={() => setQty(product.id, qty + 1)} aria-label={`Increase ${product.name}`} className="p-1.5 hover:bg-muted"><Plus className="size-3.5" /></Button>
                      </div>
                      <span className="text-sm font-bold">{formatPrice(Math.round(qty * product.sellingPrice * 100) / 100)}</span>
                    </div>
                  </div>
                  <Button variant="plain" onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`} className="self-start p-1 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></Button>
                </li>
              ))}
            </ul>
            <div className="border-t border-border p-5">
              <div className="flex justify-between text-base font-bold"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
              <Button className="mt-4 h-11 w-full font-semibold" onClick={checkout}>Checkout</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function WishlistDrawer() {
  const { dialog, openDialog, wishlist, toggleWishlist, addToCart, openProduct } = useShop();
  const items = wishlist.map(productById).filter((p) => !!p);
  return (
    <Sheet open={dialog === "wishlist"} onOpenChange={(o) => openDialog(o ? "wishlist" : null)}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle>My Wishlist ({items.length})</SheetTitle>
          <SheetDescription>Log in to keep your wishlist on every device.</SheetDescription>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-sale-soft text-sale"><Heart className="size-7" /></span>
            <p className="font-semibold">No saved items yet</p>
            <p className="text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
            {items.map((p) => (
              <li key={p.id} className="flex gap-3 py-4">
                <Button variant="plain" onClick={() => { openDialog(null); openProduct(p.id); }} className="shrink-0"><img src={p.image} alt={p.name} className="size-18 rounded-full border border-border bg-surface object-contain p-1" /></Button>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                  <Price product={p} />
                  <div className="mt-1 flex gap-2">
                    <Button variant="plain" disabled={!p.inStock} onClick={() => addToCart(p.id)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">Add to Cart</Button>
                    <Button variant="plain" onClick={() => toggleWishlist(p.id)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-destructive hover:text-destructive">Remove</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function LocationDialog() {
  const { dialog, openDialog, location, setLocation } = useShop();
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const districts = division ? Object.keys(deliveryAreas[division] ?? {}) : [];
  const areas = deliveryAreas[division]?.[district] ?? [];
  return <Dialog open={dialog === "location"} onOpenChange={(o) => openDialog(o ? "location" : null)}>
    <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Choose your delivery location</DialogTitle><DialogDescription>Select your division, district and area{location ? ` · Current: ${location}` : ""}</DialogDescription></DialogHeader>
      <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); if (!area) return; setLocation(`${division} / ${district} / ${area}`); openDialog(null); }}>
        <label className="grid gap-1 text-sm font-medium">Division<select aria-label="Division" required value={division} onChange={(e) => { setDivision(e.target.value); setDistrict(""); setArea(""); }} className="h-11 rounded-md border border-input bg-surface px-3"><option value="">Select Division</option>{Object.keys(deliveryAreas).map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-medium">District<select aria-label="District" required disabled={!division} value={district} onChange={(e) => { setDistrict(e.target.value); setArea(""); }} className="h-11 rounded-md border border-input bg-surface px-3"><option value="">Select District</option>{districts.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-medium">Area<select aria-label="Area" required disabled={!district} value={area} onChange={(e) => setArea(e.target.value)} className="h-11 rounded-md border border-input bg-surface px-3"><option value="">Select Area</option>{areas.map((a) => <option key={a}>{a}</option>)}</select></label>
        <Button disabled={!area} type="submit">Confirm Location</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

const GOOGLE_SVG = '<path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>';
const FACEBOOK_SVG = '<path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/>';

function SocialButton({ provider, label }: { provider: "google" | "facebook"; label: string }) {
  const { loginWithGoogle } = useShop();
  return (
    <Button
      variant="plain"
      type="button"
      onClick={async () => {
        if (provider === "facebook") return toast("Facebook sign-in is not available yet", { description: "Please use Google or your email address." });
        const err = await loginWithGoogle();
        if (err) toast.error(err);
        return undefined;
      }}
      className="social-btn h-11 w-full gap-2.5 rounded-full px-3 text-sm font-medium"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" dangerouslySetInnerHTML={{ __html: provider === "google" ? GOOGLE_SVG : FACEBOOK_SVG }} />
      {label}
    </Button>
  );
}

function Field({ icon: Icon, label, type, name, autoComplete, minLength, onChange }: { icon: typeof Mail; label: string; type: string; name: string; autoComplete: string; minLength?: number; onChange?: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <span className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-4 size-4 text-muted-foreground" aria-hidden />
        <input
          name={name} type={isPw && show ? "text" : type} required autoComplete={autoComplete} minLength={minLength} onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={isPw ? "••••••••" : type === "email" ? "you@example.com" : type === "tel" ? "01XXXXXXXXX" : "Your full name"}
          className="h-12 w-full rounded-full border border-input bg-surface pl-11 pr-11 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        {isPw && (
          <Button variant="plain" type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 rounded-full p-1.5 text-muted-foreground hover:text-sale">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        )}
      </span>
    </label>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
      <span className="h-px flex-1 bg-border" />Or continue with<span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AccountDialog() {
  const { dialog, openDialog, authTab, openAuth, authReason, login, register, resetPassword, user, logout } = useShop();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);
  const [pw, setPw] = useState("");
  const strength = pw.length < 8 ? 0 : [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  const open = dialog === "account";
  useEffect(() => { if (open) { setError(null); setForgot(false); setSent(null); } }, [open, authTab]);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError(null);
    const err = await login(String(f.get("email")), String(f.get("password")));
    setBusy(false);
    if (err) return setError(err);
    toast.success("Welcome back!"); openDialog(authReason ? "cart" : null);
  };
  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!/^01[3-9]\d{8}$/.test(String(f.get("phone")).replace(/[\s-]/g, "").replace(/^\+?88/, ""))) return setError("Please enter a valid Bangladeshi phone number, e.g. 01712345678.");
    if (f.get("password") !== f.get("confirm")) return setError("Passwords do not match.");
    setBusy(true); setError(null);
    const r = await register({ name: String(f.get("name")), email: String(f.get("email")), phone: String(f.get("phone")), password: String(f.get("password")) });
    setBusy(false);
    if (r.error) return setError(r.error);
    if (r.needsConfirm) return setSent(`We've sent a confirmation link to ${String(f.get("email"))}. Open it to activate your account, then log in.`);
    toast.success("Your account has been created"); openDialog(authReason ? "cart" : null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => openDialog(o ? "account" : null)}>
      <DialogContent className="max-h-[92vh] max-w-[440px] overflow-y-auto rounded-3xl border-0 p-0 shadow-elegant sm:rounded-3xl">
        <div className="auth-hero px-7 pb-8 pt-7 text-primary-foreground">
          <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-primary-foreground/15 backdrop-blur"><ShieldCheck className="size-6" aria-hidden /></span>
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            {user ? `Hello, ${user.name.split(" ")[0]}` : sent ? "Check your email" : forgot ? "Reset your password" : authTab === "login" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-primary-foreground/80">
            {user ? user.email : forgot ? "Enter your email and we'll send you a reset link." : authReason ?? (authTab === "login" ? "Log in to track orders and save your favourites." : "Join SHOLOK and start shopping in seconds.")}
          </DialogDescription>
        </div>

        <div className="-mt-4 grid gap-5 rounded-t-3xl bg-background px-7 pb-7 pt-6">
          {user ? (
            <div className="grid gap-2.5">
              <Button asChild className="h-11"><Link to="/account" onClick={() => openDialog(null)}><UserRound /> My Account</Link></Button>
              <Button variant="outline" className="h-11" onClick={() => { void logout(); openDialog(null); }}><LogOut /> Log out</Button>
            </div>
          ) : sent ? (
            <div className="grid gap-4 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary"><Mail className="size-6" /></span><p className="text-sm">{sent}</p><Button variant="outline" onClick={() => { setSent(null); openAuth("login", authReason ?? undefined); }}>Back to Login</Button></div>
          ) : forgot ? (
            <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); const email = String(new FormData(e.currentTarget).get("email")); setBusy(true); const err = await resetPassword(email); setBusy(false); if (err) return setError(err); setForgot(false); setSent(`If an account exists for ${email}, a password reset link is on its way. Check your inbox.`); }}>
              <Field icon={Mail} label="Email Address" type="email" name="email" autoComplete="email" />
              {error && <p role="alert" className="rounded-2xl bg-sale-soft px-4 py-2.5 text-sm text-sale">{error}</p>}
              <Button type="submit" disabled={busy} className="h-12 font-semibold">{busy ? "Sending…" : "Send reset link"}</Button>
              <Button variant="link" type="button" onClick={() => setForgot(false)}>Back to Login</Button>
            </form>
          ) : (
            <>
              <div role="tablist" className="grid grid-cols-2 rounded-full bg-muted p-1">
                {(["login", "register"] as const).map((t) => (
                  <Button key={t} variant="plain" role="tab" aria-selected={authTab === t} onClick={() => openAuth(t, authReason ?? undefined)}
                    className={`h-9 rounded-full text-sm font-semibold transition ${authTab === t ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-sale"}`}>
                    {t === "login" ? "Login" : "Register"}
                  </Button>
                ))}
              </div>
              {authTab === "login" ? (
                <form key="login" className="grid gap-4" onSubmit={onLogin}>
                  <Field icon={Mail} label="Email Address" type="email" name="email" autoComplete="email" />
                  <Field icon={Lock} label="Password" type="password" name="password" autoComplete="current-password" />
                  <div className="-mt-2 flex items-center justify-between"><label className="flex items-center gap-2 text-xs"><input type="checkbox" name="remember" defaultChecked className="size-4 accent-primary" />Remember me</label><Button variant="link" type="button" className="h-auto p-0 text-xs" onClick={() => setForgot(true)}>Forgot password?</Button></div>
                  {error && <p role="alert" className="rounded-2xl bg-sale-soft px-4 py-2.5 text-sm text-sale">{error}</p>}
                  <Button type="submit" disabled={busy} className="h-12 font-semibold">{busy ? "Logging in…" : "Login"}</Button>
                  <Divider />
                  <div className="grid gap-2.5">
                    <SocialButton provider="google" label="Login With Google" />
                    <SocialButton provider="facebook" label="Login With Facebook" />
                  </div>
                </form>
              ) : (
                <form key="register" className="grid gap-4" onSubmit={onRegister}>
                  <Field icon={UserRound} label="Full Name" type="text" name="name" autoComplete="name" />
                  <Field icon={Mail} label="Email Address" type="email" name="email" autoComplete="email" />
                  <Field icon={Phone} label="Phone Number" type="tel" name="phone" autoComplete="tel" />
                  <Field icon={Lock} label="Password" type="password" name="password" autoComplete="new-password" minLength={8} onChange={setPw} />
                  <div className="-mt-2 grid gap-1"><div className="grid grid-cols-4 gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 rounded-full ${i <= strength ? (strength >= 3 ? "bg-primary" : "bg-sale") : "bg-muted"}`} />)}</div><span className="text-xs text-muted-foreground">Password strength: {["Too short", "Weak", "Fair", "Good", "Strong"][strength]}</span></div>
                  <Field icon={Lock} label="Confirm Password" type="password" name="confirm" autoComplete="new-password" minLength={8} />
                  <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="terms" required className="mt-0.5 size-4 accent-primary" />I agree to the Terms & Conditions and Privacy Policy</label>
                  {error && <p role="alert" className="rounded-2xl bg-sale-soft px-4 py-2.5 text-sm text-sale">{error}</p>}
                  <Button type="submit" disabled={busy} className="h-12 font-semibold">{busy ? "Creating account…" : "Register"}</Button>
                  <Divider />
                  <div className="grid gap-2.5">
                    <SocialButton provider="google" label="Sign Up With Google" />
                    <SocialButton provider="facebook" label="Sign Up With Facebook" />
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SellerDialog() {
  const { dialog, openDialog } = useShop();
  const perks = [
    { icon: Users, title: "Reach more shoppers", text: "Showcase your products to customers across Bangladesh." },
    { icon: Truck, title: "Simple fulfilment", text: "Tools to help you manage orders and delivery." },
    { icon: BadgePercent, title: "Grow with campaigns", text: "Join seasonal promotions and flash sales." },
  ];
  return (
    <Dialog open={dialog === "seller"} onOpenChange={(o) => openDialog(o ? "seller" : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <span className="mb-1 grid size-12 place-items-center rounded-full bg-primary-soft text-primary"><Store className="size-6" /></span>
          <DialogTitle className="text-2xl">Sell on Sholok</DialogTitle>
          <DialogDescription>Bring your brand to a growing community of shoppers.</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-3">
          {perks.map((p) => (
            <li key={p.title} className="flex gap-3 rounded-lg border border-border p-3">
              <p.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div><p className="text-sm font-semibold">{p.title}</p><p className="text-sm text-muted-foreground">{p.text}</p></div>
            </li>
          ))}
        </ul>
        <p className="rounded-lg bg-sale-soft p-3 text-sm">Seller registration opens soon. We will notify you as soon as applications open.</p>
      </DialogContent>
    </Dialog>
  );
}

export function OfferPopup() {
  const { dialog, openDialog, setView } = useShop();
  useEffect(() => {
    if (!isOfferActive()) return;
    let seen = false;
    try { seen = window.sessionStorage.getItem("sholok.offerSeen") === "1"; } catch { /* ignore */ }
    if (seen) return;
    const t = window.setTimeout(() => {
      // Do not interrupt a shopping interaction or another open panel.
      if (dialog) return;
      openDialog("offer");
      try { window.sessionStorage.setItem("sholok.offerSeen", "1"); } catch { /* ignore */ }
    }, 2500);
    return () => window.clearTimeout(t);
  }, [openDialog, dialog]);

  const o = shopConfig.offer;
  const active = isOfferActive();
  return (
    <Dialog open={dialog === "offer"} onOpenChange={(v) => openDialog(v ? "offer" : null)}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 sm:rounded-2xl">
        <div className="grid sm:grid-cols-2">
          <div className="relative h-48 sm:h-auto">
            <img src={offerImg} alt="" className="absolute inset-0 size-full object-cover object-right" />
            {active && <span className="absolute left-4 top-4 rounded-md bg-sale px-3 py-1 text-sm font-bold text-sale-foreground">{o.badge}</span>}
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-sale">Sholok Offer</span>
            <DialogTitle className="text-2xl font-extrabold text-primary-deep">{active ? o.headline : "No active offers"}</DialogTitle>
            <DialogDescription className="text-sm text-foreground/75">{active ? o.copy : "There are no offers running right now. Check back soon!"}</DialogDescription>
            {active && (
              <Button variant="plain" onClick={() => { openDialog(null); setView({ type: "all" }); }} className="mt-2 h-11 rounded-full bg-sale px-6 font-semibold text-sale-foreground hover:bg-sale/90">{o.cta}</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
