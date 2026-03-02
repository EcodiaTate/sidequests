import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const paddingClasses = {
  none: "",
  sm: "pad-2",
  md: "pad-3",
  lg: "pad-4",
} as const;

export type CardProps = {
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
} & React.HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive, padding = "none", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card",
          interactive && "card-interactive",
          paddingClasses[padding],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
