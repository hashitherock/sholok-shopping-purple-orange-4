import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { computeOrder } from "@/lib/shop/checkout";
import { formatPrice } from "@/lib/shop/config";
import { placeOrder } from "@/lib/shop/orders.functions";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sholok Shopping" },
      { name: "description", content: "Choose your delivery address and place your Sholok Shopping order." },
      { property: "og:title", content: "Checkout — Sholok Shopping" },
      { property: "og:description", content: "Complete your Sholok Shopping order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { cart, clearCart } = useShop();
  const navigate = useNavigate();
  const place = useServerFn(placeOrder);
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await supabase.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at")).data ?? [],
  });
  const [addressId, setAddressId] = useState<string | null>(null);
  const chosen = addresses.find((a) => a.id === addressId) ?? addresses[0];
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [busy, setBusy] = useState(false);
  const o = useMemo(() => computeOrder(cart, chosen?.division ?? "", applied), [cart, chosen, applied]);

  const submit = async () => {
    if (!chosen) { toast.error("Please add a delivery address first."); return; }
    setBusy(true);
    try {
      const r = await place({ data: { cart, addressId: chosen.id, coupon: applied, payment: "cod" } });
      clearCart();
      toast.success(`Order ${r.order_number} placed!`, { description: `Pay ${formatPrice(r.total)} in cash when it arrives.` });
      void navigate({ to: "/account" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place the order.");
    } finally { setBusy(false); }
  };

  if (!o.items.length) return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Your cart is empty</h1>
      <Button asChild className="mt-6"><Link to="/">Continue shopping</Link></Button>
    </main>
  );

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">1. Delivery address</h2>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : addresses.length === 0 ? (
            <p className="text-sm">No saved address yet. <Link to="/account" className="font-semibold text-primary underline">Add one in My Account</Link>, then come back.</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label key={a.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${chosen?.id === a.id ? "border-primary bg-primary/5" : ""}`}>
                  <input type="radio" name="addr" checked={chosen?.id === a.id} onChange={() => setAddressId(a.id)} />
                  <span className="text-sm"><b>{a.recipient}</b> · {a.phone}<br />{a.street}, {a.area}, {a.district}, {a.division}</span>
                </label>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">2. Payment</h2>
          <label className="flex gap-3 rounded-xl border border-primary bg-primary/5 p-3 text-sm">
            <input type="radio" checked readOnly /> <span><b>Cash on Delivery</b> — pay when your order arrives.</span>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">Card, bKash and Nagad will be added soon.</p>
        </section>
      </div>
      <aside className="h-fit space-y-4 rounded-2xl border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="max-h-64 space-y-2 overflow-auto text-sm">
          {o.items.map((i) => (
            <li key={i.product.id} className="flex justify-between gap-2"><span className="line-clamp-1">{i.product.name} × {i.qty}</span><span>{formatPrice(i.product.sellingPrice * i.qty)}</span></li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="h-10 flex-1 rounded-full border bg-background px-4 text-sm" />
          <Button variant="outline" onClick={() => setApplied(code)}>Apply</Button>
        </div>
        {applied && o.couponError && <p className="text-xs text-destructive">{o.couponError}</p>}
        {applied && !o.couponError && o.discount > 0 && <p className="text-xs text-primary">Coupon applied!</p>}
        <dl className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{formatPrice(o.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Delivery {chosen ? (chosen.division === "Dhaka" ? "(inside Dhaka)" : "(outside Dhaka)") : ""}</dt><dd>{formatPrice(o.shipping)}</dd></div>
          <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{formatPrice(o.total)}</dd></div>
        </dl>
        <Button className="h-11 w-full font-semibold" disabled={busy || !chosen || !!(applied && o.couponError)} onClick={submit}>{busy ? "Placing order…" : "Place Order"}</Button>
      </aside>
    </main>
  );
}
