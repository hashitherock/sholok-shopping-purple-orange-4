import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { shopConfig } from "@/lib/shop/config";
import { useShop, scrollToId } from "@/lib/shop/store";
import { Logo } from "./Header";

const policies: Record<string, string> = {
  "About Us": "SHOLOK brings fashion, beauty, home and everyday essentials together in one trusted place for shoppers across Bangladesh.",
  "Contact Us": `Call us at ${shopConfig.phone.display} or email ${shopConfig.email}. Our team replies every day from 10 AM to 8 PM.`,
  "Privacy Policy": "We only use your details to process orders, deliver products and support you. We never sell your personal information.",
  "Terms & Conditions": "By ordering on SHOLOK you agree to provide accurate details and accept that prices and stock can change without notice.",
  "Return & Refund Policy": "Unused items in original packaging can be returned within 7 days of delivery. Refunds are issued once the item is checked.",
  "Shipping Policy": "Delivery inside Dhaka costs ৳100 and outside Dhaka ৳150. Orders usually arrive within 2–5 working days.",
};

export function SiteFooter() {
  const { setView, openDialog, openAuth } = useShop();
  const [policy, setPolicy] = useState<string | null>(null);
  const shopLinks = [
    { label: "Shop All", run: () => setView({ type: "all" }) },
    { label: "New Arrivals", run: () => { setView(null); setTimeout(() => scrollToId("new-arrivals"), 150); } },
    { label: "Flash Sale", run: () => { setView(null); setTimeout(() => scrollToId("flash-sale"), 150); } },
    { label: "My Wishlist", run: () => openDialog("wishlist") },
    { label: "Your Cart", run: () => openDialog("cart") },
    { label: "Login / My Account", run: () => openAuth("login") },
    { label: "Become a Seller", run: () => openDialog("seller") },
  ];
  const linkCls = "h-auto justify-start rounded-none px-0 py-1 text-sm font-normal text-sale-foreground/90 hover:bg-transparent hover:text-sale-foreground hover:underline";
  return <footer className="site-footer mt-16 bg-sale text-sale-foreground">
    <div className="container-shop grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Logo className="text-sale-foreground" />
        <p className="mt-4 text-sm leading-6 text-sale-foreground/85">Fashion, beauty, home and everyday essentials — discover more and love more.</p>
        <div className="mt-5 flex gap-2">
          {[{ I: Facebook, n: "Facebook", u: "https://facebook.com" }, { I: Instagram, n: "Instagram", u: "https://instagram.com" }, { I: Youtube, n: "YouTube", u: "https://youtube.com" }].map(({ I, n, u }) => (
            <a key={n} href={u} target="_blank" rel="noreferrer" aria-label={n} className="grid size-10 place-items-center rounded-full border border-sale-foreground/40 transition hover:bg-sale-foreground hover:text-sale"><I className="size-4" /></a>
          ))}
        </div>
      </div>
      <nav aria-label="Shopping"><h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Shopping</h3><ul className="grid">{shopLinks.map((l) => <li key={l.label}><Button variant="plain" className={linkCls} onClick={l.run}>{l.label}</Button></li>)}</ul></nav>
      <nav aria-label="Information"><h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Information</h3><ul className="grid">{Object.keys(policies).map((p) => <li key={p}><Button variant="plain" className={linkCls} onClick={() => setPolicy(p)}>{p}</Button></li>)}</ul></nav>
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Customer Support</h3>
        <div className="grid gap-3 text-sm">
          <a href={`tel:${shopConfig.phone.tel}`} className="flex items-center gap-2 hover:underline"><Phone className="size-4" />{shopConfig.phone.display}</a>
          <a href={`mailto:${shopConfig.email}`} className="flex items-center gap-2 break-all hover:underline"><Mail className="size-4 shrink-0" />{shopConfig.email}</a>
          <span className="flex items-center gap-2"><Clock className="size-4" />Every day, 10 AM – 8 PM</span>
          <span className="flex items-center gap-2"><MapPin className="size-4" />Dhaka, Bangladesh</span>
        </div>
        <h3 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wider">We Accept</h3>
        <div className="flex flex-wrap gap-2">{["Cash on Delivery", "bKash", "Nagad", "Visa", "Mastercard"].map((m) => <span key={m} className="rounded-md bg-sale-foreground px-2.5 py-1 text-xs font-bold text-sale">{m}</span>)}</div>
      </div>
    </div>
    <div className="border-t border-sale-foreground/25"><p className="container-shop flex flex-wrap justify-between gap-2 py-5 text-xs text-sale-foreground/85"><span>© {new Date().getFullYear()} SHOLOK Shopping. All rights reserved.</span><span>Made with care in Bangladesh</span></p></div>
    <Dialog open={!!policy} onOpenChange={(o) => !o && setPolicy(null)}>
      <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{policy}</DialogTitle><DialogDescription className="pt-2 text-sm leading-6 text-foreground/80">{policy ? policies[policy] : ""}</DialogDescription></DialogHeader></DialogContent>
    </Dialog>
  </footer>;
}
