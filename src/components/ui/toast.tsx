"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useHaptic } from "@/lib/hooks/use-haptics";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantConfig: Record<
  ToastVariant,
  { icon: React.ComponentType<{ className?: string }>; bg: string; fg: string; border: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "var(--ec-mint-50)",
    fg: "var(--ec-forest-800)",
    border: "var(--ec-mint-200)",
  },
  error: {
    icon: XCircle,
    bg: "#fef2f2",
    fg: "#b91c1c",
    border: "#fecaca",
  },
  warning: {
    icon: AlertTriangle,
    bg: "var(--ec-gold-50)",
    fg: "var(--ec-gold-800)",
    border: "var(--ec-gold-200)",
  },
  info: {
    icon: Info,
    bg: "var(--surface-subtle)",
    fg: "var(--text-base)",
    border: "var(--border)",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const haptic = useHaptic();

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant }]);

      if (variant === "success") haptic.notify("success");
      if (variant === "error") haptic.notify("error");
      if (variant === "warning") haptic.notify("warning");
    },
    [haptic]
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
        style={{ zIndex: "calc(var(--ec-z-modal) + 1)" }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const config = variantConfig[t.variant];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto flex items-center gap-2 pad-2 rounded-xl text-fluid-sm font-medium shadow-lg"
      style={{
        background: config.bg,
        color: config.fg,
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{t.message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
