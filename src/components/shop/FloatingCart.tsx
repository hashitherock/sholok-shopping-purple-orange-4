import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop/store";

export function FloatingCart() {
  const { cartCount, cartTotal, openDialog, dialog, productId } = useShop();
  if (dialog || productId) return null;
  return (
    <Button variant="plain" onClick={() => openDialog("cart")} aria-label={`Open cart, ${cartCount} items, ৳${cartTotal}`}
      className="floating-cart fixed bottom-5 right-4 z-40 h-16 gap-3 overflow-hidden rounded-full p-2 pr-6 text-primary-foreground transition hover:scale-[1.03] md:bottom-8 md:right-6">
      <span className="floating-cart-icon relative grid size-12 place-items-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
        <ShoppingBag className="size-5!" aria-hidden />
        <span key={cartCount} className="floating-cart-badge absolute -right-1 -top-1 grid min-w-5.5 place-items-center rounded-full bg-primary-foreground px-1.5 py-0.5 text-[11px] font-extrabold text-sale">{cartCount}</span>
      </span>
      <span className="relative flex flex-col items-start leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-85">My Cart</span>
        <span className="text-base font-extrabold tabular-nums drop-shadow-sm">৳{cartCount === 0 ? "0.00" : cartTotal.toFixed(2)}</span>
      </span>
    </Button>
  );
}
