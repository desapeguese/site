import Image from "next/image";
import React, { ElementType } from "react";
import { Badge } from "../ui/badge";

export interface ImagemDestaqueCardProps {
  image: {
    imageBoxColor: string;
    imageSrc: string;
    imageAlt: string;
  };
  infos: {
    title: string;
    description: string;
    tags?: {
      icon: ElementType;
      label: string;
    }[];
  };
}

export const ImagemDestaqueCard = ({ ...props }: ImagemDestaqueCardProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-10 items-center w-full">
      <div
        className="lg:col-span-2 flex items-center justify-center w-full px-4 py-4 md:px-12 md:py-8 rounded-xl h-full"
        style={{ backgroundColor: props.image.imageBoxColor }}
      >
        <Image
          src={props.image.imageSrc}
          alt={props.image.imageAlt}
          width={600}
          height={400}
          quality={100}
          sizes="600px"
          className="w-full h-auto object-cover rounded-lg aspect-video overflow-hidden transition-transform duration-500 ease-in-out hover:scale-105"
          priority
        />
      </div>

      <div className="flex flex-col-reverse lg:flex-col gap-2 lg:gap-7">
        <div className="flex flex-col gap-1 lg:gap-2">
          <span className="heading-05-medium">{props.infos.title}</span>
          <span className="body-paragraph">{props.infos.description}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {props.infos.tags?.map((tag, index) => (
            <React.Fragment key={index}>
              <Badge key={index} variant="outlinePrimary" className="text-xs gap-1">
                <tag.icon className="h-4 w-4" />
                {tag.label}
              </Badge>
              {index < (props.infos.tags?.length ?? 0) - 1 && (
                <span className="body-paragraph-bold text-primary select-none">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
