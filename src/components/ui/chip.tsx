import { cn } from "@/lib/utils";

export type ChipProps = {
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>;

export function Chip({
  variant = "primary",
  icon,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn("chip", `chip-${variant}`, className)}
      {...props}
    >
      {icon && <span className="mr-1 inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
