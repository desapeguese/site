import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 body-callout-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning-hover",
        success: "border-transparent bg-success text-success-foreground hover:bg-success-hover",
        info: "border-transparent bg-info text-info-foreground hover:bg-info-hover",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-border text-foreground hover:bg-accent",
        outlinePrimary: "border-primary text-primary bg-primary-5 hover:bg-primary-10",
        outlineDestructive: "border-destructive text-destructive bg-destructive-5 hover:bg-destructive-10",
        outlineWarning: "border-warning text-warning bg-warning-5 hover:bg-warning-10",
        outlineSuccess: "border-success text-success bg-success-5 hover:bg-success-10",
        outlineInfo: "border-info text-info bg-info-5 hover:bg-info-10",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
        muted: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        statusOpen: "bg-success-10 text-success-80 hover:bg-success-20",
        statusClosed: "bg-muted text-muted-foreground hover:bg-muted/80",
      },
      shiny: {
        true: "relative overflow-hidden",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const DOT_COLORS = {
  primary: { ping: "bg-primary", solid: "bg-primary-hover" },
  blue: { ping: "bg-blue-500", solid: "bg-blue-600" },
  green: { ping: "bg-green-500", solid: "bg-green-600" },
  purple: { ping: "bg-purple-500", solid: "bg-purple-600" },
  amber: { ping: "bg-amber-500", solid: "bg-amber-600" },
  cyan: { ping: "bg-cyan-500", solid: "bg-cyan-600" },
  violet: { ping: "bg-violet-500", solid: "bg-violet-600" },
} as const;

export type BadgeDotColor = keyof typeof DOT_COLORS;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  shiny?: boolean;
  shinySpeed?: number;
  dotColor?: BadgeDotColor;
}

function Badge({ className, variant, shiny = false, shinySpeed = 5, dotColor, children, ...props }: BadgeProps) {
  const animationDuration = `${shinySpeed}s`;
  const dotStyles = dotColor ? DOT_COLORS[dotColor] : null;

  return (
    <div className={cn(badgeVariants({ variant, shiny }), className)} {...props}>
      <span className={`inline-flex items-center gap-2 justify-center ${shiny ? "relative z-10" : ""}`}>
        {dotStyles && (
          <span className="relative flex size-4 shrink-0">
            <span
              className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", dotStyles.ping)}
            />
            <span className={cn("relative inline-flex size-4 rounded-full", dotStyles.solid)} />
          </span>
        )}
        {children}
      </span>

      {shiny && (
        <span
          className="absolute inset-0 pointer-events-none animate-shine dark:hidden"
          style={{
            background: "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animationDuration,
            mixBlendMode: "screen",
          }}
        />
      )}

      {shiny && (
        <span
          className="absolute inset-0 pointer-events-none animate-shine hidden dark:block"
          style={{
            background: "linear-gradient(120deg, transparent 40%, rgba(0,0,150,0.25) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animationDuration,
            mixBlendMode: "multiply",
          }}
        />
      )}
    </div>
  );
}

export { Badge, badgeVariants };
