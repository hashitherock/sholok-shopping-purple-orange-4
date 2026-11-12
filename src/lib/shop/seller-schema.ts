import { z } from "zod";

export const normalizePhone = (value: string) => value.replace(/[\s-]/g, "").replace(/^\+?88/, "");
export const sellerSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const sellerStatus = (status: string) => ({ editable: status === "pending" || status === "approved", canPublish: status === "approved" });
const text = z.string().trim().min(1, "Please complete all required fields.").max(500);
const phone = z.string().transform(normalizePhone).pipe(z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number."));
export const applicationSchema = z.object({
  full_name: text, email: z.string().trim().email().max(254), phone,
  nid_number: z.string().regex(/^(\d{10}|\d{13}|\d{17})$/, "NID must contain 10, 13 or 17 digits."),
  name: text, slug: z.string().min(3).max(60).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens for the store URL."),
  business_type: z.enum(["Individual", "Sole proprietorship", "Company"]),
  address: text, city: text, district: text, postal_code: z.string().regex(/^\d{4}$/, "Enter a four-digit postal code."), description: text,
  terms: z.literal(true, { errorMap: () => ({ message: "Please accept the seller terms." }) }),
});
export const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(128).regex(/[A-Z]/, "Include an uppercase letter.").regex(/[a-z]/, "Include a lowercase letter.").regex(/\d/, "Include a number.");
export const registrationSchema = applicationSchema.extend({ password: passwordSchema, confirm: z.string() }).refine(d => d.password === d.confirm, { message: "Passwords do not match.", path: ["confirm"] });
export type SellerApplication = z.infer<typeof applicationSchema>;
export function validateSellerImage(file: { size: number; type: string }) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Choose a JPG, PNG or WebP image.";
  return file.size > 5 * 1024 * 1024 ? "Image must be 5 MB or smaller." : null;
}