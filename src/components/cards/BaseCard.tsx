export interface BaseCardProps {
  children: JSX.Element;
  variant?: "default" | "dashboard" | "dashboard-mini";
  className?: string;
}

export const BaseCard = ({ children, variant = "default", className }: BaseCardProps) => {
  let baseClass;

  switch (variant) {
    case "dashboard":
      baseClass = "flex flex-col rounded-[.75rem] w-full gap-8 p-4 md:p-6 bg-card border-[.0313rem] relative";
      break;

    case "dashboard-mini":
      baseClass = "flex flex-col rounded-[.75rem] w-full gap-8 p-4 md:p-5 bg-card border-[.0313rem] relative";
      break;

    case "default":
      baseClass =
        "flex flex-col rounded-2xl md:rounded-3xl w-full gap-8 p-6 md:p-10 lg:p-12 bg-card border border-border relative";
      break;
  }

  return <div className={`${baseClass} ${className}`}>{children}</div>;
};
