import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Phone, MapPin, ChevronDown, Search, X, User, Heart, ShoppingCart, Menu, LayoutGrid, Store,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { shopConfig, formatPrice } from "@/lib/shop/config";
import { categories } from "@/lib/shop/categories";
import { products } from "@/lib/shop/products";
import { searchProducts } from "@/lib/shop/search";
import { useShop, scrollToId } from "@/lib/shop/store";

export function Logo() {
  return (
    <a href="/" aria-label="SHOLOK home" className="shrink-0 font-logo text-2xl leading-none text-primary md:text-[28px]">SHOLOK</a>
  );
}

export function TopBar() {
  return (
    <div className="bg-primary-deep text-primary-foreground">
      <div className="container-shop flex h-9 items-center justify-between gap-4 text-xs">
        <p className="truncate">
          <span className="font-semibold">Welcome to Sholok Shopping!</span>
          <span className="ml-2 hidden opacity-80 sm:inline">Discover products you'll love.</span>
        </p>
        {shopConfig.phone && <a href={`tel:${shopConfig.phone.tel}`} className="flex shrink-0 items-center gap-1.5 font-medium hover:underline">
          <Phone className="size-3.5" aria-hidden />
          <span className="sr-only">Call us:</span>
          {shopConfig.phone.display}
        </a>}
      </div>
    </div>
  );
}

function DeliveryLocation() {
  const { location, openDialog } = useShop();
  return (
    <Button variant="plain"
      onClick={() => openDialog("location")}
      className="flex items-center gap-2 rounded-lg border border-border px-2 py-2 text-left transition-colors hover:border-primary hover:bg-primary-soft"
    >
      <MapPin className="size-5 text-primary" aria-hidden />
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] text-muted-foreground">Deliver to</span>
        <span className="flex max-w-32 items-center gap-1 text-sm font-semibold">
          <span className="truncate">{location ?? "Select Location"}</span> <ChevronDown className="size-3.5 shrink-0" aria-hidden />
        </span>
      </span>
    </Button>
  );
}

function ProductSearch() {
  const { submitSearch, openProduct, view } = useShop();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (view?.type === "search") setQ(view.query); }, [view]);

  const suggestions = useMemo(() => (q.trim().length >= 2 ? searchProducts(products, q).slice(0, 6) : []), [q]);
  const catSuggestions = useMemo(
    () => (q.trim().length >= 2 ? categories.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 2) : []),
    [q],
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const submit = (value = q) => { submitSearch(value); setOpen(false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % suggestions.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1)); }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" && active >= 0) { e.preventDefault(); const selected = suggestions[active]; if (selected) openProduct(selected.id); setOpen(false); }
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex h-11 overflow-hidden rounded-md border border-primary bg-surface md:h-12">
        <label htmlFor="site-search" className="sr-only">Search products</label>
        <input
          id="site-search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search for products, brands and more..."
          autoComplete="off"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="search-suggestions"
          aria-activedescendant={active >= 0 ? `sugg-${active}` : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground md:px-5"
        />
        {q && (
          <Button variant="plain" type="button" onClick={() => { setQ(""); setActive(-1); }} aria-label="Clear search" className="px-2 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </Button>
        )}
        <Button variant="plain" type="submit" aria-label="Search" className="flex items-center gap-2 bg-sale px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-sale/90 md:px-6">
          <Search className="size-4" aria-hidden /> <span className="hidden md:inline">Search</span>
        </Button>
      </form>
      {open && (suggestions.length > 0 || catSuggestions.length > 0) && (
        <div id="search-suggestions" role="listbox" className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-card">
          {catSuggestions.map((c) => (
            <Button variant="plain" key={c.id} type="button" onClick={() => submit(c.name)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-primary-soft">
              <c.icon className="size-4 text-primary" aria-hidden /> Search in <strong>{c.name}</strong>
            </Button>
          ))}
          {suggestions.map((p, i) => (
            <Button variant="plain"
              id={`sugg-${i}`}
              key={p.id}
              role="option"
              aria-selected={i === active}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => { openProduct(p.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm ${i === active ? "bg-primary-soft" : ""}`}
            >
              <img src={p.image} alt="" className="size-9 rounded-md bg-muted object-contain" />
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              <span className="font-semibold text-primary">{formatPrice(p.sellingPrice)}</span>
            </Button>
          ))}
          <Button variant="plain" type="button" onClick={() => submit()} className="w-full border-t border-border px-4 py-2.5 text-left text-sm font-semibold text-primary hover:bg-primary-soft">
            See all results for "{q}"
          </Button>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, label, sub, count, onClick }: { icon: typeof User; label: string; sub?: string; count?: number; onClick: () => void }) {
  return (
    <Button variant="plain" onClick={onClick} className="group flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-primary-soft" aria-label={count !== undefined ? `${label}, ${count} items` : label}>
      <span className="relative">
        <Icon className="size-6 text-foreground group-hover:text-primary" aria-hidden />
        {count !== undefined && (
          <span className="absolute -right-2 -top-1.5 grid min-w-4.5 place-items-center rounded-full bg-sale px-1 text-[10px] font-bold leading-4.5 text-sale-foreground">{count}</span>
        )}
      </span>
      <span className="hidden flex-col text-left leading-tight xl:flex">
        <span className="text-[11px] text-muted-foreground">{sub}</span>
        <span className="text-sm font-semibold">{label}</span>
      </span>
    </Button>
  );
}

export function MainHeader() {
  const { openDialog, wishlist, cartCount, cartTotal } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="border-b border-border bg-surface">
        <div className="container-shop flex flex-wrap items-center gap-2 py-3 xl:flex-nowrap md:gap-3 md:py-4">
          <Button variant="plain" className="rounded-md p-1.5 hover:bg-muted lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu className="size-6" />
          </Button>
          <Logo />
          <DeliveryLocation />
          <div className="order-last w-full xl:order-none xl:min-w-32 xl:flex-1"><ProductSearch /></div>
          <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
            <ActionButton icon={User} sub="Login" label="My Account" onClick={() => openDialog("account")} />
            <ActionButton icon={Heart} sub={`${wishlist.length} Favorite`} label="My Wishlist" count={wishlist.length} onClick={() => openDialog("wishlist")} />
            <ActionButton icon={ShoppingCart} sub={`${cartCount} Your Cart:`} label={formatPrice(cartTotal)} count={cartCount} onClick={() => openDialog("cart")} />
          </div>
        </div>
      </div>
      <MainNavigation />
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}

function useNavActions() {
  const { setView, openDialog } = useShop();
  return [
    { label: "Home", run: () => { setView(null); window.scrollTo({ top: 0, behavior: "smooth" }); } },
    { label: "Shop", run: () => setView({ type: "all" }) },
    { label: "Flash Sale", run: () => { setView(null); setTimeout(() => scrollToId("flash-sale"), 150); } },
    { label: "Trending", run: () => { setView(null); setTimeout(() => scrollToId("trending"), 150); } },
    { label: "New Arrivals", run: () => { setView(null); setTimeout(() => scrollToId("new-arrivals"), 150); } },
    { label: "Offers", run: () => openDialog("offer") },
  ];
}

function MainNavigation() {
  const { showCategory, view, openDialog } = useShop();
  const actions = useNavActions();
  const selected = view?.type === "category" ? view.id : null;
  return (
    <nav aria-label="Main" className="sticky top-0 z-30 hidden bg-primary text-primary-foreground shadow-card lg:block">
      <div className="container-shop flex h-12 items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="mr-4 flex h-12 w-64 shrink-0 items-center gap-2 bg-primary-deep px-4 text-sm font-semibold">
            <LayoutGrid className="size-4" aria-hidden /> SHOP BY CATEGORY <ChevronDown className="ml-auto size-4" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {categories.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => showCategory(c.id)} className={selected === c.id ? "bg-primary-soft font-semibold text-primary" : ""}>
                <c.icon className="size-4 text-primary" aria-hidden /> {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {actions.map((a) => (
          <Button variant="plain" key={a.label} onClick={a.run} className="rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-primary-deep">
            {a.label}
          </Button>
        ))}
        <Button variant="plain" onClick={() => openDialog("seller")} className="ml-auto flex items-center gap-2 rounded-md border border-primary-foreground/40 px-2 py-1.5 text-sm font-semibold transition-colors hover:bg-primary-foreground hover:text-primary">
          <Store className="size-4" aria-hidden /> Become a Seller
        </Button>
      </div>
    </nav>
  );
}

function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { showCategory, openDialog, location } = useShop();
  const actions = useNavActions();
  const close = (fn: () => void) => () => { onOpenChange(false); fn(); };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 overflow-y-auto p-0">
        <SheetHeader className="border-b border-border p-4"><SheetTitle className="text-left"><Logo /></SheetTitle></SheetHeader>
        <Button variant="plain" onClick={close(() => openDialog("location"))} className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-sm">
          <MapPin className="size-4 text-primary" aria-hidden /> Deliver to: <strong className="truncate">{location ?? "Select Location"}</strong>
        </Button>
        <nav aria-label="Mobile" className="p-2">
          {actions.map((a) => (
            <Button variant="plain" key={a.label} onClick={close(a.run)} className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-primary-soft">{a.label}</Button>
          ))}
          <Button variant="plain" onClick={close(() => openDialog("seller"))} className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-primary-soft">Become a Seller</Button>
        </nav>
        <p className="px-5 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">SHOP BY CATEGORY</p>
        <ul className="p-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Button variant="plain" onClick={close(() => showCategory(c.id))} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-primary-soft">
                <c.icon className="size-4 text-primary" aria-hidden /> {c.name}
              </Button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
