import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop/store";

export function FloatingCart() {
  const { cartCount, cartTotal, openDialog, dialog, productId } = useShop();
  if (dialog || productId) return null;
  return (
    <Button variant="plain" onClick={() => openDialog("cart")} aria-label={`Open floating cart, ${cartCount} items, ৳${cartTotal}`} className="fixed right-0 top-1/2 z-40 h-auto w-16 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-l-md rounded-r-none border-t-4 border-sale bg-primary p-0 text-primary-foreground shadow-lift md:w-20">
      <span className="flex w-full flex-col items-center gap-1 py-3"><ShoppingCart className="size-6!" aria-hidden /><span className="text-xs font-semibold">{cartCount} items</span></span>
      <span className="w-full bg-cart-panel px-1 py-2 text-center text-xs font-bold tabular-nums">৳{cartTotal === 0 ? "0" : cartTotal.toFixed(2)}</span>
    </Button>
  );
}