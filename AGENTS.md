<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Product catalog and shop settings stay in `src/lib/shop/` (single source + `config.ts`); accounts, profiles, addresses, wishlist and orders live in Lovable Cloud with per-user RLS, wired through `src/lib/shop/store.tsx`. Why: one catalog source keeps search/filters in sync while customer data must work across devices.
- Orders are read-only for customers; inserts must go through a server function that recomputes prices and shipping. Why: browser-sent totals cannot be trusted.
- Mount ShopShell and ShopProvider around the root Outlet so cart, wishlist, compare and delivery state remain shared across shopping routes; retain existing device-local persistence for this frontend demo.
- Resolve flash-sale pricing through the shared pricing module for product displays and cart totals so expired promotional prices cannot remain in a separate interface.
