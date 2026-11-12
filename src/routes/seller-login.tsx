import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SellerField } from "@/components/shop/SellerFields";
import { supabase } from "@/integrations/supabase/client";
import { sellerMobileLogin } from "@/lib/shop/seller.functions";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/seller-login")({ head: () => ({ meta: [{ title: "Seller Login — Sholok Shopping" }, { name: "description", content: "Sign in securely to your Sholok seller account." }, { property: "og:title", content: "Seller Login — Sholok Shopping" }, { property: "og:description", content: "Access your seller account and store settings." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: SellerLogin });
function SellerLogin() {
  const navigate = useNavigate();
  const { login, resetPassword, user } = useShop();
  const mobileLogin = useServerFn(sellerMobileLogin);
  const [busy, setBusy] = useState(false), [forgot, setForgot] = useState(false), [message, setMessage] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    const f = new FormData(e.currentTarget), identifier = String(f.get("identifier")).trim();
    try {
      if (forgot) { if (!identifier.includes("@")) throw new Error("Enter your email address to reset your password."); const err = await resetPassword(identifier); if (err) throw new Error(err); setMessage("Password reset email sent. Please check your inbox."); return; }
      if (identifier.includes("@")) { const error = await login(identifier, String(f.get("password"))); if (error) throw new Error(error); }
      else { const session = await mobileLogin({ data: { mobile: identifier, password: String(f.get("password")) } }); const { error } = await supabase.auth.setSession(session); if (error) throw error; }
      await navigate({ to: "/vendor" });
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not sign in."); } finally { setBusy(false); }
  }
  return <main className="container-shop py-10"><div className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-border bg-surface shadow-card"><div className="auth-hero px-7 py-8 text-primary-foreground"><Store className="mb-3 size-8" /><h1 className="text-2xl font-bold">{forgot ? "Reset seller password" : "Seller Login"}</h1><p className="mt-2 text-sm opacity-85">Welcome back to your Sholok store.</p></div><form onSubmit={submit} className="grid gap-5 p-7">{user && <Button type="button" variant="outline" onClick={() => void navigate({ to: "/vendor" })}>Continue with current account</Button>}<SellerField name="identifier" label={forgot ? "Email Address" : "Email or Mobile Number"} />{!forgot && <><SellerField name="password" label="Password" type="password" /><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-muted-foreground">Stay signed in on this device</span><Button variant="link" type="button" onClick={() => { setForgot(true); setMessage(""); }}>Forgot Password?</Button></div></>}{message && <p role="status" className="text-sm text-sale">{message}</p>}<Button disabled={busy}>{busy ? "Please wait…" : forgot ? "Send reset email" : "Login"}</Button>{forgot && <Button type="button" variant="ghost" onClick={() => setForgot(false)}>Back to Login</Button>}<p className="text-center text-sm">New to Sholok? <Link className="font-semibold text-primary" to="/seller-register">Create a seller account</Link></p></form></div></main>;
}