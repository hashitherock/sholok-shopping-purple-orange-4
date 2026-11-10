import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shopConfig } from "@/lib/shop/config";
import { useShop, scrollToId } from "@/lib/shop/store";
import { Logo } from "./Header";

export function SiteFooter() {
  const { setView, openDialog, openAuth } = useShop();
  const links = [
    { label: "Shop All", run: () => setView({ type: "all" }) },
    { label: "New Arrivals", run: () => { setView(null); setTimeout(() => scrollToId("new-arrivals"), 150); } },
    { label: "Flash Sale", run: () => { setView(null); setTimeout(() => scrollToId("flash-sale"), 150); } },
    { label: "Trending Items", run: () => { setView(null); setTimeout(() => scrollToId("trending"), 150); } },
    { label: "My Wishlist", run: () => openDialog("wishlist") },
    { label: "Your Cart", run: () => openDialog("cart") },
  ];
  return <footer className="site-footer mt-16 bg-sale text-sale-foreground">
    <div className="container-shop grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
      <div><span className="inline-block rounded-full bg-surface px-5 py-2"><Logo /></span><p className="mt-4 text-sm leading-6 text-sale-foreground/80">Fashion, beauty, home and everyday essentials — discover more and love more.</p></div>
      <nav aria-label="Shopping"><h3 className="mb-3 font-semibold text-sale-foreground">Shopping</h3><ul className="grid gap-1">{links.map((l) => <li key={l.label}><Button variant="link" className="h-auto justify-start px-0 py-1 text-sale-foreground hover:text-sale-foreground" onClick={l.run}>{l.label}</Button></li>)}</ul></nav>
      <div><h3 className="mb-3 font-semibold text-sale-foreground">Customer Service</h3><div className="grid gap-3 text-sm"><a href={`tel:${shopConfig.phone.tel}`} className="flex items-center gap-2 hover:underline"><Phone className="size-4 text-sale-foreground" />{shopConfig.phone.display}</a><a href={`mailto:${shopConfig.email}`} className="flex items-center gap-2 break-all hover:underline"><Mail className="size-4 shrink-0 text-sale-foreground" />{shopConfig.email}</a></div></div>
      <div><h3 className="mb-3 font-semibold text-sale-foreground">SHOLOK</h3><Button variant="link" className="px-0 text-sale-foreground hover:text-sale-foreground" onClick={() => openAuth("login")}>Login / My Account</Button><br /><Button variant="link" className="px-0 text-sale-foreground hover:text-sale-foreground" onClick={() => openDialog("seller")}>Become a Seller</Button></div>
    </div><div className="border-t border-sale-foreground/20"><p className="container-shop py-5 text-xs text-sale-foreground/80">© {new Date().getFullYear()} SHOLOK. All rights reserved.</p></div>
  </footer>;
}
