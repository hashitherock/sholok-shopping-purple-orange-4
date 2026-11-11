import { describe, it, expect } from "vitest";
import { shippingFor, couponDiscount } from "@/lib/shop/checkout";
describe("checkout rules", () => {
  it("charges ৳100 inside Dhaka", () => expect(shippingFor("Dhaka")).toBe(100));
  it("charges ৳150 outside Dhaka", () => expect(shippingFor("Sylhet")).toBe(150));
  it("rejects SHOLOK10 below ৳1000", () => expect(couponDiscount("SHOLOK10", 999).discount).toBe(0));
  it("gives 10% with SHOLOK10", () => expect(couponDiscount("sholok10", 2000).discount).toBe(200));
});
