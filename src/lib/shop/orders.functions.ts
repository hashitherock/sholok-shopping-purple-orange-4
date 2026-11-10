import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeOrder } from "./checkout";

type Input = { cart: Record<string, number>; addressId: string; coupon: string; payment: "cod" };

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Input) => {
    if (!d || typeof d.addressId !== "string" || typeof d.cart !== "object" || d.payment !== "cod") throw new Error("Invalid order");
    return { cart: d.cart, addressId: d.addressId, coupon: String(d.coupon ?? "").slice(0, 40), payment: d.payment };
  })
  .handler(async ({ data, context }) => {
    const { data: addr, error: aErr } = await context.supabase.from("addresses").select("*").eq("id", data.addressId).maybeSingle();
    if (aErr || !addr) throw new Error("Please choose a delivery address.");
    const o = computeOrder(data.cart, addr.division, data.coupon);
    if (!o.items.length) throw new Error("Your cart is empty.");
    if (o.couponError) throw new Error(o.couponError);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("orders").insert({
      user_id: context.userId,
      items: o.items.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.sellingPrice, qty: i.qty, image: i.product.image })),
      subtotal: o.subtotal, discount: o.discount, shipping: o.shipping, total: o.total,
      shipping_address: { recipient: addr.recipient, phone: addr.phone, division: addr.division, district: addr.district, area: addr.area, street: addr.street },
      payment_method: "Cash on Delivery", payment_status: "unpaid",
    }).select("order_number, total").single();
    if (error) { console.error(error); throw new Error("Could not place the order. Please try again."); }
    return row;
  });
