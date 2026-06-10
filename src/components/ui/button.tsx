import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";

export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, loadingText, children, icon: Icon, href, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : Link;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        href={href}
        aria-disabled={loading || props["aria-disabled"]}
        tabIndex={loading ? -1 : props.tabIndex}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            <span>{loadingText || "Carregando..."}</span>
          </>
        ) : (
          <>
            {Icon && <Icon />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
LinkButton.displayName = "LinkButton";

const buttonVariants = cva(
  "body-paragraph-bold inline-flex items-center justify-center gap-3 rounded-xl leading-none ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 whitespace-nowrap font-semibold shadow-md hover:shadow-lg active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-background hover:bg-primary-90 hover:text-foreground shadow-primary/30",
        card: "bg-card text-primary hover:bg-accent hover:text-accent-foreground shadow-card",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-destructive/30",
        warning: "bg-warning text-warning-foreground hover:bg-warning-hover shadow-warning/30",
        success: "bg-success text-success-foreground hover:bg-success-hover shadow-success/30",
        info: "bg-info text-info-foreground hover:bg-info-hover shadow-info/30",
        secondary: "bg-secondary text-[#0B1B12] hover:bg-secondary-hover shadow-secondary/30",
        outline: "border-2 border-input bg-transparent hover:bg-accent hover:text-accent-foreground shadow-sm",
        outlinePrimary: "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 shadow-sm",
        outlineDestructive:
          "border-2 border-destructive text-destructive bg-transparent hover:bg-destructive-5 shadow-sm",
        outlineWarning: "border-2 border-warning text-warning bg-transparent hover:bg-warning-5 shadow-sm",
        outlineSuccess: "border-2 border-success text-success bg-transparent hover:bg-success-5 shadow-sm",
        outlineInfo: "border-2 border-info text-info bg-transparent hover:bg-info-5 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-hover underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "px-8 py-4 text-base min-h-[3rem] w-fit",
        sm: "px-5 py-2.5 text-sm min-h-[2.5rem]",
        lg: "px-10 py-5 text-lg min-h-[3.5rem]",
        icon: "h-12 w-12",
        link: "w-fit py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={loading || props.disabled}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            <span>{loadingText || "Carregando..."}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, LinkButton, buttonVariants };
