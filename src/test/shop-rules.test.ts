import { describe, expect, it } from "vitest";
import { products } from "@/lib/shop/products";
import { categories } from "@/lib/shop/categories";
import { recommend, searchProducts } from "@/lib/shop/search";

describe("Sholok shop rules", () => {
  it("has exactly the 13 categories in order", () => {
    expect(categories.map((c) => c.name)).toEqual([
      "Women's Clothing", "Men's Clothing", "Beauty & Makeup", "Personal Care", "Fashion & Lifestyle",
      "Health & Wellness", "Baby Care", "Home & Kitchen", "Cleaning Supplies", "Stationery & Office",
      "Pet Care", "Toys & Sports", "Vehicle Essentials",
    ]);
  });
  it("selling prices match discounts", () => {
    for (const p of products) expect(p.sellingPrice).toBeCloseTo(p.regularPrice * (1 - p.discountPercentage / 100), 1);
  });
  it("search for women's clothing returns only that category first", () => {
    const r = searchProducts(products, "Women's Clothing");
    expect(r[0]?.category).toBe("womens-clothing");
  });
  it("More to Love puts search matches first and is stable for the same seed", () => {
    const a = recommend(products, "sneakers", 42);
    expect(a.items[0]?.keywords).toContain("sneakers");
    expect(recommend(products, "sneakers", 42).items.map((p) => p.id)).toEqual(a.items.map((p) => p.id));
    expect(a.items.every((p) => p.inStock)).toBe(true);
  });
});
