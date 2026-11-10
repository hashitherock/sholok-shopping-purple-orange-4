import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { currentProduct } from "@/lib/shop/pricing";
import { Heart, ShoppingCart, Star, Minus, Plus, Eye, GitCompareArrows } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/shop/config";
import { categoryName } from "@/lib/shop/categories";
import { productById, type Product } from "@/lib/shop/products";
import { useShop } from "@/lib/shop/store";

export function Rating({ product }: { product: Product }) {
  if (product.rating === undefined) return <div className="h-4" />;
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`Rated ${product.rating} out of 5 from ${product.reviewCount} reviews`}>
      <Star className="size-3.5 fill-rating text-rating" aria-hidden />
      <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
      <span>({product.reviewCount})</span>
    </div>
  );
}

export function Price({ product: source, large }: { product: Product; large?: boolean }) {
  const [product, setProduct] = useState(source);
  useEffect(() => { const tick = () => setProduct(currentProduct(source)); tick(); const t = window.setInterval(tick, 1000); return () => clearInterval(t); }, [source]);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-bold text-primary ${large ? "text-2xl" : "text-base"}`}>{formatPrice(product.sellingPrice)}</span>
      {product.discountPercentage > 0 && (
        <>
          <span className="text-xs text-muted-foreground line-through"><span className="sr-only">Was </span>{formatPrice(product.regularPrice)}</span>
          <span className="text-xs font-semibold text-sale">-{product.discountPercentage}%</span>
        </>
      )}
    </div>
  );
}

export function ProductCard({ product: source }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist, openProduct, compare, toggleCompare } = useShop();
  const [product, setProduct] = useState(source);
  useEffect(() => { const tick = () => setProduct(currentProduct(source)); tick(); const t = window.setInterval(tick, 1000); return () => clearInterval(t); }, [source]);
  const saved = wishlist.includes(product.id);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift">
      <Button variant="plain" onClick={() => openProduct(product.id)} className="relative block aspect-square w-full shrink-0 bg-surface p-4" aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.name} width={300} height={300} loading="lazy" className="size-full object-contain transition-transform duration-300 group-hover:scale-105" />
        {product.discountPercentage > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-sale-foreground">{product.discountPercentage}% OFF</span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-1 text-center text-xs font-semibold text-background">Out of stock</span>
        )}
      </Button>
      <Button variant="plain"
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={saved}
        className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full border border-border bg-surface shadow-card transition-colors hover:border-sale"
      >
        <Heart className={`size-4 ${saved ? "fill-sale text-sale" : "text-muted-foreground"}`} />
      </Button>
      <div className="absolute right-2.5 top-12 flex flex-col gap-1 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
        <Button variant="outline" size="icon" title="Quick View" aria-label={`Quick view ${product.name}`} onClick={() => openProduct(product.id)}><Eye /></Button>
        <Button variant="outline" size="icon" title="Compare" aria-label={`Compare ${product.name}`} aria-pressed={compare.includes(product.id)} onClick={() => toggleCompare(product.id)}><GitCompareArrows /></Button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-border p-3">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{product.brand}</span>
        <Button variant="plain" onClick={() => openProduct(product.id)} className="line-clamp-2 min-h-10 whitespace-normal text-left text-sm font-semibold leading-5 hover:text-primary">{product.name}</Button>
        <Rating product={product} />
        <div className="mt-auto pt-1"><Price product={product} /></div>
        <Button variant="plain"
          onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
          disabled={!product.inStock}
          className="mt-1.5 flex h-9 items-center justify-center gap-1 rounded-md border border-primary text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
        >
          <ShoppingCart className="size-4" aria-hidden /> {product.inStock ? "Add to Cart" : "Unavailable"}
        </Button>
      </div>
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export function ProductDetailDialog() {
  const { productId, openProduct, addToCart, toggleWishlist, wishlist, cart, setQty } = useShop();
  const source = productId ? productById(productId) : undefined;
  const [now, setNow] = useState(() => new Date("2026-01-01T00:00:00Z"));
  useEffect(() => { setNow(new Date()); const t = window.setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const product = source ? currentProduct(source, now) : undefined;
  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && openProduct(null)}>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto p-0 sm:rounded-lg">
        {product && (
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square bg-surface p-8">
              <img src={product.image} alt={product.name} className="size-full object-contain" />
              {product.discountPercentage > 0 && <span className="absolute left-4 top-4 rounded-md bg-sale px-2 py-0.5 text-xs font-bold text-sale-foreground">{product.discountPercentage}% OFF</span>}
            </div>
            <div className="flex flex-col gap-3 border-t border-border p-6 md:border-l md:border-t-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">{categoryName(product.category)} · {product.subcategory}</span>
              <DialogTitle className="text-2xl font-bold leading-tight">{product.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">by {product.brand}</p>
              <Rating product={product} />
              <Price product={product} large />
              <DialogDescription className="text-sm leading-relaxed text-foreground/80">{product.description}</DialogDescription>
              <p className={`text-sm font-medium ${product.inStock ? "text-success" : "text-destructive"}`}>{product.inStock ? "✓ In stock" : "✕ Out of stock"}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                {cart[product.id] ? (
                  <div className="flex items-center rounded-lg border border-border">
                    <Button variant="plain" onClick={() => setQty(product.id, (cart[product.id] ?? 0) - 1)} aria-label="Decrease quantity" className="p-2.5 hover:bg-muted"><Minus className="size-4" /></Button>
                    <span className="w-8 text-center font-semibold" aria-live="polite">{cart[product.id]}</span>
                    <Button variant="plain" onClick={() => setQty(product.id, (cart[product.id] ?? 0) + 1)} aria-label="Increase quantity" className="p-2.5 hover:bg-muted"><Plus className="size-4" /></Button>
                  </div>
                ) : (
                  <Button variant="plain" disabled={!product.inStock} onClick={() => addToCart(product.id)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50">
                    <ShoppingCart className="size-4" aria-hidden /> Add to Cart
                  </Button>
                )}
                <Button variant="plain" onClick={() => toggleWishlist(product.id)} aria-pressed={wishlist.includes(product.id)} className="flex h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:border-sale">
                  <Heart className={`size-4 ${wishlist.includes(product.id) ? "fill-sale text-sale" : ""}`} aria-hidden /> {wishlist.includes(product.id) ? "Saved" : "Wishlist"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
