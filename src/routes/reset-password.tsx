import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Sholok Shopping" },
      { name: "description", content: "Choose a new password for your Sholok Shopping account." },
      { property: "og:title", content: "Reset Password — Sholok Shopping" },
      { property: "og:description", content: "Choose a new password for your Sholok account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY") setReady(true); });
    void supabase.auth.getSession().then(({ data: s }) => { if (s.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pw = String(f.get("password"));
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== f.get("confirm")) return setError("Passwords do not match.");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) return setError(err.message);
    toast.success("Your password has been updated");
    void navigate({ to: "/account" });
  };
  const input = "h-12 w-full rounded-full border border-input bg-surface px-5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
  return (
    <main className="container-shop grid place-items-center py-16">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-background shadow-elegant">
        <div className="auth-hero px-7 py-7 text-primary-foreground"><h1 className="text-2xl font-extrabold">Set a new password</h1><p className="mt-1 text-sm opacity-85">Choose a strong password you haven't used before.</p></div>
        {ready ? (
          <form onSubmit={submit} className="grid gap-4 p-7">
            <label className="grid gap-1.5 text-sm font-medium">New Password<input name="password" type="password" required minLength={8} autoComplete="new-password" className={input} /></label>
            <label className="grid gap-1.5 text-sm font-medium">Confirm Password<input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} /></label>
            {error && <p role="alert" className="rounded-2xl bg-sale-soft px-4 py-2.5 text-sm text-sale">{error}</p>}
            <Button type="submit" disabled={busy} className="h-12 font-semibold">{busy ? "Saving…" : "Update password"}</Button>
          </form>
        ) : (
          <p className="p-7 text-sm text-muted-foreground">This page only works from the reset link in your email. Request a new link from Login → Forgot password?</p>
        )}
      </div>
    </main>
  );
}
