import { cartSummary } from "./pricing";
import { products } from "./products";

/** Delivery charge: inside Dhaka ৳100, everywhere else ৳150. */
export function shippingFor(division: string): number {
  return division.trim().toLowerCase() === "dhaka" ? 100 : 150;
}

// Starter coupons (placeholder offers until the shop supplies real ones).
export const coupons: Record<string, { percent: number; minSubtotal: number; label: string }> = {
  SHOLOK10: { percent: 10, minSubtotal: 1000, label: "10% off orders of ৳1,000 or more" },
  WELCOME5: { percent: 5, minSubtotal: 0, label: "5% off your order" },
};

export function couponDiscount(code: string, subtotal: number): { discount: number; error: string | null } {
  const c = coupons[code.trim().toUpperCase()];
  if (!code.trim()) return { discount: 0, error: null };
  if (!c) return { discount: 0, error: "This coupon code is not valid." };
  if (subtotal < c.minSubtotal) return { discount: 0, error: `This coupon needs a subtotal of at least ৳${c.minSubtotal}.` };
  return { discount: Math.round(subtotal * c.percent) / 100, error: null };
}

export function computeOrder(cart: Record<string, number>, division: string, coupon: string, now = new Date()) {
  const s = cartSummary(cart, products, now);
  const subtotal = s.total;
  const { discount, error } = couponDiscount(coupon, subtotal);
  const shipping = s.items.length ? shippingFor(division) : 0;
  const total = Math.round((subtotal - discount + shipping) * 100) / 100;
  return { items: s.items, subtotal, discount, couponError: error, shipping, total };
}
