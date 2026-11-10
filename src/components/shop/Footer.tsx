import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shopConfig } from "@/lib/shop/config";
import { useShop, scrollToId } from "@/lib/shop/store";
import { Logo } from "./Header";

export function SiteFooter() {
  const { setView, openDialog } = useShop();
  const links = [
    { label: "Shop All", run: () => setView({ type: "all" }) },
    { label: "New Arrivals", run: () => { setView(null); setTimeout(() => scrollToId("new-arrivals"), 150); } },
    { label: "Flash Sale", run: () => { setView(null); setTimeout(() => scrollToId("flash-sale"), 150); } },
    { label: "Trending Items", run: () => { setView(null); setTimeout(() => scrollToId("trending"), 150); } },
    { label: "My Wishlist", run: () => openDialog("wishlist") },
    { label: "Your Cart", run: () => openDialog("cart") },
  ];
  return <footer className="mt-16 border-t border-border bg-surface">
    <div className="container-shop grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
      <div><Logo /><p className="mt-4 text-sm leading-6 text-muted-foreground">Fashion, beauty, home and everyday essentials — discover more and love more.</p></div>
      <nav aria-label="Shopping"><h3 className="mb-3 font-semibold text-primary">Shopping</h3><ul className="grid gap-1">{links.map((l) => <li key={l.label}><Button variant="link" className="h-auto justify-start px-0 py-1" onClick={l.run}>{l.label}</Button></li>)}</ul></nav>
      <div><h3 className="mb-3 font-semibold text-primary">Customer Service</h3><div className="grid gap-3 text-sm"><a href={`tel:${shopConfig.phone.tel}`} className="flex items-center gap-2 hover:text-primary"><Phone className="size-4 text-primary" />{shopConfig.phone.display}</a><a href={`mailto:${shopConfig.email}`} className="flex items-center gap-2 break-all hover:text-primary"><Mail className="size-4 shrink-0 text-primary" />{shopConfig.email}</a></div></div>
      <div><h3 className="mb-3 font-semibold text-primary">SHOLOK</h3><Button variant="link" className="px-0" onClick={() => openDialog("account")}>Login / My Account</Button><br /><Button variant="link" className="px-0" onClick={() => openDialog("seller")}>Become a Seller</Button><p className="mt-3 text-xs text-muted-foreground">Sample catalog · Accounts and checkout are not live.</p></div>
    </div><div className="border-t border-border"><p className="container-shop py-5 text-xs text-muted-foreground">© {new Date().getFullYear()} SHOLOK. All rights reserved.</p></div>
  </footer>;
}
