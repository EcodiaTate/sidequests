import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsNavCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  variant?: "default" | "danger";
};

export function SettingsNavCard({
  icon: Icon,
  label,
  href,
  variant = "default",
}: SettingsNavCardProps) {
  return (
    <Link
      href={href}
      className="card card-interactive active-push touch-target flex items-center gap-3 pad-3"
      style={
        variant === "danger"
          ? { border: "var(--neo-border-thin) solid var(--ec-danger-border)", boxShadow: "var(--neo-shadow-sm)" }
          : { border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }
      }
    >
      <div
        style={{
          color:
            variant === "danger" ? "var(--ec-danger)" : "var(--text-muted)",
        }}
      >
        <Icon className={cn("w-5 h-5 shrink-0")} />
      </div>
      <span
        className={cn(
          "flex-1 text-fluid-sm font-medium",
          variant === "danger" ? "" : "t-strong"
        )}
        style={variant === "danger" ? { color: "var(--ec-danger)" } : undefined}
      >
        {label}
      </span>
      <ChevronRight className="w-4 h-4 t-muted shrink-0" />
    </Link>
  );
}
