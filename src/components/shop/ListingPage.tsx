import { useMemo, useState } from "react";
import type { Product } from "@/lib/shop/products";
import { ProductGrid } from "./ProductCard";

export function ListingPage({ title, items }: { title: string; items: Product[] }) {
  const [sort, setSort] = useState("featured");
  const [available, setAvailable] = useState(false);
  const shown = useMemo(() => {
    const result = items.filter((p) => !available || p.inStock);
    if (sort === "low") result.sort((a, b) => a.sellingPrice - b.sellingPrice);
    if (sort === "high") result.sort((a, b) => b.sellingPrice - a.sellingPrice);
    return result;
  }, [items, sort, available]);
  return <main className="container-shop min-h-96 py-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{shown.length} products</p></div>
      <div className="flex flex-wrap items-center gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />In stock only</label><label>Sort <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)} className="ml-2 rounded-md border border-border bg-surface p-2"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
    </div>{shown.length ? <ProductGrid items={shown} /> : <p className="py-16 text-center text-muted-foreground">No matching products</p>}
  </main>;
}