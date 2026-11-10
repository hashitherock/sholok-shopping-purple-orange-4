import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/shop/products";
import { ListingPage } from "@/components/shop/ListingPage";
export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop All Products | SHOLOK" }, { name: "description", content: "Browse SHOLOK fashion, beauty and everyday essentials in BDT." }, { property: "og:title", content: "Shop All Products | SHOLOK" }, { property: "og:description", content: "Browse every SHOLOK category." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <ListingPage title="Shop All Products" items={products} />,
});