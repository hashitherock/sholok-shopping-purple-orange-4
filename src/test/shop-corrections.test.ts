import { describe, expect, it } from "vitest";
import { formatPrice, shopConfig, isCampaignActive } from "@/lib/shop/config";
import { currentProduct, cartSummary } from "@/lib/shop/pricing";
import { products } from "@/lib/shop/products";
import { recommend } from "@/lib/shop/search";
import { deliveryAreas } from "@/lib/shop/delivery";

describe("SHOLOK corrections", () => {
  it("uses BDT without changing the numeric price", () => {
    expect(shopConfig.currency.code).toBe("BDT");
    expect(formatPrice(71.2)).toBe("৳71.20");
  });
  it("uses the official phone", () => { expect(shopConfig.phone.tel).toBe("+8801716509407"); });
  it("uses the official email", () => { expect(shopConfig.email).toBe("sholoksell@gmail.com"); });
  it("removes a flash-sale discount at its expiry", () => {
    const product = products.find((p) => p.id === "w1");
    if (!product) throw new Error("Missing existing product");
    expect(currentProduct(product, new Date("2026-12-30T00:00:00Z")).sellingPrice).toBe(71.2);
    const expired = currentProduct(product, new Date(shopConfig.flashSale.endsAt));
    expect(expired.sellingPrice).toBe(89);
    expect(expired.discountPercentage).toBe(0);
  });
  it("synchronizes quantity changes and removals with the subtotal", () => {
    const now = new Date("2026-11-10T00:00:00Z");
    expect(cartSummary({ w1: 1 }, products, now).total).toBe(71.2);
    expect(cartSummary({ w1: 2 }, products, now).count).toBe(2);
    expect(cartSummary({ w1: 2 }, products, now).total).toBe(142.4);
    expect(cartSummary({}, products, now).total).toBe(0);
  });
  it("hides the seasonal discount outside its configured dates", () => {
    expect(isCampaignActive(new Date("2026-11-10T00:00:00Z"))).toBe(true);
    expect(isCampaignActive(new Date("2027-01-01T00:00:00Z"))).toBe(false);
  });
  it("fills recommendations with available unique fallback products", () => {
    const rec = recommend(products, "notebook", 42, 15);
    expect(rec.items).toHaveLength(15);
    expect(rec.items[0]?.id).toBe("so1");
    expect(new Set(rec.items.map((p) => p.id)).size).toBe(15);
    expect(rec.items.every((p) => p.inStock)).toBe(true);
  });
  it("preserves existing Dhaka delivery areas in the hierarchy", () => {
    expect(deliveryAreas["Dhaka"]?.["Dhaka"]).toEqual(["Gulshan", "Dhanmondi", "Uttara", "Mirpur"]);
  });
});