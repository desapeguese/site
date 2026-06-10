import React from "react";
import { Badge } from "../ui/badge";
import { SpotlightCard } from "../ui/spotlightcard";
import { SimpleTitleIcon } from "../ui/title-icon";
import { CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export interface SimpleCardProps {
  title: string;
  description: string;
  tags?:
    | {
        icon: React.JSX.ElementType;
        label: string;
      }[]
    | undefined;
  icon: React.JSX.ElementType;
  isLoading?: boolean;
}

export const SimpleIconCard = ({ ...props }: SimpleCardProps) => {
  const ElementTypeIcon = props.icon as React.ElementType;
  return (
    <SpotlightCard className="w-full h-full" spotlightColor="34, 211, 238">
      <div className="flex flex-col justify-start gap-2 pr-12">
        <div className="flex gap-2 items-center">
          <CardTitle className="flex items-center gap-4">
            <SimpleTitleIcon icon={ElementTypeIcon} />
            {props.isLoading ? <Skeleton className="h-6 w-40" /> : props.title}
          </CardTitle>
        </div>

        <div className="flex flex-col gap-1 lg:gap-2">
          {props.isLoading ? (
            <Skeleton className="h-5 w-full" />
          ) : (
            <span className="body-paragraph">{props.description}</span>
          )}
        </div>

        {props.tags && props.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {props.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs gap-1">
                <tag.icon className="h-4 w-4" />
                {tag.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </SpotlightCard>
  );
};
