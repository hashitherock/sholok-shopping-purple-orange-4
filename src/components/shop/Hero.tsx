import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { categories, type CategoryId } from "@/lib/shop/categories";
import { useShop } from "@/lib/shop/store";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import heroHome from "@/assets/banner-home.jpg";
import bWomen from "@/assets/banner-women.jpg";
import bMen from "@/assets/banner-men.jpg";
import bHome from "@/assets/banner-home.jpg";
import bBaby from "@/assets/banner-baby.jpg";

export function CategorySidebar() {
  const { showCategory, view } = useShop();
  const selected = view?.type === "category" ? view.id : null;
  return (
    <aside className="hidden w-64 shrink-0 overflow-hidden rounded-lg border border-border bg-surface lg:block" aria-label="SHOP BY CATEGORY">
      <h2 className="border-b border-border px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary">SHOP BY CATEGORY</h2>
      <ul className="divide-y divide-border">
        {categories.map((c) => (
          <li key={c.id}>
            <Button variant="plain"
              onClick={() => showCategory(c.id)}
              aria-current={selected === c.id}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-soft hover:text-primary ${selected === c.id ? "bg-primary-soft font-semibold text-primary" : ""}`}
            >
              <c.icon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="flex-1">{c.name}</span>
              <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function MobileCategoryStrip() {
  const { showCategory, view } = useShop();
  const selected = view?.type === "category" ? view.id : null;
  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" role="list" aria-label="Categories">
      {categories.map((c) => (
        <Button variant="plain"
          key={c.id}
          role="listitem"
          onClick={() => showCategory(c.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selected === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary"}`}
        >
          <c.icon className="size-3.5" aria-hidden /> {c.name}
        </Button>
      ))}
    </div>
  );
}

const slides: { img: string; eyebrow: string; title: string; copy: string; cta: string; cat: CategoryId; secondary?: { label: string; cat: CategoryId } }[] = [
  { img: hero1, eyebrow: "New Season Edit", title: "Discover Your Everyday Style", copy: "Fresh silhouettes and easy favourites for every day of the week.", cta: "Shop Now", cat: "womens-clothing", secondary: { label: "Explore Lifestyle", cat: "fashion-lifestyle" } },
  { img: hero2, eyebrow: "Beauty Picks", title: "Style, Beauty & More — All in One Place", copy: "Makeup, skincare and fragrance chosen to make you glow.", cta: "Explore Collection", cat: "beauty-makeup", secondary: { label: "Personal Care", cat: "personal-care" } },
  { img: heroHome, eyebrow: "Home Refresh", title: "Find Your New Favorites", copy: "Thoughtful home and kitchen essentials that just work.", cta: "Discover More", cat: "home-kitchen" },
];

export function HeroSlider() {
  const { showCategory } = useShop();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduce) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => window.clearInterval(t);
  }, [paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative min-h-[400px] flex-1 overflow-hidden rounded-lg bg-primary-soft md:min-h-[440px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const touch = e.changedTouches[0];
        if (!touch) return;
        const dx = touch.clientX - touchX.current;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {slides.map((s, idx) => (
        <div
          key={s.title}
          role="group"
          aria-roledescription="slide"
          aria-label={`${idx + 1} of ${slides.length}`}
          aria-hidden={idx !== i}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <img src={s.img} alt="" width={1600} height={800} loading={idx === 0 ? "eager" : "lazy"} fetchPriority={idx === 0 ? "high" : "auto"} className="absolute inset-0 size-full object-cover object-right" />
          <div className="banner-scrim absolute inset-0" />
          <div className="relative flex h-full max-w-lg flex-col justify-center gap-3 p-6 pb-12 md:p-12">
            <span className="w-fit rounded-full bg-sale px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sale-foreground">{s.eyebrow}</span>
            <h2 className="text-3xl font-extrabold leading-tight text-primary-deep md:text-5xl">{s.title}</h2>
            <p className="max-w-sm text-sm text-foreground/80 md:text-base">{s.copy}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button variant="plain" tabIndex={idx === i ? 0 : -1} onClick={() => showCategory(s.cat)} className="flex items-center gap-2 rounded-md bg-sale px-6 py-3 text-sm font-semibold text-sale-foreground shadow-lift transition-transform hover:-translate-y-0.5">
                {s.cta} <ArrowRight className="size-4" aria-hidden />
              </Button>
              {s.secondary && (
                <Button variant="plain" tabIndex={idx === i ? 0 : -1} onClick={() => showCategory(s.secondary?.cat ?? s.cat)} className="rounded-full border border-primary bg-surface/70 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface">
                  {s.secondary.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
      <Button variant="plain" onClick={() => go(i - 1)} aria-label="Previous slide" className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-primary shadow-card hover:bg-surface md:grid">
        <ChevronLeft className="size-5" />
      </Button>
      <Button variant="plain" onClick={() => go(i + 1)} aria-label="Next slide" className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-primary shadow-card hover:bg-surface md:grid">
        <ChevronRight className="size-5" />
      </Button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, idx) => (
          <Button variant="plain" key={s.title} onClick={() => go(idx)} aria-label={`Go to slide ${idx + 1}`} aria-current={idx === i} className={`h-2 rounded-full transition-all ${idx === i ? "w-7 bg-primary" : "w-2 bg-primary/30"}`} />
        ))}
      </div>
    </section>
  );
}

const banners: { img: string; tag: string; title: string; copy: string; cta: string; cat: CategoryId }[] = [
  { img: bWomen, tag: "Women's Fashion", title: "New Season Styles", copy: "Refresh your wardrobe with modern essentials.", cta: "Shop Women", cat: "womens-clothing" },
  { img: bMen, tag: "Men's Fashion", title: "Everyday Comfort, Elevated", copy: "Casual looks made for every day.", cta: "Shop Men", cat: "mens-clothing" },
  { img: bHome, tag: "Home & Kitchen", title: "Make Home Feel Better", copy: "Thoughtful essentials for everyday living.", cta: "Shop Home", cat: "home-kitchen" },
  { img: bBaby, tag: "Baby Care", title: "Little Things, Big Care", copy: "Explore everyday essentials for little ones.", cta: "Shop Baby Care", cat: "baby-care" },
];

export function PromotionalBannerGrid() {
  const { showCategory } = useShop();
  return (
    <section aria-label="Promotions" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {banners.map((b) => (
        <article key={b.title} className="group relative h-64 overflow-hidden rounded-lg bg-muted">
          <img src={b.img} alt="" width={976} height={688} loading="lazy" className="absolute inset-0 size-full object-cover object-right transition-transform duration-500 group-hover:scale-105" />
          <div className="banner-scrim absolute inset-0" />
          <div className="relative flex h-full max-w-[85%] flex-col justify-center gap-1.5 p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sale">{b.tag}</span>
            <h3 className="text-lg font-bold leading-snug text-primary-deep">{b.title}</h3>
            <p className="text-xs text-foreground/75">{b.copy}</p>
            <Button variant="plain" onClick={() => showCategory(b.cat)} className="mt-1 flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {b.cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}
