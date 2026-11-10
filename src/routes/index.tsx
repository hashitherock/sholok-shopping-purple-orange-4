import { createFileRoute } from "@tanstack/react-router";
import { CategorySidebar, HeroSlider, MobileCategoryStrip, PromotionalBannerGrid } from "@/components/shop/Hero";
import {
  ResultsSection, FlashSaleSection, TrendingSection, MainCampaignBanner, NewArrivalsSection, ShopByCategory, MoreToLoveSection,
} from "@/components/shop/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sholok Shopping — Fashion, Beauty, Home & More" },
      { name: "description", content: "Shop women's and men's fashion, beauty, personal care, home, baby, pet and more at Sholok Shopping." },
      { property: "og:title", content: "Sholok Shopping — Discover More, Love More" },
      { property: "og:description", content: "Fashion, beauty, home and everyday essentials in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <main className="container-shop flex flex-col gap-10 py-5 md:gap-14 md:py-6">
        <div className="flex flex-col gap-4">
          <MobileCategoryStrip />
          <div className="flex gap-5"><CategorySidebar /><HeroSlider /></div>
          <PromotionalBannerGrid />
        </div>
        <FlashSaleSection />
        <TrendingSection />
        <MainCampaignBanner />
        <ShopByCategory />
        <NewArrivalsSection />
        <MoreToLoveSection />
      </main>
    </>
  );
}
