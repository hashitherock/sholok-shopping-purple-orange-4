import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop/store";

export function FloatingCart() {
  const { cartCount, cartTotal, openDialog, dialog, productId } = useShop();
  if (dialog || productId) return null;
  return (
    <Button variant="plain" onClick={() => openDialog("cart")} aria-label={`Open cart, ${cartCount} items, ৳${cartTotal}`}
      className="floating-cart fixed bottom-20 right-3 z-40 h-auto flex-col gap-1.5 overflow-hidden rounded-3xl px-2.5 py-3 text-primary-foreground transition hover:scale-105 md:bottom-auto md:right-5 md:top-1/2 md:-translate-y-1/2">
      <span className="floating-cart-icon relative grid size-12 place-items-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
        <ShoppingBag className="size-5!" aria-hidden />
        <span key={cartCount} className="floating-cart-badge absolute -right-1 -top-1 grid min-w-5.5 place-items-center rounded-full bg-primary-foreground px-1.5 py-0.5 text-[11px] font-extrabold text-sale">{cartCount}</span>
      </span>
      <span className="relative flex flex-col items-center leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-85">My Cart</span>
        <span className="text-xs font-extrabold tabular-nums drop-shadow-sm">৳{cartCount === 0 ? "0.00" : cartTotal.toFixed(2)}</span>
      </span>
    </Button>
  );
}
