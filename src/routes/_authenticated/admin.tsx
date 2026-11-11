import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/shop/config";
import { orderStatuses, updateOrderStatus } from "@/lib/shop/orders.functions";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Order Dashboard — Sholok Shopping" },
      { name: "description", content: "Review new Sholok Shopping orders and update their delivery status." },
      { property: "og:title", content: "Order Dashboard — Sholok Shopping" },
      { property: "og:description", content: "Admin order dashboard for Sholok Shopping." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Item = { name: string; qty: number; price: number };
type Addr = { recipient: string; phone: string; street: string; area: string; district: string; division: string };

function Admin() {
  const { user } = useShop();
  const qc = useQueryClient();
  const update = useServerFn(updateOrderStatus);
  const [filter, setFilter] = useState("all");
  const role = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" })).data === true,
  });
  const orders = useQuery({
    queryKey: ["admin-orders"],
    enabled: role.data === true,
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  if (!user || role.isLoading) return <main className="p-10 text-center text-muted-foreground">Loading…</main>;
  if (!role.data) return <main className="mx-auto max-w-md p-16 text-center"><h1 className="text-xl font-bold">Admins only</h1><p className="mt-2 text-sm text-muted-foreground">This account does not have access to the order dashboard.</p></main>;

  const list = (orders.data ?? []).filter((o) => filter === "all" || o.status === filter);
  const count = (s: string) => (orders.data ?? []).filter((o) => o.status === s).length;
  const change = async (id: string, status: string) => {
    try { await update({ data: { id, status } }); toast.success(`Order marked ${status}`); void qc.invalidateQueries({ queryKey: ["admin-orders"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Order Dashboard</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {["all", ...orderStatuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors hover:bg-sale hover:text-sale-foreground ${filter === s ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            {s}{s !== "all" && ` (${count(s)})`}
          </button>
        ))}
      </div>
      {orders.isLoading ? <p className="mt-6 text-muted-foreground">Loading orders…</p> : list.length === 0 ? <p className="mt-6 text-muted-foreground">No orders here yet.</p> : (
        <div className="mt-6 space-y-3">
          {list.map((o) => {
            const a = o.shipping_address as unknown as Addr;
            const items = o.items as unknown as Item[];
            return (
              <article key={o.id} className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-GB")} · {o.payment_method}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(Number(o.total))}</span>
                    <select aria-label="Status" value={o.status} onChange={(e) => void change(o.id, e.target.value)} className="h-9 rounded-full border bg-background px-3 text-sm capitalize">
                      {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <p><b>{a.recipient}</b> · {a.phone}<br />{a.street}, {a.area}, {a.district}, {a.division}</p>
                  <ul className="text-muted-foreground">{items.map((i, k) => <li key={k}>{i.name} × {i.qty}</li>)}</ul>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
