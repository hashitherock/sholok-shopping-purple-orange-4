import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sellerSlug } from "@/lib/shop/seller-schema";

export const sellerInput = "h-11 w-full min-w-0 rounded-full border border-input bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";
export function SellerField({ label, name, type = "text", value, defaultValue, onChange, required = true }: { label: string; name: string; type?: string; value?: string; defaultValue?: string; onChange?: (v: string) => void; required?: boolean }) {
  const [show, setShow] = useState(false);
  return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<span className="relative"><input name={name} type={type === "password" && show ? "text" : type} value={value} defaultValue={defaultValue} onChange={onChange ? e => onChange(e.target.value) : undefined} required={required} className={`${sellerInput} ${type === "password" ? "pr-12" : ""}`} />{type === "password" && <Button type="button" variant="ghost" size="icon" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1 size-9">{show ? <EyeOff /> : <Eye />}</Button>}</span></label>;
}
export function BusinessFields() {
  const [slug, setSlug] = useState("");
  const [edited, setEdited] = useState(false);
  return <><h2 className="col-span-full mt-3 text-lg font-bold">Business information</h2>
    <SellerField label="Store Name" name="name" onChange={v => { if (!edited) setSlug(sellerSlug(v)); }} />
    <SellerField label="Store URL / Slug" name="slug" value={slug} onChange={v => { setEdited(true); setSlug(v); }} />
    <label className="grid gap-2 text-sm font-medium">Business Type<select name="business_type" className={sellerInput}><option>Individual</option><option>Sole proprietorship</option><option>Company</option></select></label>
    <SellerField label="Business Address" name="address" /><SellerField label="City" name="city" /><SellerField label="District" name="district" /><SellerField label="Postal Code" name="postal_code" /><SellerField label="NID Number" name="nid_number" />
    <label className="col-span-full grid gap-2 text-sm font-medium">Business Description<textarea name="description" required maxLength={500} className="min-h-28 rounded-lg border border-input bg-surface p-4" /></label></>;
}