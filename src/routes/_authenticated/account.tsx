import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, LogOut, MapPin, Package, Pencil, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { deliveryAreas } from "@/lib/shop/delivery";
import { formatPrice } from "@/lib/shop/config";
import { productById } from "@/lib/shop/products";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — Sholok Shopping" },
      { name: "description", content: "Manage your profile, delivery addresses, orders and wishlist on Sholok Shopping." },
      { property: "og:title", content: "My Account — Sholok Shopping" },
      { property: "og:description", content: "Your Sholok profile, addresses, orders and wishlist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

type Tab = "profile" | "addresses" | "orders" | "wishlist";
const input = "h-11 w-full rounded-full border border-input bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

function AccountPage() {
  const { user, logout } = useShop();
  const [tab, setTab] = useState<Tab>("profile");
  const tabs = [
    { id: "profile" as const, label: "Profile", icon: UserRound },
    { id: "addresses" as const, label: "Addresses", icon: MapPin },
    { id: "orders" as const, label: "My Orders", icon: Package },
    { id: "wishlist" as const, label: "Wishlist", icon: Heart },
  ];
  return (
    <main className="container-shop py-8">
      <div className="auth-hero mb-6 rounded-3xl px-6 py-7 text-primary-foreground">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">My Account</p>
        <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">Hello, {user?.name.split(" ")[0] ?? "there"}</h1>
        <p className="text-sm opacity-85">{user?.email}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col" aria-label="Account sections">
          {tabs.map((t) => (
            <Button key={t.id} variant="plain" onClick={() => setTab(t.id)} aria-current={tab === t.id}
              className={`shrink-0 justify-start gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-sale hover:text-sale-foreground"}`}>
              <t.icon className="size-4" />{t.label}
            </Button>
          ))}
          <Button variant="plain" onClick={() => void logout()} className="shrink-0 justify-start gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-sale hover:bg-sale hover:text-sale-foreground"><LogOut className="size-4" />Log out</Button>
        </nav>
        <section className="min-w-0 rounded-3xl border border-border bg-surface p-5 md:p-7">
          {tab === "profile" && <Profile />}
          {tab === "addresses" && <Addresses />}
          {tab === "orders" && <Orders />}
          {tab === "wishlist" && <Wishlist />}
        </section>
      </div>
    </main>
  );
}

function Profile() {
  const { user, refreshUser } = useShop();
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const phone = String(f.get("phone")).trim();
    if (phone && !/^(\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) return toast.error("Please enter a valid Bangladeshi phone number.");
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: String(f.get("name")).trim(), phone, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) return toast.error("Could not save your profile. Please try again.");
    await refreshUser();
    toast.success("Profile updated");
    return undefined;
  };
  return (
    <form onSubmit={save} className="grid max-w-lg gap-4">
      <h2 className="text-xl font-bold">Profile details</h2>
      <label className="grid gap-1.5 text-sm font-medium">Full Name<input name="name" required defaultValue={user.name} className={input} /></label>
      <label className="grid gap-1.5 text-sm font-medium">Email Address<input value={user.email} disabled className={`${input} opacity-60`} /></label>
      <label className="grid gap-1.5 text-sm font-medium">Phone Number<input name="phone" type="tel" defaultValue={user.phone} placeholder="01XXXXXXXXX" className={input} /></label>
      <Button type="submit" disabled={busy} className="justify-self-start px-8">{busy ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}

type Address = { id: string; label: string; recipient: string; phone: string; division: string; district: string; area: string; street: string; is_default: boolean };

function Addresses() {
  const { user } = useShop();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at");
      if (error) throw error;
      return data as Address[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["addresses"] });
  const remove = async (id: string) => { await supabase.from("addresses").delete().eq("id", id); toast("Address removed"); void refresh(); };
  const makeDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    void refresh();
  };
  if (editing) return <AddressForm initial={editing === "new" ? null : editing} onDone={() => { setEditing(null); void refresh(); }} isFirst={data.length === 0} />;
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Delivery addresses</h2><Button onClick={() => setEditing("new")}>Add address</Button></div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : data.length === 0 ? <p className="text-sm text-muted-foreground">You haven't saved any addresses yet.</p> : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((a) => (
            <li key={a.id} className={`grid gap-1 rounded-2xl border p-4 text-sm ${a.is_default ? "border-primary bg-primary-soft" : "border-border"}`}>
              <div className="flex items-center gap-2"><span className="font-bold">{a.label}</span>{a.is_default && <span className="rounded-full bg-sale px-2 py-0.5 text-[10px] font-bold uppercase text-sale-foreground">Default</span>}</div>
              <p>{a.recipient} · {a.phone}</p>
              <p className="text-muted-foreground">{a.street}, {a.area}, {a.district}, {a.division}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(a)}><Pencil /> Edit</Button>
                {!a.is_default && <Button size="sm" variant="outline" onClick={() => void makeDefault(a.id)}>Set default</Button>}
                <Button size="sm" variant="outline" onClick={() => void remove(a.id)} aria-label={`Delete ${a.label} address`}><Trash2 /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddressForm({ initial, onDone, isFirst }: { initial: Address | null; onDone: () => void; isFirst: boolean }) {
  const { user } = useShop();
  const [division, setDivision] = useState(initial?.division ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    const phone = String(f.get("phone")).replace(/[\s-]/g, "");
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) return toast.error("Please enter a valid Bangladeshi phone number.");
    const row = { user_id: user.id, label: String(f.get("label")) || "Home", recipient: String(f.get("recipient")).trim(), phone, division, district, area: String(f.get("area")), street: String(f.get("street")).trim() };
    setBusy(true);
    const { error } = initial ? await supabase.from("addresses").update(row).eq("id", initial.id) : await supabase.from("addresses").insert({ ...row, is_default: isFirst });
    setBusy(false);
    if (error) return toast.error("Could not save the address. Please try again.");
    toast.success("Address saved");
    onDone();
    return undefined;
  };
  const sel = `${input} appearance-none`;
  return (
    <form onSubmit={save} className="grid max-w-xl gap-4">
      <h2 className="text-xl font-bold">{initial ? "Edit address" : "New address"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Label<select name="label" defaultValue={initial?.label ?? "Home"} className={sel}><option>Home</option><option>Office</option><option>Other</option></select></label>
        <label className="grid gap-1.5 text-sm font-medium">Recipient Name<input name="recipient" required defaultValue={initial?.recipient ?? user?.name} className={input} /></label>
        <label className="grid gap-1.5 text-sm font-medium">Phone Number<input name="phone" type="tel" required defaultValue={initial?.phone ?? user?.phone} placeholder="01XXXXXXXXX" className={input} /></label>
        <label className="grid gap-1.5 text-sm font-medium">Division<select required value={division} onChange={(e) => { setDivision(e.target.value); setDistrict(""); }} className={sel}><option value="">Select Division</option>{Object.keys(deliveryAreas).map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="grid gap-1.5 text-sm font-medium">District<select required disabled={!division} value={district} onChange={(e) => setDistrict(e.target.value)} className={sel}><option value="">Select District</option>{Object.keys(deliveryAreas[division] ?? {}).map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="grid gap-1.5 text-sm font-medium">Area<select name="area" required disabled={!district} defaultValue={initial?.area ?? ""} key={district} className={sel}><option value="">Select Area</option>{(deliveryAreas[division]?.[district] ?? []).map((a) => <option key={a}>{a}</option>)}</select></label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">House, Road, Street<input name="street" required defaultValue={initial?.street} placeholder="House 12, Road 5, Block C" className={input} /></label>
      <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save address"}</Button><Button type="button" variant="outline" onClick={onDone}>Cancel</Button></div>
    </form>
  );
}

type OrderItem = { id: string; name: string; qty: number; price: number };
type Order = { id: string; order_number: string; items: OrderItem[]; total: number; status: string; payment_method: string; payment_status: string; created_at: string };
const steps = ["placed", "confirmed", "shipped", "delivered"];

function Orders() {
  const { user } = useShop();
  const { data = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id, order_number, items, total, status, payment_method, payment_status, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-bold">My orders</h2>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : data.length === 0 ? <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p> : data.map((o) => {
        const at = steps.indexOf(o.status);
        return (
          <article key={o.id} className="grid gap-3 rounded-2xl border border-border p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2"><span className="font-bold">#{o.order_number}</span><span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div>
            <ul className="grid gap-1">{o.items.map((i) => <li key={i.id} className="flex justify-between gap-2"><span>{i.qty} × {i.name}</span><span>{formatPrice(i.qty * i.price)}</span></li>)}</ul>
            {o.status === "cancelled" ? <p className="font-semibold text-sale">Cancelled</p> : (
              <ol className="grid grid-cols-4 gap-1 text-center text-[11px] font-semibold capitalize">{steps.map((s, i) => <li key={s} className={`rounded-full py-1 ${i <= at ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</li>)}</ol>
            )}
            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-2"><span className="capitalize text-muted-foreground">{o.payment_method} · payment {o.payment_status}</span><span className="font-bold">{formatPrice(Number(o.total))}</span></div>
          </article>
        );
      })}
    </div>
  );
}

function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const items = wishlist.map(productById).filter((p) => !!p);
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-bold">My wishlist</h2>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">No saved items yet. Tap the heart on any product to save it.</p> : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="flex gap-3 rounded-2xl border border-border p-3">
              <img src={p.image} alt="" className="size-16 shrink-0 rounded-xl bg-background object-contain p-1" />
              <div className="flex min-w-0 flex-col gap-1.5"><p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                <div className="flex gap-2"><Button size="sm" disabled={!p.inStock} onClick={() => addToCart(p.id)}>Add to Cart</Button><Button size="sm" variant="outline" onClick={() => toggleWishlist(p.id)}>Remove</Button></div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
