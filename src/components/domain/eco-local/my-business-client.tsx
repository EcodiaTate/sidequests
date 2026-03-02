"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Tag,
  BarChart3,
  Settings,
  Plus,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { BusinessForm } from "./business-form";
import { OfferForm } from "./offer-form";
import { MetricsPanel } from "./metrics-panel";
import { OfferStatusPill } from "./offer-status-pill";
import { PledgeBadge } from "./pledge-badge";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { BusinessDetail } from "@/lib/actions/eco-local";

type Tab = "overview" | "offers" | "metrics" | "settings";

type Props = {
  business: BusinessDetail | null;
};

export function MyBusinessClient({ business }: Props) {
  const router = useRouter();
  const haptics = useHaptic();
  const [tab, setTab] = useState<Tab>("overview");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!business) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={<Store className="w-12 h-12" />}
          title="Register Your Business"
          description="List your eco-friendly business on Ecodia to connect with conscious consumers"
          action={
            <Button
              variant="alive"
              onClick={() => setShowBusinessForm(true)}
            >
              Get Started
            </Button>
          }
        />
        <Modal
          open={showBusinessForm}
          onClose={() => setShowBusinessForm(false)}
          title="Register Your Business"
          size="lg"
        >
          <BusinessForm
            onSaved={() => {
              setShowBusinessForm(false);
              router.refresh();
            }}
          />
        </Modal>
      </div>
    );
  }

  function handleCopyQr() {
    if (!business?.qr_code) return;
    navigator.clipboard.writeText(business.qr_code);
    setCopied(true);
    haptics.selection();
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Business header */}
      <Card padding="md" style={{ border: "var(--neo-border-mid) solid var(--border)", boxShadow: "var(--neo-shadow-md)" }}>
        <div className="flex items-center gap-3">
          {business.avatar_url ? (
            <img src={business.avatar_url} alt="" className="w-12 h-12 rounded-full border border-border" />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface-subtle)" }}
            >
              <Store className="w-6 h-6" style={{ color: "var(--text-subtle)" }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-fluid-lg uppercase truncate">{business.name}</h2>
            <div className="flex items-center gap-2">
              <PledgeBadge tier={business.pledge_tier ?? "starter"} />
              {business.area && <span className="text-fluid-xs t-muted">{business.area}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* QR Code */}
      {business.qr_code && (
        <Card padding="md" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5" style={{ color: "var(--ec-mint-500)" }} />
              <div>
                <p className="text-fluid-xs t-muted">QR Code</p>
                <code className="text-fluid-sm font-mono">{business.qr_code}</code>
              </div>
            </div>
            <button onClick={handleCopyQr} className="active-push touch-target p-2">
              {copied ? (
                <Check className="w-4 h-4" style={{ color: "var(--ec-mint-500)" }} />
              ) : (
                <Copy className="w-4 h-4 t-muted" />
              )}
            </button>
          </div>
        </Card>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--surface-subtle)" }}>
        {(
          [
            { key: "overview" as Tab, label: "Overview", icon: <Store className="w-4 h-4" /> },
            { key: "offers" as Tab, label: "Offers", icon: <Tag className="w-4 h-4" /> },
            { key: "metrics" as Tab, label: "Metrics", icon: <BarChart3 className="w-4 h-4" /> },
            { key: "settings" as Tab, label: "Settings", icon: <Settings className="w-4 h-4" /> },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-fluid-xs font-medium transition-all active-push ${
              tab === t.key ? "shadow-sm" : "t-muted"
            }`}
            style={tab === t.key ? { background: "var(--surface-elevated)", color: "var(--text-strong)" } : {}}
            onClick={() => {
              haptics.impact("light");
              setTab(t.key);
            }}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {business.description && (
            <Card padding="md" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
              <p className="text-fluid-sm whitespace-pre-wrap">{business.description}</p>
            </Card>
          )}
          {/* Quick stats */}
          {business.metrics && (
            <div className="grid grid-cols-3 gap-3">
              <Card padding="sm" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
                <div className="text-center pad-2">
                  <p className="text-fluid-lg font-bold tabular-nums" style={{ color: "var(--ec-mint-600)" }}>
                    {business.metrics.eco_triggered_30d ?? 0}
                  </p>
                  <p className="text-fluid-xs t-muted">ECO / 30d</p>
                </div>
              </Card>
              <Card padding="sm" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
                <div className="text-center pad-2">
                  <p className="text-fluid-lg font-bold tabular-nums" style={{ color: "var(--ec-gold-500)" }}>
                    {business.metrics.claims_30d ?? 0}
                  </p>
                  <p className="text-fluid-xs t-muted">Claims</p>
                </div>
              </Card>
              <Card padding="sm" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
                <div className="text-center pad-2">
                  <p className="text-fluid-lg font-bold tabular-nums" style={{ color: "var(--ec-purple-500, #9b59b6)" }}>
                    {business.metrics.redemptions_30d ?? 0}
                  </p>
                  <p className="text-fluid-xs t-muted">Redemptions</p>
                </div>
              </Card>
            </div>
          )}
          <p className="text-fluid-xs t-muted">
            {business.offers.length} active offer{business.offers.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
      )}

      {tab === "offers" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              haptics.impact("medium");
              setShowOfferForm(true);
            }}
          >
            New Offer
          </Button>

          {business.offers.length === 0 ? (
            <EmptyState
              icon={<Tag className="w-10 h-10" />}
              title="No offers yet"
              description="Create your first offer to attract customers"
            />
          ) : (
            business.offers.map((offer) => (
              <Card key={offer.id} interactive padding="md" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-fluid-sm font-semibold truncate">{offer.title}</h4>
                    {offer.blurb && (
                      <p className="text-fluid-xs t-muted line-clamp-1">{offer.blurb}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-fluid-xs font-medium" style={{ color: "var(--ec-mint-600)" }}>
                        {(offer.eco_price ?? 0) > 0 ? `${offer.eco_price} ECO` : "Free"}
                      </span>
                      {offer.stock !== null && (
                        <span className="text-fluid-xs t-muted">{offer.stock} left</span>
                      )}
                    </div>
                  </div>
                  <OfferStatusPill status={offer.status ?? "active"} />
                </div>
              </Card>
            ))
          )}

          <Modal
            open={showOfferForm}
            onClose={() => setShowOfferForm(false)}
            title="Create Offer"
            size="lg"
          >
            <OfferForm
              businessId={business.id}
              onSaved={() => {
                setShowOfferForm(false);
                router.refresh();
              }}
            />
          </Modal>
        </motion.div>
      )}

      {tab === "metrics" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {business.metrics ? (
            <MetricsPanel metrics={business.metrics} />
          ) : (
            <EmptyState
              icon={<BarChart3 className="w-10 h-10" />}
              title="No data yet"
              description="Metrics will appear as customers interact with your business"
            />
          )}
        </motion.div>
      )}

      {tab === "settings" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BusinessForm
            business={business}
            onSaved={() => router.refresh()}
          />
        </motion.div>
      )}
    </div>
  );
}
