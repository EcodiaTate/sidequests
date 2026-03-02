import { z } from "zod";

// ── Business ──────────────────────────────────────────────────────────────

export const createBusinessSchema = z.object({
  name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Business name must be 120 characters or fewer")
    .trim(),
  tagline: z.string().max(200, "Tagline must be 200 characters or fewer").trim().optional().default(""),
  description: z.string().max(2000, "Description must be 2000 characters or fewer").trim().optional().default(""),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().max(300, "Address must be 300 characters or fewer").trim().optional().default(""),
  area: z.string().max(100).trim().optional().default(""),
  abn: z
    .string()
    .regex(/^(\d{2}\s?\d{3}\s?\d{3}\s?\d{3})?$/, "Invalid ABN format")
    .optional()
    .default(""),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  industry_group: z.string().optional(),
  size: z.string().optional(),
  business_type: z.enum(["in_store", "online", "hybrid", "online_only"]).default("in_store"),
  pledge_tier: z.enum(["starter", "builder", "leader"]).default("starter"),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

export const updateBusinessSchema = z.object({
  businessId: z.string().uuid("Invalid business"),
  name: z.string().min(2).max(120).trim().optional(),
  tagline: z.string().max(200).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().max(300).trim().optional(),
  area: z.string().max(100).trim().optional(),
  abn: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  industry_group: z.string().optional(),
  size: z.string().optional(),
  business_type: z.enum(["in_store", "online", "hybrid", "online_only"]).optional(),
  pledge_tier: z.enum(["starter", "builder", "leader"]).optional(),
  visible_on_map: z.boolean().optional(),
  hours_map: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean().optional(),
  })).optional(),
  standards_eco: z.array(z.string()).optional(),
  standards_sustainability: z.array(z.string()).optional(),
  standards_social: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  socials: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).optional(),
  rules_first_visit: z.number().int().min(0).optional(),
  rules_return_visit: z.number().int().min(0).optional(),
  rules_cooldown_hours: z.number().int().min(1).optional(),
  rules_daily_cap_per_user: z.number().int().min(1).optional(),
  rules_geofence_radius_m: z.number().int().min(0).optional(),
});

export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;

// ── Offer ─────────────────────────────────────────────────────────────────

export const createOfferSchema = z.object({
  businessId: z.string().uuid("Invalid business"),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title must be 120 characters or fewer")
    .trim(),
  blurb: z.string().max(500, "Blurb must be 500 characters or fewer").trim().optional().default(""),
  offer_type: z.enum(["discount", "free_item", "bonus", "experience", "gift", "custom"]),
  eco_price: z.number().int().min(0, "ECO price must be 0 or more").default(0),
  fiat_cost_cents: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  url: z.string().url().optional().or(z.literal("")),
  valid_until: z.string().datetime().optional().or(z.literal("")),
  redemption_mode: z
    .enum(["in_store_qr", "online_code", "hybrid", "in_person", "code", "link"])
    .default("in_store_qr"),
  discount_code: z.string().max(50).optional(),
  tags: z.array(z.string()).optional().default([]),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const updateOfferSchema = z.object({
  offerId: z.string().uuid("Invalid offer"),
  title: z.string().min(2).max(120).trim().optional(),
  blurb: z.string().max(500).trim().optional(),
  offer_type: z.enum(["discount", "free_item", "bonus", "experience", "gift", "custom"]).optional(),
  status: z.enum(["active", "paused", "hidden"]).optional(),
  eco_price: z.number().int().min(0).optional(),
  fiat_cost_cents: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  url: z.string().url().optional().or(z.literal("")),
  valid_until: z.string().datetime().optional().or(z.literal("")),
  redemption_mode: z.enum(["in_store_qr", "online_code", "hybrid", "in_person", "code", "link"]).optional(),
  discount_code: z.string().max(50).optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;

// ── Voucher / Redemption ──────────────────────────────────────────────────

export const redeemOfferSchema = z.object({
  offerId: z.string().uuid("Invalid offer"),
});

export type RedeemOfferInput = z.infer<typeof redeemOfferSchema>;

export const consumeVoucherSchema = z.object({
  voucherId: z.string().uuid("Invalid voucher"),
});

export type ConsumeVoucherInput = z.infer<typeof consumeVoucherSchema>;

// ── Discovery Filters ─────────────────────────────────────────────────────

export const businessFilterSchema = z.object({
  query: z.string().max(200).optional(),
  industry_group: z.string().optional(),
  pledge_tier: z.enum(["starter", "builder", "leader"]).optional(),
  business_type: z.enum(["in_store", "online", "hybrid", "online_only"]).optional(),
  near_lat: z.number().min(-90).max(90).optional(),
  near_lng: z.number().min(-180).max(180).optional(),
  radius_km: z.number().min(0.1).max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export type BusinessFilterInput = z.infer<typeof businessFilterSchema>;
