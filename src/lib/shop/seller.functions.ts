import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { applicationSchema, registrationSchema, normalizePhone, type SellerApplication } from "./seller-schema";

async function saveApplication(userId: string, d: SellerApplication) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.rpc("submit_seller_application", { p_user_id: userId, p_full_name: d.full_name, p_email: d.email, p_phone: d.phone, p_nid: d.nid_number, p_name: d.name, p_slug: d.slug, p_type: d.business_type, p_address: d.address, p_city: d.city, p_district: d.district, p_postal: d.postal_code, p_description: d.description });
  if (error) throw new Error(error.code === "23505" ? "This account, mobile number or store URL is already registered. Sign in or choose a different store URL." : "Could not save your application. Please try again.");
}

export const applyAsSeller = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => applicationSchema.parse(d)).handler(async ({ data, context }) => {
  const { data: auth } = await context.supabase.auth.getUser();
  if (!auth.user?.email) throw new Error("Please sign in with an email account.");
  await saveApplication(context.userId, { ...data, email: auth.user.email });
  return { ok: true };
});

export const registerSeller = createServerFn({ method: "POST" }).inputValidator(d => registrationSchema.parse(d)).handler(async ({ data }) => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Seller registration is temporarily unavailable.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const existing = await supabaseAdmin.from("seller_stores").select("id").eq("slug", data.slug).maybeSingle();
  const phone = await supabaseAdmin.from("seller_profiles").select("user_id").eq("phone", data.phone).maybeSingle();
  if (existing.data || phone.data) throw new Error("This store URL or mobile number is already registered.");
  const { data: result, error } = await client.auth.signUp({ email: data.email, password: data.password, options: { data: { full_name: data.full_name, phone: data.phone } } });
  if (error || !result.user || result.user.identities?.length === 0) throw new Error("Could not register. If you already have an account, sign in first.");
  await saveApplication(result.user.id, data);
  return { session: result.session, needsConfirm: !result.session };
});

export const sellerMobileLogin = createServerFn({ method: "POST" }).inputValidator((d: { mobile: string; password: string }) => {
  if (!d || typeof d.mobile !== "string" || typeof d.password !== "string" || d.password.length > 128) throw new Error("Invalid login details.");
  return { ...d, mobile: normalizePhone(d.mobile) };
}).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: seller } = await supabaseAdmin.from("seller_profiles").select("email").eq("phone", data.mobile).maybeSingle();
  const url = process.env["SUPABASE_URL"], key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Login is temporarily unavailable.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await client.auth.signInWithPassword({ email: seller?.email ?? "unknown-seller@invalid.example", password: data.password });
  if (result.error || !result.data.session) throw new Error("Incorrect mobile number or password, or email not yet confirmed.");
  return { access_token: result.data.session.access_token, refresh_token: result.data.session.refresh_token };
});