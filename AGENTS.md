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
- Storefront is frontend-only: all products, categories and demo settings live in `src/lib/shop/` (single mock data source + `config.ts`); shared cart/wishlist/search state is in `src/lib/shop/store.tsx`. Why: the brief forbids backend/API; one source keeps search, filters and recommendations in sync.
- Mount ShopShell and ShopProvider around the root Outlet so cart, wishlist, compare and delivery state remain shared across shopping routes; retain existing device-local persistence for this frontend demo.
- Resolve flash-sale pricing through the shared pricing module for product displays and cart totals so expired promotional prices cannot remain in a separate interface.
