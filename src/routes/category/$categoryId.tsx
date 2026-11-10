import { createFileRoute, notFound } from "@tanstack/react-router";
import { categories } from "@/lib/shop/categories";
import { products } from "@/lib/shop/products";
import { ListingPage } from "@/components/shop/ListingPage";
export const Route = createFileRoute("/category/$categoryId")({
  loader: ({ params }) => { const category = categories.find((c) => c.id === params.categoryId); if (!category) throw notFound(); return { name: category.name, id: category.id }; },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.name ?? "Category"} | SHOLOK` }, { name: "description", content: `Browse ${loaderData?.name ?? "products"} at SHOLOK.` }, { property: "og:title", content: `${loaderData?.name ?? "Category"} | SHOLOK` }, { property: "og:description", content: "Discover fashion and essentials with SHOLOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: CategoryPage,
});
function CategoryPage() { const category = Route.useLoaderData(); return <ListingPage title={category.name} items={products.filter((p) => p.category === category.id)} />; }