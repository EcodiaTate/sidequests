import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SpinnerProps = {
  size?: number;
  className?: string;
};

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", className)}
      style={{ width: size, height: size, color: "var(--text-muted)" }}
    />
  );
}
