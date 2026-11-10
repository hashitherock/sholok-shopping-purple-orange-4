import {
  Flower2, Shirt, Sparkles, Droplets, Glasses, HeartPulse, Baby, CookingPot,
  SprayCan, PenTool, PawPrint, Dumbbell, Car, type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "womens-clothing" | "mens-clothing" | "beauty-makeup" | "personal-care"
  | "fashion-lifestyle" | "health-wellness" | "baby-care" | "home-kitchen"
  | "cleaning-supplies" | "stationery-office" | "pet-care" | "toys-sports"
  | "vehicle-essentials";

export const categories: { id: CategoryId; name: string; icon: LucideIcon; related: CategoryId[] }[] = [
  { id: "womens-clothing", name: "Women's Clothing", icon: Flower2, related: ["fashion-lifestyle", "beauty-makeup"] },
  { id: "mens-clothing", name: "Men's Clothing", icon: Shirt, related: ["fashion-lifestyle"] },
  { id: "beauty-makeup", name: "Beauty & Makeup", icon: Sparkles, related: ["personal-care"] },
  { id: "personal-care", name: "Personal Care", icon: Droplets, related: ["beauty-makeup", "health-wellness"] },
  { id: "fashion-lifestyle", name: "Fashion & Lifestyle", icon: Glasses, related: ["womens-clothing", "mens-clothing"] },
  { id: "health-wellness", name: "Health & Wellness", icon: HeartPulse, related: ["personal-care", "toys-sports"] },
  { id: "baby-care", name: "Baby Care", icon: Baby, related: ["personal-care"] },
  { id: "home-kitchen", name: "Home & Kitchen", icon: CookingPot, related: ["cleaning-supplies"] },
  { id: "cleaning-supplies", name: "Cleaning Supplies", icon: SprayCan, related: ["home-kitchen"] },
  { id: "stationery-office", name: "Stationery & Office", icon: PenTool, related: [] },
  { id: "pet-care", name: "Pet Care", icon: PawPrint, related: [] },
  { id: "toys-sports", name: "Toys & Sports", icon: Dumbbell, related: ["health-wellness"] },
  { id: "vehicle-essentials", name: "Vehicle Essentials", icon: Car, related: [] },
];

export const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)?.name ?? id;
