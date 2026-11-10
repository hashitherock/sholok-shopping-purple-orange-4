import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop/store";

export function FloatingCart() {
  const { cartCount, cartTotal, openDialog, dialog, productId } = useShop();
  if (dialog || productId) return null;
  return (
    <Button variant="plain" onClick={() => openDialog("cart")} aria-label={`Open cart, ${cartCount} items, ৳${cartTotal}`}
      className="floating-cart fixed bottom-5 right-4 z-40 h-14 gap-3 rounded-full p-1.5 pr-5 text-primary-foreground shadow-elegant transition hover:-translate-y-0.5 md:bottom-8 md:right-6">
      <span className="relative grid size-11 place-items-center rounded-full bg-primary-foreground/15">
        <ShoppingBag className="size-5!" aria-hidden />
        <span key={cartCount} className="absolute -right-1 -top-1 grid min-w-5 animate-in zoom-in place-items-center rounded-full bg-primary-foreground px-1 text-[11px] font-bold text-sale">{cartCount}</span>
      </span>
      <span className="flex flex-col items-start leading-tight"><span className="text-[10px] uppercase tracking-wider opacity-85">My Cart</span><span className="text-sm font-bold tabular-nums">৳{cartTotal === 0 ? "0" : cartTotal.toFixed(2)}</span></span>
    </Button>
  );
}
