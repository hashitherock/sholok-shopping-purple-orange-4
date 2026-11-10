import type { ComponentType } from "react";
import { makeCategoryIcon } from "./category-icons";

export type CategoryId =
  | "womens-clothing" | "mens-clothing" | "beauty-makeup" | "personal-care"
  | "fashion-lifestyle" | "health-wellness" | "baby-care" | "home-kitchen"
  | "cleaning-supplies" | "stationery-office" | "pet-care" | "toys-sports"
  | "vehicle-essentials";

export const categories: { id: CategoryId; name: string; icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>; related: CategoryId[] }[] = [
  { id: "womens-clothing", name: "Women's Clothing", icon: makeCategoryIcon("womens-clothing"), related: ["fashion-lifestyle", "beauty-makeup"] },
  { id: "mens-clothing", name: "Men's Clothing", icon: makeCategoryIcon("mens-clothing"), related: ["fashion-lifestyle"] },
  { id: "beauty-makeup", name: "Beauty & Makeup", icon: makeCategoryIcon("beauty-makeup"), related: ["personal-care"] },
  { id: "personal-care", name: "Personal Care", icon: makeCategoryIcon("personal-care"), related: ["beauty-makeup", "health-wellness"] },
  { id: "fashion-lifestyle", name: "Fashion & Lifestyle", icon: makeCategoryIcon("fashion-lifestyle"), related: ["womens-clothing", "mens-clothing"] },
  { id: "health-wellness", name: "Health & Wellness", icon: makeCategoryIcon("health-wellness"), related: ["personal-care", "toys-sports"] },
  { id: "baby-care", name: "Baby Care", icon: makeCategoryIcon("baby-care"), related: ["personal-care"] },
  { id: "home-kitchen", name: "Home & Kitchen", icon: makeCategoryIcon("home-kitchen"), related: ["cleaning-supplies"] },
  { id: "cleaning-supplies", name: "Cleaning Supplies", icon: makeCategoryIcon("cleaning-supplies"), related: ["home-kitchen"] },
  { id: "stationery-office", name: "Stationery & Office", icon: makeCategoryIcon("stationery-office"), related: [] },
  { id: "pet-care", name: "Pet Care", icon: makeCategoryIcon("pet-care"), related: [] },
  { id: "toys-sports", name: "Toys & Sports", icon: makeCategoryIcon("toys-sports"), related: ["health-wellness"] },
  { id: "vehicle-essentials", name: "Vehicle Essentials", icon: makeCategoryIcon("vehicle-essentials"), related: [] },
];

export const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)?.name ?? id;
