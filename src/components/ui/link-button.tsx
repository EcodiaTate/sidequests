import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "text-xs px-3 py-1.5",
  md: "",
  lg: "text-base px-6 py-3",
} as const;

export type LinkButtonProps = {
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "alive" | "butter";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
} & React.ComponentProps<typeof Link>;

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth,
  active,
  icon,
  iconRight,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(
        "btn",
        `btn-${variant}`,
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      data-active={active || undefined}
      {...props}
    >
      {icon && <span className="mr-2 inline-flex shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="ml-2 inline-flex shrink-0">{iconRight}</span>}
    </Link>
  );
}
