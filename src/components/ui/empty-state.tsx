import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{
          color: "var(--text-subtle)",
          border: "var(--neo-border-thin) solid var(--border)",
          boxShadow: "var(--neo-shadow-sm)",
          background: "var(--surface-base)",
        }}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-fluid-lg uppercase">{title}</h3>
      {description && (
        <p className="t-muted text-fluid-sm mt-2 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
