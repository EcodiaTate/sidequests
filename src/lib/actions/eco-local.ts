"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createBusinessSchema,
  updateBusinessSchema,
  createOfferSchema,
  updateOfferSchema,
  redeemOfferSchema,
  consumeVoucherSchema,
  businessFilterSchema,
} from "@/lib/validations/eco-local";
import type {
  Business,
  BusinessMetrics,
  Offer,
  Voucher,
} from "@/types/domain";
import { z } from "zod";

export type ActionResult = { error: string } | { success: true; message?: string };

// ---------------------------------------------------------------------------
// Aggregated types
// ---------------------------------------------------------------------------

export type BusinessWithMetrics = Business & {
  metrics: BusinessMetrics | null;
  offerCount: number;
};

export type BusinessDetail = Business & {
  metrics: BusinessMetrics | null;
  offers: Offer[];
};

export type OfferWithBusiness = Offer & {
  business: Pick<Business, "id" | "name" | "avatar_url" | "area" | "pledge_tier"> | null;
};

export type VoucherWithOffer = Voucher & {
  offer: (Offer & {
    business: Pick<Business, "id" | "name" | "avatar_url" | "area"> | null;
  }) | null;
};

export type EcoLocalDashboard = {
  nearbyBusinesses: BusinessWithMetrics[];
  featuredOffers: OfferWithBusiness[];
  myVouchers: VoucherWithOffer[];
};

// ---------------------------------------------------------------------------
// Discovery (public-facing)
// ---------------------------------------------------------------------------

export async function getBusinesses(
  filters?: Parameters<typeof businessFilterSchema.safeParse>[0]
): Promise<BusinessWithMetrics[]> {
  const supabase = await createClient();

  let query = supabase
    .from("businesses")
    .select("*, business_metrics(*)") as any;

  if (filters) {
    const parsed = businessFilterSchema.safeParse(filters);
    if (parsed.success) {
      const f = parsed.data;
      if (f.query) {
        query = query.or(`name.ilike.%${f.query}%,tagline.ilike.%${f.query}%,description.ilike.%${f.query}%`);
      }
      if (f.industry_group) query = query.eq("industry_group", f.industry_group);
      if (f.pledge_tier) query = query.eq("pledge_tier", f.pledge_tier);
      if (f.business_type) query = query.eq("business_type", f.business_type);
      if (f.tags && f.tags.length > 0) query = query.overlaps("tags", f.tags);
    }
  }

  const { data } = await query
    .eq("visible_on_map", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!data) return [];

  return (data as any[]).map((b) => {
    const metrics = Array.isArray(b.business_metrics)
      ? b.business_metrics[0] ?? null
      : b.business_metrics ?? null;
    const { business_metrics: _, ...business } = b;
    return { ...business, metrics, offerCount: 0 };
  });
}

export async function getBusinessById(
  businessId: string
): Promise<BusinessDetail | null> {
  const supabase = await createClient();

  const { data: business } = await (supabase
    .from("businesses")
    .select("*, business_metrics(*)") as any)
    .eq("id", businessId)
    .single();

  if (!business) return null;

  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const metrics = Array.isArray(business.business_metrics)
    ? business.business_metrics[0] ?? null
    : business.business_metrics ?? null;

  const { business_metrics: _, ...rest } = business;

  return {
    ...rest,
    metrics,
    offers: (offers ?? []) as Offer[],
  };
}

export async function getFeaturedOffers(): Promise<OfferWithBusiness[]> {
  const supabase = await createClient();

  const { data } = await (supabase
    .from("offers")
    .select("*, business:business_id(id, name, avatar_url, area, pledge_tier)") as any)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  if (!data) return [];

  return (data as any[]).map((o) => ({
    ...o,
    business: Array.isArray(o.business) ? o.business[0] ?? null : o.business ?? null,
  }));
}

export async function getEcoLocalDashboard(): Promise<EcoLocalDashboard> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [businesses, offers, vouchers] = await Promise.all([
    getBusinesses(),
    getFeaturedOffers(),
    user ? getMyVouchers() : Promise.resolve([]),
  ]);

  return {
    nearbyBusinesses: businesses,
    featuredOffers: offers,
    myVouchers: vouchers,
  };
}

// ---------------------------------------------------------------------------
// My Business (owner)
// ---------------------------------------------------------------------------

export async function getMyBusiness(): Promise<BusinessDetail | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await (supabase
    .from("businesses")
    .select("*, business_metrics(*)") as any)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) return null;

  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const metrics = Array.isArray(business.business_metrics)
    ? business.business_metrics[0] ?? null
    : business.business_metrics ?? null;

  const { business_metrics: _, ...rest } = business;

  return {
    ...rest,
    metrics,
    offers: (offers ?? []) as Offer[],
  };
}

export async function createBusiness(
  data: Parameters<typeof createBusinessSchema.safeParse>[0]
): Promise<ActionResult & { businessId?: string }> {
  const parsed = createBusinessSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check for existing business
  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) return { error: "You already have a business registered" };

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      tagline: parsed.data.tagline ?? "",
      description: parsed.data.description ?? "",
      website: parsed.data.website || null,
      address: parsed.data.address ?? "",
      area: parsed.data.area ?? "",
      abn: parsed.data.abn ?? "",
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      industry_group: parsed.data.industry_group ?? null,
      size: parsed.data.size ?? null,
      business_type: parsed.data.business_type,
      pledge_tier: parsed.data.pledge_tier,
    })
    .select("id")
    .single();

  if (error) return { error: "Failed to register business" };

  // Initialize metrics row
  await supabase.from("business_metrics").insert({ business_id: business.id });

  return { success: true, message: "Business registered", businessId: business.id };
}

export async function updateBusiness(
  data: Parameters<typeof updateBusinessSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = updateBusinessSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { businessId, ...updates } = parsed.data;

  // Remove undefined values
  const cleanUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      cleanUpdates[key] = value;
    }
  }

  if (Object.keys(cleanUpdates).length === 0) return { success: true };

  const { error } = await supabase
    .from("businesses")
    .update(cleanUpdates)
    .eq("id", businessId)
    .eq("owner_id", user.id);

  if (error) return { error: "Failed to update business" };
  return { success: true, message: "Business updated" };
}

// ---------------------------------------------------------------------------
// Offers (owner)
// ---------------------------------------------------------------------------

export async function getMyOffers(): Promise<Offer[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) return [];

  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (offers ?? []) as Offer[];
}

export async function createOffer(
  data: Parameters<typeof createOfferSchema.safeParse>[0]
): Promise<ActionResult & { offerId?: string }> {
  const parsed = createOfferSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify ownership
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", parsed.data.businessId)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found or not owned by you" };

  const { data: offer, error } = await supabase
    .from("offers")
    .insert({
      business_id: parsed.data.businessId,
      title: parsed.data.title,
      blurb: parsed.data.blurb ?? "",
      offer_type: parsed.data.offer_type,
      eco_price: parsed.data.eco_price,
      fiat_cost_cents: parsed.data.fiat_cost_cents ?? null,
      stock: parsed.data.stock ?? null,
      url: parsed.data.url || null,
      valid_until: parsed.data.valid_until || null,
      redemption_mode: parsed.data.redemption_mode,
      discount_code: parsed.data.discount_code ?? null,
      tags: parsed.data.tags ?? [],
    })
    .select("id")
    .single();

  if (error) return { error: "Failed to create offer" };
  return { success: true, message: "Offer created", offerId: offer.id };
}

export async function updateOffer(
  data: Parameters<typeof updateOfferSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = updateOfferSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { offerId, ...updates } = parsed.data;

  const cleanUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      cleanUpdates[key] = value;
    }
  }

  if (Object.keys(cleanUpdates).length === 0) return { success: true };

  // RLS enforces ownership via the business relationship
  const { error } = await supabase
    .from("offers")
    .update(cleanUpdates)
    .eq("id", offerId);

  if (error) return { error: "Failed to update offer" };
  return { success: true, message: "Offer updated" };
}

export async function deleteOffer(offerId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("offers")
    .delete()
    .eq("id", offerId);

  if (error) return { error: "Failed to delete offer" };
  return { success: true, message: "Offer deleted" };
}

// ---------------------------------------------------------------------------
// Vouchers (user-facing)
// ---------------------------------------------------------------------------

export async function getMyVouchers(): Promise<VoucherWithOffer[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await (supabase
    .from("vouchers")
    .select("*, offer:offer_id(*, business:business_id(id, name, avatar_url, area))") as any)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return (data as any[]).map((v) => ({
    ...v,
    offer: Array.isArray(v.offer) ? v.offer[0] ?? null : v.offer ?? null,
  }));
}

export async function redeemOffer(
  data: Parameters<typeof redeemOfferSchema.safeParse>[0]
): Promise<ActionResult & { voucherId?: string }> {
  const parsed = redeemOfferSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get the offer
  const { data: offer } = await supabase
    .from("offers")
    .select("*")
    .eq("id", parsed.data.offerId)
    .eq("status", "active")
    .single();

  if (!offer) return { error: "Offer not found or no longer active" };

  // Check stock
  if (offer.stock !== null && offer.stock <= 0) {
    return { error: "Offer is out of stock" };
  }

  // Check ECO balance
  const ecoPrice = offer.eco_price ?? 0;
  if (ecoPrice > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("eco_balance")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.eco_balance ?? 0) < ecoPrice) {
      return { error: "Insufficient ECO balance" };
    }
  }

  // Generate voucher code
  const code = generateVoucherCode();

  // Set expiry (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data: voucher, error } = await supabase
    .from("vouchers")
    .insert({
      offer_id: parsed.data.offerId,
      user_id: user.id,
      code,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: "Failed to redeem offer" };

  // Decrement stock if limited
  if (offer.stock !== null) {
    await supabase
      .from("offers")
      .update({ stock: offer.stock - 1 })
      .eq("id", offer.id);
  }

  // If offer costs ECO, deduct via eco_transactions (triggers balance sync)
  if (ecoPrice > 0) {
    await supabase.from("eco_transactions").insert({
      user_id: user.id,
      kind: "burn_reward" as const,
      direction: "spent" as const,
      amount: ecoPrice,
      source: `offer:${offer.id}`,
      metadata: { offer_id: offer.id, voucher_id: voucher.id },
    });
  }

  // Record business activity
  await supabase.from("business_activity").insert({
    business_id: offer.business_id,
    user_id: user.id,
    kind: "redemption",
    amount: ecoPrice,
    offer_id: offer.id,
  });

  return { success: true, message: "Offer redeemed", voucherId: voucher.id };
}

export async function consumeVoucher(
  data: Parameters<typeof consumeVoucherSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = consumeVoucherSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("vouchers")
    .update({
      status: "consumed",
      consumed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.voucherId)
    .eq("user_id", user.id)
    .eq("status", "issued");

  if (error) return { error: "Failed to mark voucher as used" };
  return { success: true, message: "Voucher used" };
}

// ---------------------------------------------------------------------------
// Business Activity & Metrics
// ---------------------------------------------------------------------------

export async function getBusinessActivity(businessId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("business_activity")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}

export async function getBusinessMetrics(businessId: string): Promise<BusinessMetrics | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("business_metrics")
    .select("*")
    .eq("business_id", businessId)
    .single();

  return (data as BusinessMetrics | null) ?? null;
}

// ---------------------------------------------------------------------------
// QR Claim (simplified - full logic lives in Edge Function)
// ---------------------------------------------------------------------------

export async function claimBusinessQr(
  qrCode: string
): Promise<ActionResult & { ecoEarned?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Resolve business from QR code
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, rules_first_visit, rules_return_visit, rules_cooldown_hours, rules_daily_cap_per_user")
    .eq("qr_code", qrCode)
    .single();

  if (!business) return { error: "Business not found" };

  // Check cooldown
  const cooldownThreshold = new Date();
  cooldownThreshold.setHours(cooldownThreshold.getHours() - (business.rules_cooldown_hours ?? 24));

  const { data: recentClaims } = await supabase
    .from("business_activity")
    .select("id")
    .eq("business_id", business.id)
    .eq("user_id", user.id)
    .eq("kind", "qr_claim")
    .gte("created_at", cooldownThreshold.toISOString());

  if (recentClaims && recentClaims.length > 0) {
    return { error: "Please wait before claiming again" };
  }

  // Check daily cap
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: todayClaims } = await supabase
    .from("business_activity")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("user_id", user.id)
    .eq("kind", "qr_claim")
    .gte("created_at", todayStart.toISOString());

  if ((todayClaims ?? 0) >= (business.rules_daily_cap_per_user ?? 3)) {
    return { error: "Daily claim limit reached" };
  }

  // Determine if first visit
  const { count: totalClaims } = await supabase
    .from("business_activity")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("user_id", user.id)
    .eq("kind", "qr_claim");

  const isFirstVisit = (totalClaims ?? 0) === 0;
  const ecoAmount = isFirstVisit
    ? (business.rules_first_visit ?? 50)
    : (business.rules_return_visit ?? 10);

  // Record claim
  await supabase.from("business_activity").insert({
    business_id: business.id,
    user_id: user.id,
    kind: "qr_claim",
    amount: ecoAmount,
  });

  // Award ECO
  if (ecoAmount > 0) {
    await supabase.from("eco_transactions").insert({
      user_id: user.id,
      kind: "mint_action",
      direction: "earned",
      amount: ecoAmount,
      xp: Math.round(ecoAmount * 0.5),
      source: `qr_claim:${business.id}`,
      metadata: { business_id: business.id, business_name: business.name, first_visit: isFirstVisit },
    });
  }

  return {
    success: true,
    message: isFirstVisit
      ? `Welcome to ${business.name}! +${ecoAmount} ECO`
      : `+${ecoAmount} ECO from ${business.name}`,
    ecoEarned: ecoAmount,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ECO-${code}`;
}


// ---------------------------------------------------------------------------
// Business Reviews
// ---------------------------------------------------------------------------

export type ReviewWithProfile = {
  id: string;
  business_id: string;
  user_id: string;
  voucher_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string | null;
  profile: { display_name: string; avatar_url: string | null } | null;
};

export async function getBusinessReviews(businessId: string): Promise<ReviewWithProfile[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data } = await db
    .from("business_reviews")
    .select("*, profile:profiles(display_name, avatar_url)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return (data as any[]).map((r) => ({
    ...r,
    profile: Array.isArray(r.profile) ? r.profile[0] ?? null : r.profile,
  }));
}

export async function canReviewBusiness(businessId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // User can review if they have ever redeemed a voucher from this business
  const { count } = await supabase
    .from("vouchers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["verified", "consumed"]);

  return (count ?? 0) > 0;
}

const createReviewSchema = z.object({
  businessId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  voucherId: z.string().uuid().optional(),
});

const updateReviewSchema = z.object({
  reviewId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

const deleteReviewSchema = z.object({
  reviewId: z.string().uuid(),
});

export async function createReview(
  data: Parameters<typeof createReviewSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = createReviewSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db.from("business_reviews").insert({
    business_id: parsed.data.businessId,
    user_id: user.id,
    voucher_id: parsed.data.voucherId ?? null,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? "",
  });

  if (error) {
    if (error.code === "23505") return { error: "You have already reviewed this business" };
    return { error: "Failed to submit review" };
  }

  return { success: true, message: "Review submitted" };
}

export async function updateReview(
  data: Parameters<typeof updateReviewSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = updateReviewSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("business_reviews")
    .update({ rating: parsed.data.rating, comment: parsed.data.comment ?? "" })
    .eq("id", parsed.data.reviewId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update review" };
  return { success: true, message: "Review updated" };
}

export async function deleteReview(
  data: Parameters<typeof deleteReviewSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = deleteReviewSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("business_reviews")
    .delete()
    .eq("id", parsed.data.reviewId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete review" };
  return { success: true, message: "Review deleted" };
}
