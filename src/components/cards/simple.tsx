import { cn } from "@/lib/utils";
import { SimpleTitleIcon } from "../ui/title-icon";
import { ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

interface MCardBody1Props {
  card: {
    title: string;
    desc: string;
    icon?: ElementType;
  };
  className?: string;
}

interface MCardImageProps {
  card: {
    title: string;
    desc: string;
    imageUrl: string;
    link: string;
  };
  className?: string;
}

export const MCardBody1 = ({ card, className }: MCardBody1Props) => {
  return (
    <div className={cn(className, "flex flex-col gap-3")}>
      {card.icon && <SimpleTitleIcon icon={card.icon} />}
      <h3 className="body-title-bold ">{card.title}</h3>
      <p className="text-muted-foreground">{card.desc}</p>
    </div>
  );
};

export const MCardBody1Image = ({ card, className }: MCardImageProps) => {
  return (
    <div className={cn(className, "flex flex-col gap-3")}>
      <div className="relative w-full h-40 rounded-lg overflow-hidden">
        <Image src={card.imageUrl} alt={card.title} fill className="object-cover" />
      </div>
      <h3 className="body-title-bold ">{card.title}</h3>
      <p className="text-muted-foreground">{card.desc}</p>
      <Link
        href={card.link}
        className={buttonVariants({
          variant: "link",
          className: "w-fit p-0",
        })}
      >
        Saiba mais
      </Link>
    </div>
  );
};

export const MultiLayerCardBody1 = ({ card, className }: MCardBody1Props) => {
  return (
    <div className="py-6 w-full">
      <div className="relative mx-auto h-72 sm:h-52">
        <div
          className="bg-primary-50 absolute size-full rounded-3xl border border-border scale-y-[1.15] scale-x-90 -top-4"
          style={{ transformOrigin: "top center" }}
        ></div>
        <div
          className="absolute bg-card size-full rounded-3xl p-2 md:p-6 border border-border flex justify-start items-center "
          style={{ transformOrigin: "top center" }}
        >
          <slot>
            <MCardBody1 card={card} className={className} />
          </slot>
        </div>
      </div>
    </div>
  );
};

export const MultiLayerCardBody1Image = ({ card, className }: MCardImageProps) => {
  return (
    <div className="py-6 w-full">
      <div className="relative mx-auto h-full sm:h-[420px]">
        <div
          className="bg-primary-50 max-sm:hidden sm:absolute size-full rounded-3xl border border-border scale-y-[1.15] scale-x-90 -top-4"
          style={{ transformOrigin: "top center" }}
        ></div>
        <div
          className="sm:absolute bg-card size-full h-full rounded-3xl p-2 md:p-6 border border-border flex justify-center items-start "
          style={{ transformOrigin: "top center" }}
        >
          <slot>
            <MCardBody1Image card={card} className={className} />
          </slot>
        </div>
      </div>
    </div>
  );
};

export const MultiLayerCardBody2 = ({ card, className }: MCardBody1Props) => {
  return (
    <div className="w-full">
      <div className="relative mx-auto min-h-[22rem] sm:min-h-0 sm:h-64">
        <div
          className="bg-primary-50 absolute size-full rounded-3xl border border-border scale-y-[.75] top-6 scale-x-[1.01]"
          style={{ transformOrigin: "top center" }}
        ></div>
        <div
          className="absolute bg-card size-full rounded-3xl p-2 md:p-6 border border-border scale-95 flex justify-center items-center"
          style={{ transformOrigin: "top center" }}
        >
          <slot>
            <MCardBody1 card={card} className={className} />
          </slot>
        </div>
      </div>
    </div>
  );
};

export const MultiLayerCardBody2Image = ({ card, className }: MCardImageProps) => {
  return (
    <div className="w-full">
      <div className="relative mx-auto min-h-[22rem] sm:min-h-0 sm:h-[372px]">
        <div
          className="bg-primary-50 absolute size-full rounded-3xl border border-border scale-y-[.75] top-6 scale-x-[1.01]"
          style={{ transformOrigin: "top center" }}
        ></div>
        <div
          className="absolute bg-card size-full rounded-3xl p-2 md:p-6 border border-border scale-95 flex justify-center items-center"
          style={{ transformOrigin: "top center" }}
        >
          <slot>
            <MCardBody1Image card={card} className={className} />
          </slot>
        </div>
      </div>
    </div>
  );
};
