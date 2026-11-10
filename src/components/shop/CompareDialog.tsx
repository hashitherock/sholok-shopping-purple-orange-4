import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { productById } from "@/lib/shop/products";
import { useShop } from "@/lib/shop/store";
import { Price, Rating } from "./ProductCard";

export function CompareDialog() {
  const { compare, toggleCompare, dialog, openDialog, addToCart } = useShop();
  const items = compare.flatMap((id) => { const p = productById(id); return p ? [p] : []; });
  return <Dialog open={dialog === "compare"} onOpenChange={(open) => openDialog(open ? "compare" : null)}>
    <DialogContent className="max-h-[85dvh] max-w-4xl overflow-y-auto">
      <DialogHeader><DialogTitle>Compare products ({items.length})</DialogTitle><DialogDescription>Price, details and availability</DialogDescription></DialogHeader>
      {!items.length ? <p className="py-8 text-center text-muted-foreground">No products selected</p> : <div className="flex gap-5 overflow-x-auto pb-3">{items.map((p) => <article key={p.id} className="flex w-52 shrink-0 flex-col gap-3">
        <Button variant="ghost" size="icon" className="self-end" aria-label={`Remove ${p.name} from comparison`} onClick={() => toggleCompare(p.id)}><X /></Button>
        <img src={p.image} alt={p.name} className="aspect-square w-full object-contain" />
        <h3 className="min-h-10 text-sm font-semibold">{p.name}</h3><Price product={p} /><Rating product={p} />
        <p className="text-sm text-muted-foreground">{p.brand}</p><p className="text-sm">{p.description}</p><p className="text-sm text-primary">{p.inStock ? "In stock" : "Out of stock"}</p>
        <Button disabled={!p.inStock} className="mt-auto" onClick={() => addToCart(p.id)}>Add to Cart</Button>
      </article>)}</div>}
    </DialogContent>
  </Dialog>;
}