import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, Zap, RotateCcw, SearchX, Sparkles } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { isCampaignActive, shopConfig } from "@/lib/shop/config";
import { categories, categoryName, type CategoryId } from "@/lib/shop/categories";
import { products } from "@/lib/shop/products";
import { recommend, searchProducts } from "@/lib/shop/search";
import { useShop } from "@/lib/shop/store";
import { ProductCard, ProductGrid } from "./ProductCard";
import campaignImg from "@/assets/campaign.jpg";

function SectionHeader({ id, title, subtitle, children }: { id: string; title: ReactNode; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-2xl font-bold md:text-[28px]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function ResultsSection() {
  const { view, setView } = useShop();
  const { title, items, subtitle } = useMemo(() => {
    if (!view) return { title: "", items: [], subtitle: "" };
    if (view.type === "all") return { title: "Shop All Products", items: products, subtitle: `${products.length} products across 13 categories` };
    if (view.type === "category") {
      const list = products.filter((p) => p.category === view.id);
      return { title: categoryName(view.id), items: list, subtitle: `${list.length} products` };
    }
    const list = searchProducts(products, view.query);
    return { title: <>Results for “{view.query}”</>, items: list, subtitle: `${list.length} matching products` };
  }, [view]);

  if (!view) return <div id="results" />;
  return (
    <section id="results" aria-labelledby="results-title" className="scroll-mt-16">
      <SectionHeader id="results-title" title={title} subtitle={subtitle}>
        <Button variant="plain" onClick={() => setView(null)} className="text-sm font-semibold text-primary hover:underline">Close</Button>
      </SectionHeader>
      {items.length ? (
        <ProductGrid items={items} />
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary"><SearchX className="size-7" /></span>
          <h3 className="text-lg font-bold">No products found</h3>
          <p className="max-w-sm text-sm text-muted-foreground">Try a different word, or browse one of our categories.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {categories.slice(0, 5).map((c) => (
              <Button variant="plain" key={c.id} onClick={() => setView({ type: "category", id: c.id })} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary">{c.name}</Button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function useCountdown(target: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => { const remaining = Math.max(0, end - Date.now()); setLeft(remaining); if (remaining === 0) window.clearInterval(t); };
    const t = window.setInterval(tick, 1000);
    tick();
    return () => window.clearInterval(t);
  }, [target]);
  return left;
}

function Countdown({ ms }: { ms: number | null }) {
  if (ms === 0) return <span className="rounded-lg bg-muted px-3 py-2 text-sm font-bold text-muted-foreground">Sale Ended</span>;
  const s = ms === null ? null : Math.floor(ms / 1000);
  const parts = s === null
    ? [["--", "Days"], ["--", "Hrs"], ["--", "Min"], ["--", "Sec"]]
    : [[Math.floor(s / 86400), "Days"], [Math.floor((s % 86400) / 3600), "Hrs"], [Math.floor((s % 3600) / 60), "Min"], [s % 60, "Sec"]];
  return (
    <div className="flex items-center gap-1.5" role="timer" aria-label="Time left in flash sale">
      <span className="mr-1 text-xs font-medium text-muted-foreground">Ends in</span>
      {parts.map(([v, l]) => (
        <span key={l as string} className="flex min-w-11 flex-col items-center rounded-lg bg-sale px-1.5 py-1 text-sale-foreground">
          <span className="font-display text-base font-bold tabular-nums leading-none">{typeof v === "number" ? String(v).padStart(2, "0") : v}</span>
          <span className="text-[9px] uppercase tracking-wide opacity-90">{l}</span>
        </span>
      ))}
    </div>
  );
}

export function FlashSaleSection() {
  const { setView } = useShop();
  const left = useCountdown(shopConfig.flashSale.endsAt);
  const ended = left === 0;
  const items = useMemo(() => products.filter((p) => p.isFlashSale && p.discountPercentage > 0 && p.inStock), []);
  return (
    <section id="flash-sale" aria-labelledby="flash-title" className="scroll-mt-16 border-y-2 border-sale/30 bg-sale-soft py-5">
      <SectionHeader id="flash-title" title={<span className="flex items-center gap-2"><Zap className="size-6 fill-sale text-sale" aria-hidden />Flash Sale</span>} subtitle={ended ? "This sale has ended. Check back for new deals." : "Limited-time deals on selected products."}>
        <div className="flex flex-wrap items-center gap-4">
          <Countdown ms={left} />
          <Button variant="plain" onClick={() => setView({ type: "all" })} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View All <ArrowRight className="size-4" aria-hidden /></Button>
        </div>
      </SectionHeader>
      {!ended && (
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
          <CarouselContent className="-ml-3 md:-ml-4">
            {items.map((p) => (
              <CarouselItem key={p.id} className="basis-1/2 pl-3 sm:basis-1/3 md:pl-4 lg:basis-1/4 xl:basis-1/6"><ProductCard product={p} /></CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 hidden bg-surface md:flex" />
          <CarouselNext className="-right-3 hidden bg-surface md:flex" />
        </Carousel>
      )}
    </section>
  );
}

export function TrendingSection() {
  const all = useMemo(() => products.filter((p) => p.isTrending), []);
  const cats = useMemo(() => categories.filter((c) => all.some((p) => p.category === c.id)), [all]);
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const items = (filter === "all" ? all : all.filter((p) => p.category === filter)).slice(0, 10);
  return (
    <section id="trending" aria-labelledby="trending-title" className="scroll-mt-16">
      <SectionHeader id="trending-title" title="Trending Items" subtitle="Popular picks worth discovering." />
      <div className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Filter trending items">
        {[{ id: "all" as const, name: "All" }, ...cats].map((c) => (
          <Button variant="plain" key={c.id} role="tab" aria-selected={filter === c.id} onClick={() => setFilter(c.id)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${filter === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary hover:text-primary"}`}>
            {c.name}
          </Button>
        ))}
      </div>
      <ProductGrid items={items} />
    </section>
  );
}

export function MainCampaignBanner() {
  const { setView } = useShop();
  const [active, setActive] = useState(false);
  useEffect(() => { const tick = () => setActive(isCampaignActive()); tick(); const t = window.setInterval(tick, 1000); return () => clearInterval(t); }, []);
  return (
    <section aria-label="Seasonal offer" className="group relative overflow-hidden rounded-2xl bg-muted">
      <img src={campaignImg} alt="Woman in a plum suit and sunglasses" width={1600} height={640} loading="lazy" className="absolute inset-0 size-full object-cover object-right transition-transform duration-700 group-hover:scale-[1.02]" />
      <div className="banner-scrim absolute inset-0" />
      <div className="relative flex min-h-72 max-w-xl flex-col justify-center gap-2 p-6 md:min-h-96 md:p-14">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-sale">Special Seasonal Offer</span>
        <h2 className="text-4xl font-extrabold tracking-tight text-primary-deep md:text-6xl">EVERYDAY STYLE</h2>
        <p className="text-lg font-semibold text-foreground/80 md:text-xl">Discover More, Love More</p>
        {active && <p className="text-base">Save up to <span className="rounded-md bg-sale px-2 py-0.5 font-display text-xl font-bold text-sale-foreground">{shopConfig.campaign.discountPercent}% OFF</span></p>}
        <Button variant="plain" onClick={() => setView({ type: "category", id: "fashion-lifestyle" })} className="mt-3 flex w-fit items-center gap-2 rounded-md bg-sale px-7 py-3 text-sm font-semibold text-sale-foreground shadow-lift transition-transform hover:-translate-y-0.5">
          Shop Now <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </section>
  );
}

export function NewArrivalsSection() {
  const items = useMemo(() => products.filter((p) => p.isNewArrival).slice(0, 10), []);
  return (
    <section id="new-arrivals" aria-labelledby="new-title" className="scroll-mt-16">
      <SectionHeader id="new-title" title="New Arrivals" subtitle="Fresh additions across the store." />
      <ProductGrid items={items} />
    </section>
  );
}

export function ShopByCategory() {
  const { showCategory } = useShop();
  return (
    <section aria-labelledby="sbc-title">
      <SectionHeader id="sbc-title" title="Shop by Category" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7 xl:grid-cols-13">
        {categories.map((c) => (
          <Button variant="plain" key={c.id} onClick={() => showCategory(c.id)} className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-3 text-center transition-colors hover:border-primary">
            <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><c.icon className="size-5" aria-hidden /></span>
            <span className="whitespace-normal text-xs font-medium leading-tight">{c.name}</span>
          </Button>
        ))}
      </div>
    </section>
  );
}

export function MoreToLoveSection() {
  const { lastSearch, seed, clearSearchContext } = useShop();
  const rec = useMemo(() => recommend(products, lastSearch, seed), [lastSearch, seed]);
  return (
    <section id="more-to-love" aria-labelledby="mtl-title" className="scroll-mt-16">
      <SectionHeader id="mtl-title" title={<span className="flex items-center gap-2"><Sparkles className="size-6 text-primary" aria-hidden />More to Love</span>} >
        {rec.basedOn && (
          <div className="flex items-center gap-2 rounded-full bg-primary-soft py-1 pl-3 pr-1 text-xs">
            <span>Based on your search: <strong className="text-primary">{rec.basedOn}</strong></span>
            <Button variant="plain" onClick={clearSearchContext} className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 font-semibold hover:text-primary" aria-label="Reset recommendations">
              <RotateCcw className="size-3" aria-hidden /> Reset
            </Button>
          </div>
        )}
      </SectionHeader>
      <ProductGrid items={rec.items} />
    </section>
  );
}
