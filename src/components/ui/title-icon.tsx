import React, { ElementType } from "react";

type Variant = "default" | "warning" | "info" | "destructive" | "success";

const variantClasses = {
  default: {
    border: "border-primary",
    bg: "bg-primary-40",
    text: "text-primary",
  },
  warning: {
    border: "border-warning",
    bg: "bg-warning-40",
    text: "text-warning",
  },
  info: {
    border: "border-info",
    bg: "bg-info-40",
    text: "text-info",
  },
  success: {
    border: "border-success",
    bg: "bg-success-40",
    text: "text-success",
  },
  destructive: {
    border: "border-destructive",
    bg: "bg-destructive-40",
    text: "text-destructive",
  },
};

interface TitleIconProps {
  icon: ElementType;
  variant?: Variant;
}

export const TitleIcon: React.FC<TitleIconProps> = ({ icon, variant = "default" }) => {
  const Icon = icon;
  const { border, bg, text } = variantClasses[variant];
  return (
    <div
      className={`rounded-lg border ${border} ${bg} ${text} flex items-center justify-center w-11 h-11 aspect-square`}
    >
      <Icon className="h-6 w-6" />
    </div>
  );
};

interface SimpleTitleIconProps {
  icon: ElementType;
  variant?: Variant;
}

export const SimpleTitleIcon: React.FC<SimpleTitleIconProps> = ({ icon, variant = "default" }) => {
  const Icon = icon;
  const { bg, text } = variantClasses[variant];
  return (
    <div className={`rounded-lg ${bg} ${text} flex items-center justify-center w-8 h-8 aspect-square`}>
      <Icon className="h-4 w-4" />
    </div>
  );
};

interface SquareTitleIconProps {
  icon?: ElementType;
  emoji?: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: { container: "w-12 h-12", emoji: "text-2xl", icon: "h-5 w-5" },
  md: { container: "w-16 h-16", emoji: "text-4xl", icon: "h-6 w-6" },
  lg: { container: "w-48 h-48", emoji: "text-7xl", icon: "h-12 w-12" },
};

export const SquareTitleIcon: React.FC<SquareTitleIconProps> = ({ icon, emoji, variant = "default", size = "md" }) => {
  const Icon = icon;
  const { bg, text } = variantClasses[variant];
  const sizes = sizeClasses[size];

  return (
    <div className={`relative ${sizes.container}`}>
      <div className={`absolute inset-0 ${bg} rounded-lg rotate-12 opacity-20`}></div>
      <div className={`absolute inset-2 ${bg} rounded-lg -rotate-12 opacity-40`}></div>
      <div className={`absolute inset-2 flex items-center justify-center ${text}`}>
        {emoji ? <span className={sizes.emoji}>{emoji}</span> : Icon ? <Icon className={sizes.icon} /> : null}
      </div>
    </div>
  );
};

export const SimpleSquareTitleIcon: React.FC<SquareTitleIconProps> = ({
  icon,
  emoji,
  variant = "default",
  size = "md",
}) => {
  const Icon = icon;
  const { bg, text } = variantClasses[variant];
  const sizes = sizeClasses[size];

  return (
    <div className={`relative ${sizes.container}`}>
      <div className={`absolute inset-2 ${bg} rounded-lg -rotate-12 opacity-40`}></div>
      <div className={`absolute inset-2 flex items-center justify-center ${text}`}>
        {emoji ? <span className={sizes.emoji}>{emoji}</span> : Icon ? <Icon className={sizes.icon} /> : null}
      </div>
    </div>
  );
};
