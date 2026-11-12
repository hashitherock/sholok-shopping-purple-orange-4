import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessFields, SellerField } from "@/components/shop/SellerFields";
import { applyAsSeller, registerSeller } from "@/lib/shop/seller.functions";
import { applicationSchema, registrationSchema, validateSellerImage } from "@/lib/shop/seller-schema";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/seller-register")({ head: () => ({ meta: [{ title: "Seller Registration — Sholok Shopping" }, { name: "description", content: "Register your business and apply for a Sholok seller store." }, { property: "og:title", content: "Seller Registration — Sholok Shopping" }, { property: "og:description", content: "Submit your business details for seller approval." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: SellerRegister });
function SellerRegister() {
  const { user } = useShop();
  const register = useServerFn(registerSeller), apply = useServerFn(applyAsSeller), navigate = useNavigate();
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [confirmed, setConfirmed] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const form = new FormData(e.currentTarget);
    const values = { ...Object.fromEntries(form), terms: form.get("terms") === "on", email: user?.email ?? form.get("email") };
    const parsed = (user ? applicationSchema : registrationSchema).safeParse(values);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Please check the form."); return; }
    const logo = form.get("logo");
    if (logo instanceof File && logo.size) { const err = validateSellerImage(logo); if (err) { setError(err); return; } }
    setBusy(true);
    try {
      if (user) await apply({ data: applicationSchema.parse(values) });
      else {
        const result = await register({ data: registrationSchema.parse(values) });
        if (result.needsConfirm) { setConfirmed(true); return; }
        if (result.session) await supabase.auth.setSession({ access_token: result.session.access_token, refresh_token: result.session.refresh_token });
      }
      if (logo instanceof File && logo.size) {
        const { data } = await supabase.auth.getUser();
        if (data.user) { const path = `${data.user.id}/${crypto.randomUUID()}.${logo.type.split("/")[1]}`; const uploaded = await supabase.storage.from("seller-media").upload(path, logo, { contentType: logo.type }); if (!uploaded.error) await supabase.from("seller_stores").update({ logo_path: path }).eq("user_id", data.user.id); }
      }
      await navigate({ to: "/vendor" });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not submit your application."); } finally { setBusy(false); }
  }
  if (confirmed) return <main className="container-shop py-14"><div className="mx-auto max-w-xl text-center"><Store className="mx-auto mb-4 size-12 text-primary" /><h1 className="text-2xl font-bold">Application received</h1><p className="mt-4 text-muted-foreground">Your seller account is Pending Approval. Confirm your email using the link in your inbox, then log in to your seller dashboard. You can upload your logo in Store Settings after signing in.</p><Button asChild className="mt-6"><Link to="/seller-login">Seller Login</Link></Button></div></main>;
  return <main className="container-shop py-9"><div className="mx-auto max-w-3xl"><div className="mb-7 border-b border-border pb-6"><p className="mb-2 text-sm font-semibold text-sale">SHOLOK SELLER</p><h1 className="text-3xl font-bold">Create your seller account</h1><p className="mt-3 text-sm text-muted-foreground">Already registered? <Link className="font-semibold text-primary" to="/seller-login">Seller Login</Link>{user && " · Applying with your signed-in account"}</p></div><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Personal information</h2><SellerField name="full_name" label="Full Name" defaultValue={user?.name} /><SellerField name="email" label="Email Address" type="email" defaultValue={user?.email} /><SellerField name="phone" label="Mobile Number" type="tel" defaultValue={user?.phone} />{!user && <><SellerField name="password" label="Password" type="password" /><SellerField name="confirm" label="Confirm Password" type="password" /><p className="col-span-full text-xs text-muted-foreground">At least 8 characters, with uppercase and lowercase letters and a number.</p></>}<BusinessFields /><label className="col-span-full grid gap-2 text-sm font-medium">Store Logo<input name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="w-full min-w-0 rounded-lg border border-input bg-surface p-3 text-sm" /></label><details className="col-span-full rounded-lg border border-border p-4 text-sm"><summary className="cursor-pointer font-semibold">Seller Terms & Conditions</summary><p className="mt-3 text-muted-foreground">Submit accurate business and identity details. Applications require review before approval. Do not list prohibited or misleading products. Seller approval does not guarantee sales. Contact Sholok for applicable commission and payout terms before trading.</p></details><label className="col-span-full flex items-start gap-3 text-sm"><input required name="terms" type="checkbox" className="mt-1 accent-primary" />I agree to the Seller Terms & Conditions.</label>{error && <p role="alert" className="col-span-full text-sm text-sale">{error}</p>}<Button type="submit" disabled={busy} className="col-span-full justify-self-start px-8">{busy ? "Submitting…" : "Submit seller application"}</Button></form></div></main>;
}