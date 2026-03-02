"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, QrCode, Filter, MapPin, Tag, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BusinessCard } from "./business-card";
import { OfferCard } from "./offer-card";
import { VoucherCard } from "./voucher-card";
import { QrClaimModal } from "./qr-claim-modal";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { getBusinesses, redeemOffer } from "@/lib/actions/eco-local";
import { INDUSTRY_GROUPS, PLEDGE_TIER_CONFIG } from "@/lib/constants/eco-local";
import type { EcoLocalDashboard, BusinessWithMetrics, OfferWithBusiness } from "@/lib/actions/eco-local";
import type { PledgeTier } from "@/types/domain";

type Tab = "discover" | "offers" | "vouchers";

type Props = {
  initialData: EcoLocalDashboard;
};

export function EcoLocalClient({ initialData }: Props) {
  const router = useRouter();
  const haptics = useHaptic();
  const [tab, setTab] = useState<Tab>("discover");
  const [businesses, setBusinesses] = useState(initialData.nearbyBusinesses);
  const [offers] = useState(initialData.featuredOffers);
  const [vouchers, setVouchers] = useState(initialData.myVouchers);
  const [qrOpen, setQrOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [isSearching, startSearch] = useTransition();

  function handleTabChange(newTab: Tab) {
    haptics.impact("light");
    setTab(newTab);
  }

  function handleSearch() {
    startSearch(async () => {
      const results = await getBusinesses({
        query: searchQuery || undefined,
        industry_group: filterIndustry || undefined,
        pledge_tier: (filterTier as PledgeTier) || undefined,
      });
      setBusinesses(results);
    });
  }

  function handleBusinessClick(businessId: string) {
    haptics.impact("light");
    router.push(`/eco-local/${businessId}`);
  }

  function handleRedeemOffer(offer: OfferWithBusiness) {
    haptics.impact("medium");
    // Navigate to business detail to redeem in context
    if (offer.business) {
      router.push(`/eco-local/${offer.business.id}?offer=${offer.id}`);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--surface-subtle)" }}>
        {(
          [
            { key: "discover" as Tab, label: "Discover", icon: <MapPin className="w-4 h-4" /> },
            { key: "offers" as Tab, label: "Offers", icon: <Tag className="w-4 h-4" /> },
            { key: "vouchers" as Tab, label: "My Vouchers", icon: <Ticket className="w-4 h-4" /> },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-fluid-sm font-medium transition-all active-push ${
              tab === t.key ? "shadow-sm" : "t-muted"
            }`}
            style={tab === t.key ? { background: "var(--surface-elevated)", color: "var(--text-strong)" } : {}}
            onClick={() => handleTabChange(t.key)}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* QR Claim button */}
      <Button
        variant="alive"
        fullWidth
        icon={<QrCode className="w-5 h-5" />}
        onClick={() => {
          haptics.impact("medium");
          setQrOpen(true);
        }}
      >
        Scan QR to Earn ECO
      </Button>

      <AnimatePresence mode="wait">
        {/* ── Discover Tab ─────────────────────────────────────────────── */}
        {tab === "discover" && (
          <motion.div
            key="discover"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 t-muted pointer-events-none"
                />
                <Input
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  haptics.impact("light");
                  setShowFilters(!showFilters);
                }}
                icon={<Filter className="w-4 h-4" />}
              >
                Filter
              </Button>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="card pad-3 space-y-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-fluid-xs font-medium">Industry</label>
                        <select
                          value={filterIndustry}
                          onChange={(e) => setFilterIndustry(e.target.value)}
                          className="input"
                        >
                          <option value="">All Industries</option>
                          {INDUSTRY_GROUPS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-fluid-xs font-medium">Eco Pledge</label>
                        <select
                          value={filterTier}
                          onChange={(e) => setFilterTier(e.target.value)}
                          className="input"
                        >
                          <option value="">All Tiers</option>
                          {(Object.entries(PLEDGE_TIER_CONFIG) as [string, { label: string }][]).map(
                            ([value, config]) => (
                              <option key={value} value={value}>{config.label}</option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      loading={isSearching}
                      onClick={handleSearch}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            {businesses.length === 0 ? (
              <EmptyState
                icon={<MapPin className="w-10 h-10" />}
                title="No businesses found"
                description="Try adjusting your search or filters"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {businesses.map((biz) => (
                  <BusinessCard
                    key={biz.id}
                    business={biz}
                    onClick={() => handleBusinessClick(biz.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Offers Tab ─────────────────────────────────────────────── */}
        {tab === "offers" && (
          <motion.div
            key="offers"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3"
          >
            {offers.length === 0 ? (
              <EmptyState
                icon={<Tag className="w-10 h-10" />}
                title="No offers right now"
                description="Check back soon for deals from eco-friendly businesses"
              />
            ) : (
              offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onRedeem={() => handleRedeemOffer(offer)}
                />
              ))
            )}
          </motion.div>
        )}

        {/* ── Vouchers Tab ────────────────────────────────────────────── */}
        {tab === "vouchers" && (
          <motion.div
            key="vouchers"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3"
          >
            {vouchers.length === 0 ? (
              <EmptyState
                icon={<Ticket className="w-10 h-10" />}
                title="No vouchers yet"
                description="Redeem an offer to get your first voucher"
              />
            ) : (
              vouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onConsumed={() => {
                    setVouchers((prev) =>
                      prev.map((v) =>
                        v.id === voucher.id ? { ...v, status: "consumed" as const } : v
                      )
                    );
                  }}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <QrClaimModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onClaimed={() => router.refresh()}
      />
    </div>
  );
}
