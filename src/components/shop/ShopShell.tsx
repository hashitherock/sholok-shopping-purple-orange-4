import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ShopProvider } from "@/lib/shop/store";
import { TopBar, MainHeader } from "./Header";
import { SiteFooter } from "./Footer";
import { ProductDetailDialog } from "./ProductCard";
import { CartDrawer, WishlistDrawer, LocationDialog, AccountDialog, SellerDialog, OfferPopup } from "./Overlays";
import { FloatingCart } from "./FloatingCart";
import { CompareDialog } from "./CompareDialog";

export function ShopShell({ children }: { children: ReactNode }) {
  return <ShopProvider><TopBar /><MainHeader />{children}<SiteFooter /><FloatingCart /><ProductDetailDialog /><CompareDialog /><CartDrawer /><WishlistDrawer /><LocationDialog /><AccountDialog /><SellerDialog /><OfferPopup /><Toaster position="bottom-center" /></ShopProvider>;
}