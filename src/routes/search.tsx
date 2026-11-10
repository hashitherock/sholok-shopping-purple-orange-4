import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/shop/products";
import { searchProducts } from "@/lib/shop/search";
import { ListingPage } from "@/components/shop/ListingPage";
export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: typeof search["q"] === "string" ? search["q"] : "" }),
  head: () => ({ meta: [{ title: "Product Search | SHOLOK" }, { name: "description", content: "Search SHOLOK products, categories and brands." }, { property: "og:title", content: "Product Search | SHOLOK" }, { property: "og:description", content: "Find your next favorite at SHOLOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: SearchPage,
});
function SearchPage() { const { q } = Route.useSearch(); return <ListingPage title={`Results for “${q}”`} items={q ? searchProducts(products, q) : []} />; }