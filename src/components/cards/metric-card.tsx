import React, { ElementType } from "react";
import { cn } from "@/lib/utils";
import { SimpleTitleIcon } from "@/components/ui/title-icon";

interface MetricCardProps {
  icon: ElementType;
  value: string;
  label: string;
  variant?: "default" | "warning" | "info" | "destructive" | "success";
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  variant = "default",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:bg-primary-5/50 transition-colors",
        className
      )}
    >
      <SimpleTitleIcon icon={icon} variant={variant} />
      <div className="flex flex-col gap-1">
        <div className="heading-02-bold text-foreground break-words">{value}</div>
        <p className="body-paragraph text-muted-foreground leading-relaxed">{label}</p>
      </div>
    </div>
  );
};
