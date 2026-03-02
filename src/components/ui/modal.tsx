"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "max-w-none mx-4",
} as const;

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  showClose?: boolean;
  preventBackdropClose?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
  preventBackdropClose = false,
}: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: "var(--ec-z-modal)" }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "var(--surface-scrim)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={preventBackdropClose ? undefined : onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "card pad-4 relative w-full pb-safe neo-shadow-lg",
              sizeClasses[size]
            )}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 touch-target active-push inline-flex items-center justify-center rounded-full t-muted hover:t-strong transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {title && (
              <h3 className={cn("uppercase", showClose && "pr-8")}>{title}</h3>
            )}
            {description && (
              <p className="t-muted text-fluid-sm mt-1">{description}</p>
            )}

            <div className={cn((title || description) && "mt-4")}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
