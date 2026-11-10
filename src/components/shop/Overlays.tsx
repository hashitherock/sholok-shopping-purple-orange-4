import { Button } from "@/components/ui/button";
import { deliveryAreas } from "@/lib/shop/delivery";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Heart, MapPin, Check, Store, BadgePercent, Truck, Users } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, isOfferActive, shopConfig } from "@/lib/shop/config";
import { productById } from "@/lib/shop/products";
import { useShop } from "@/lib/shop/store";
import { Price } from "./ProductCard";
import offerImg from "@/assets/banner-women.jpg";

export function CartDrawer() {
  const { dialog, openDialog, cartItems, setQty, removeFromCart, cartTotal, cartCount } = useShop();
  return (
    <Sheet open={dialog === "cart"} onOpenChange={(o) => openDialog(o ? "cart" : null)}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle>Your Cart ({cartCount})</SheetTitle>
          <SheetDescription>Demo cart — items are saved on this device only.</SheetDescription>
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
              <Button variant="plain" disabled className="mt-4 h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground opacity-60">Checkout</Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">Checkout isn't available in this demo yet.</p>
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
          <SheetDescription>Saved on this device only.</SheetDescription>
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
                <Button variant="plain" onClick={() => { openDialog(null); openProduct(p.id); }} className="shrink-0"><img src={p.image} alt={p.name} className="size-18 rounded-lg border border-border bg-surface object-contain p-1" /></Button>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                  <Price product={p} />
                  <div className="mt-1 flex gap-2">
                    <Button variant="plain" disabled={!p.inStock} onClick={() => addToCart(p.id)} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">Add to Cart</Button>
                    <Button variant="plain" onClick={() => toggleWishlist(p.id)} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:border-destructive hover:text-destructive">Remove</Button>
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
    <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Choose your delivery location</DialogTitle><DialogDescription>Sample delivery areas{location ? ` · Current: ${location}` : ""}</DialogDescription></DialogHeader>
      <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); if (!area) return; setLocation(`${division} / ${district} / ${area}`); openDialog(null); }}>
        <label className="grid gap-1 text-sm font-medium">Division<select aria-label="Division" required value={division} onChange={(e) => { setDivision(e.target.value); setDistrict(""); setArea(""); }} className="h-11 rounded-md border border-input bg-surface px-3"><option value="">Select Division</option>{Object.keys(deliveryAreas).map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-medium">District<select aria-label="District" required disabled={!division} value={district} onChange={(e) => { setDistrict(e.target.value); setArea(""); }} className="h-11 rounded-md border border-input bg-surface px-3"><option value="">Select District</option>{districts.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-medium">Area<select aria-label="Area" required disabled={!district} value={area} onChange={(e) => setArea(e.target.value)} className="h-11 rounded-md border border-input bg-surface px-3"><option value="">Select Area</option>{areas.map((a) => <option key={a}>{a}</option>)}</select></label>
        <Button disabled={!area} type="submit">Confirm Location</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

function DemoForm({ fields, cta, note }: { fields: { label: string; type: string }[]; cta: string; note: string }) {
  const [sent, setSent] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-3 pt-2">
      {fields.map((f) => (
        <label key={f.label} className="grid gap-1 text-sm font-medium">
          {f.label}
          <input type={f.type} required className="h-10 rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:border-primary" />
        </label>
      ))}
      <Button variant="plain" className="h-11 rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-primary-deep">{cta}</Button>
      {sent && <p role="status" className="rounded-lg bg-primary-soft p-3 text-sm text-primary-deep">{note}</p>}
    </form>
  );
}

export function AccountDialog() {
  const { dialog, openDialog } = useShop();
  const note = "Accounts aren't available in this demo yet — nothing was saved or sent.";
  return (
    <Dialog open={dialog === "account"} onOpenChange={(o) => openDialog(o ? "account" : null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Sholok</DialogTitle>
          <DialogDescription>Sign in to track orders and save favourites (demo).</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="login">Login</TabsTrigger><TabsTrigger value="register">Register</TabsTrigger></TabsList>
          <TabsContent value="login"><DemoForm fields={[{ label: "Email or phone", type: "text" }, { label: "Password", type: "password" }]} cta="Login" note={note} /></TabsContent>
          <TabsContent value="register"><DemoForm fields={[{ label: "Full name", type: "text" }, { label: "Email", type: "email" }, { label: "Password", type: "password" }]} cta="Create account" note={note} /></TabsContent>
        </Tabs>
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
        <p className="rounded-lg bg-sale-soft p-3 text-sm">Seller registration opens soon. This is a preview — no application is submitted.</p>
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
