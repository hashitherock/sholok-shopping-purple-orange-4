// Central demo configuration. Replace placeholders with real values when available.
export const shopConfig = {
  currency: { symbol: "৳", locale: "en-BD", code: "BDT" },
  phone: { display: "+8801716509407", tel: "+8801716509407" },
  email: "sholoksell@gmail.com",
  dataMode: "sample",
  flashSale: { endsAt: "2026-12-31T23:59:59+06:00" },
  campaign: { discountPercent: 20, active: true, startsAt: "2026-01-01T00:00:00+06:00", endsAt: "2026-12-31T23:59:59+06:00" },
  offer: {
    active: true,
    startsAt: "2026-01-01T00:00:00+06:00",
    endsAt: "2026-12-31T23:59:59+06:00",
    headline: "A Little Something Special",
    copy: "Explore selected Sholok favorites with up to 25% off.",
    badge: "Up to 25% OFF",
    cta: "Explore Offers",
  },
  locations: [
    "Dhaka — Gulshan",
    "Dhaka — Dhanmondi",
    "Dhaka — Uttara",
    "Dhaka — Mirpur",
    "Chattogram",
    "Sylhet",
    "Khulna",
    "Rajshahi",
  ],
};

export function formatPrice(value: number) {
  const { symbol } = shopConfig.currency;
  return `${symbol}${value.toFixed(2)}`;
}

export function isFlashSaleActive(now = new Date()) {
  return now.getTime() < new Date(shopConfig.flashSale.endsAt).getTime();
}

export function isCampaignActive(now = new Date()) {
  const c = shopConfig.campaign;
  return c.active && now >= new Date(c.startsAt) && now < new Date(c.endsAt);
}

export function isOfferActive(now = new Date()) {
  const o = shopConfig.offer;
  if (!o.active) return false;
  return now >= new Date(o.startsAt) && now <= new Date(o.endsAt);
}
