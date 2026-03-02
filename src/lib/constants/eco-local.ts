import type {
  BusinessType,
  PledgeTier,
  OfferType,
  OfferStatus,
  RedemptionMode,
  VoucherStatus,
} from "@/types/domain";

export const BUSINESS_TYPE_CONFIG: Record<
  BusinessType,
  { label: string; description: string; color: string }
> = {
  in_store: {
    label: "In-Store",
    description: "Physical location only",
    color: "var(--biz-type-in-store)",
  },
  online: {
    label: "Online",
    description: "Online presence with physical location",
    color: "var(--biz-type-online)",
  },
  hybrid: {
    label: "Hybrid",
    description: "Both physical and online",
    color: "var(--biz-type-hybrid)",
  },
  online_only: {
    label: "Online Only",
    description: "No physical storefront",
    color: "var(--biz-type-online)",
  },
};

export const PLEDGE_TIER_CONFIG: Record<
  PledgeTier,
  { label: string; description: string; color: string; colorFg: string; colorBg: string }
> = {
  starter: {
    label: "Starter",
    description: "Beginning the eco journey",
    color: "var(--pledge-starter)",
    colorFg: "var(--pledge-starter-fg)",
    colorBg: "var(--pledge-starter-bg)",
  },
  builder: {
    label: "Builder",
    description: "Actively improving sustainability",
    color: "var(--pledge-builder)",
    colorFg: "var(--pledge-builder-fg)",
    colorBg: "var(--pledge-builder-bg)",
  },
  leader: {
    label: "Leader",
    description: "Setting the standard for eco business",
    color: "var(--pledge-leader)",
    colorFg: "var(--pledge-leader-fg)",
    colorBg: "var(--pledge-leader-bg)",
  },
};

export const OFFER_TYPE_CONFIG: Record<
  OfferType,
  { label: string; icon: string; color: string; colorFg: string }
> = {
  discount: {
    label: "Discount",
    icon: "Percent",
    color: "var(--offer-discount)",
    colorFg: "var(--offer-discount-fg)",
  },
  free_item: {
    label: "Free Item",
    icon: "Gift",
    color: "var(--offer-free-item)",
    colorFg: "var(--offer-free-item-fg)",
  },
  bonus: {
    label: "Bonus ECO",
    icon: "Zap",
    color: "var(--offer-bonus)",
    colorFg: "var(--offer-bonus-fg)",
  },
  experience: {
    label: "Experience",
    icon: "Sparkles",
    color: "var(--offer-experience)",
    colorFg: "var(--offer-experience-fg)",
  },
  gift: {
    label: "Gift",
    icon: "Heart",
    color: "var(--offer-gift)",
    colorFg: "var(--offer-gift-fg)",
  },
  custom: {
    label: "Custom",
    icon: "Settings",
    color: "var(--offer-custom)",
    colorFg: "var(--offer-custom-fg)",
  },
};

export const OFFER_STATUS_CONFIG: Record<
  OfferStatus,
  { label: string; color: string; colorFg: string }
> = {
  active: { label: "Active", color: "var(--offer-active)", colorFg: "var(--offer-active-fg)" },
  paused: { label: "Paused", color: "var(--offer-paused)", colorFg: "var(--offer-paused-fg)" },
  hidden: { label: "Hidden", color: "var(--offer-hidden)", colorFg: "var(--offer-hidden-fg)" },
};

export const REDEMPTION_MODE_CONFIG: Record<
  RedemptionMode,
  { label: string; description: string }
> = {
  in_store_qr: { label: "In-Store QR", description: "Scan QR code at the store" },
  online_code: { label: "Online Code", description: "Enter discount code online" },
  hybrid: { label: "Hybrid", description: "Redeem in-store or online" },
  in_person: { label: "In Person", description: "Show voucher to staff" },
  code: { label: "Code", description: "Enter a unique code" },
  link: { label: "Link", description: "Follow a redemption link" },
};

export const VOUCHER_STATUS_CONFIG: Record<
  VoucherStatus,
  { label: string; color: string; colorFg: string }
> = {
  issued: { label: "Ready to Use", color: "var(--voucher-issued)", colorFg: "var(--voucher-issued-fg)" },
  verified: { label: "Verified", color: "var(--voucher-verified)", colorFg: "var(--voucher-verified-fg)" },
  consumed: { label: "Used", color: "var(--voucher-consumed)", colorFg: "var(--voucher-consumed-fg)" },
  expired: { label: "Expired", color: "var(--voucher-expired)", colorFg: "var(--voucher-expired-fg)" },
  void: { label: "Void", color: "var(--voucher-void)", colorFg: "var(--voucher-void-fg)" },
};

export const INDUSTRY_GROUPS = [
  "Food & Beverage",
  "Health & Wellness",
  "Fashion & Apparel",
  "Home & Garden",
  "Beauty & Personal Care",
  "Education & Training",
  "Travel & Tourism",
  "Arts & Culture",
  "Technology",
  "Sports & Fitness",
  "Automotive",
  "Pet Services",
  "Professional Services",
  "Retail",
  "Other",
] as const;

export const BUSINESS_SIZES = [
  "Sole Trader",
  "Micro (1-4)",
  "Small (5-19)",
  "Medium (20-199)",
  "Large (200+)",
] as const;

export const STANDARD_CATEGORIES = {
  eco: [
    "100% Renewable Energy",
    "Zero Waste Policy",
    "Carbon Neutral",
    "B Corp Certified",
    "Plastic Free",
    "Composting Program",
    "Water Conservation",
  ],
  sustainability: [
    "Locally Sourced",
    "Fair Trade",
    "Organic Certified",
    "Sustainable Packaging",
    "Ethical Supply Chain",
    "Upcycled Materials",
    "Regenerative Practices",
  ],
  social: [
    "Living Wage Employer",
    "Community Supported",
    "Indigenous Owned",
    "Women Led",
    "Social Enterprise",
    "Disability Inclusive",
    "Youth Employment",
  ],
} as const;

/** Default hours template for a business */
export const DEFAULT_HOURS_MAP = {
  mon: { open: "09:00", close: "17:00", closed: false },
  tue: { open: "09:00", close: "17:00", closed: false },
  wed: { open: "09:00", close: "17:00", closed: false },
  thu: { open: "09:00", close: "17:00", closed: false },
  fri: { open: "09:00", close: "17:00", closed: false },
  sat: { open: "10:00", close: "14:00", closed: false },
  sun: { open: "", close: "", closed: true },
} as const;

export const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** Default reward rules for new businesses */
export const DEFAULT_REWARD_RULES = {
  first_visit: 50,
  return_visit: 10,
  cooldown_hours: 24,
  daily_cap_per_user: 3,
  geofence_radius_m: 100,
} as const;
