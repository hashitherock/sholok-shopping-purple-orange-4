import type { Product } from "./products";
import { isFlashSaleActive } from "./config";

export function currentProduct(product: Product, now = new Date()): Product {
  if (!product.isFlashSale || isFlashSaleActive(now)) return product;
  return { ...product, sellingPrice: product.regularPrice, discountPercentage: 0 };
}

export function cartSummary(cart: Record<string, number>, list: Product[], now = new Date()) {
  const items = Object.entries(cart).flatMap(([id, qty]) => {
    const source = list.find((p) => p.id === id);
    return source && Number.isInteger(qty) && qty > 0 ? [{ product: currentProduct(source, now), qty }] : [];
  });
  return {
    items,
    count: items.reduce((sum, item) => sum + item.qty, 0),
    total: Math.round(items.reduce((sum, item) => sum + item.qty * item.product.sellingPrice, 0) * 100) / 100,
  };
}