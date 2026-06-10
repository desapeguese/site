"use client";
import React, { useRef, ReactNode, ElementType } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { WritingText } from "./animate-ui/text/writing";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Reveal } from "./Reveal";
import { TimelineContent } from "./ui/timeline-animation";
import { LiquidGlassCard } from "./ui/liquid-glass";
import { AnimatedTooltip } from "./ui/animated-tooltip";

export const PlayStoreIcon: React.FC = () => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 15 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ícone da Play Store"
  >
    <path
      d="M7.12207 6.98926L0.5 12.5791V1.40918L7.12207 6.98926ZM9.78809 9.24512L4.17676 12.0029L8.62012 8.25879L9.78809 9.24512ZM13.7188 6.67969L13.7217 6.68164C13.8919 6.7642 13.9472 6.89159 13.9473 6.99609C13.9473 7.10099 13.8914 7.23303 13.7188 7.32031L11.6846 8.32227L10.1182 7L11.6846 5.67676L13.7188 6.67969ZM9.78809 4.75391L8.62012 5.74023L4.17676 1.99609L9.78809 4.75391Z"
      fill="currentColor"
      stroke="currentColor"
    />
  </svg>
);

export const AppleStoreIcon: React.FC = () => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 14 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ícone da Apple Store"
  >
    <path
      d="M10.375 4.36035L10.3877 4.36133L10.3994 4.3623C10.8335 4.3845 11.8978 4.51746 12.7129 5.35449C12.6733 5.3863 12.6311 5.41963 12.5889 5.45605C12.2805 5.72215 11.9026 6.11926 11.6123 6.65723V6.6582C11.3492 7.14964 11.1496 7.77111 11.1602 8.50684V8.50781C11.1765 9.88535 11.807 10.8147 12.4287 11.3906C12.7245 11.6646 13.0191 11.8584 13.2451 11.9883C13.0862 12.397 12.7895 13.0572 12.3145 13.7285L12.3125 13.7314C11.9693 14.2247 11.6493 14.6656 11.293 14.9883C10.9466 15.3019 10.5983 15.4739 10.1963 15.4805C9.76164 15.4877 9.48434 15.3693 9.09961 15.207C8.69972 15.0383 8.21974 14.8419 7.48535 14.8418C6.75659 14.8418 6.27045 15.0252 5.86133 15.1943C5.46087 15.3599 5.1837 15.4835 4.7666 15.498C4.40553 15.5097 4.04899 15.3393 3.66797 14.9922C3.28457 14.6428 2.93448 14.1696 2.58691 13.6816C2.02582 12.894 1.51274 11.816 1.21484 10.6582C0.916902 9.50003 0.843333 8.29796 1.12012 7.24609C1.22546 6.861 1.37323 6.49216 1.56738 6.16211V6.16113C2.19967 5.08408 3.33395 4.41532 4.55176 4.39941H4.55371C4.98076 4.39208 5.41874 4.53183 5.88281 4.70703C6.10084 4.78935 6.34236 4.88601 6.55859 4.95703C6.77447 5.02793 7.02047 5.09375 7.26465 5.09375C7.52043 5.09375 7.78959 5.01343 8.02051 4.93359C8.24206 4.85698 8.54372 4.73699 8.78223 4.65039C9.31718 4.45617 9.85188 4.30829 10.375 4.36035ZM9.95312 0.583984C9.88492 1.18285 9.60419 1.77089 9.21094 2.2334C8.81497 2.69905 8.22736 3.05746 7.6416 3.16211C7.70516 2.57045 8.01455 1.97307 8.39355 1.54688L8.39453 1.54785C8.79405 1.10034 9.39221 0.740823 9.95312 0.583984Z"
      fill="currentColor"
      stroke="currentColor"
    />
  </svg>
);

const AppCard: React.FC = () => (
  <div className="flex flex-col-reverse relative md:flex-row md:items-center gap-4 md:gap-10 rounded-3xl dark:bg-[hsl(var(--brand-primary-dark))] bg-[hsl(var(--brand-primary-mid))] px-6 py-4 max-w-[100%] md:w-[29.75rem] my-5 mr-5 text-primary-foreground">
    <div className="flex flex-col gap-2 w-full ">
      <span className="heading-05-bold w-full">Aplicativo Biomob +</span>
      <span className="body-paragraph max-w-[200px]">
        Desenvolvido pensando nas pessoas com deficiência e mobilidade reduzida.
      </span>
      <div className="flex gap-3">
        <div className="flex gap-2 items-center">
          <PlayStoreIcon />
          <span className="body-paragraph-medium whitespace-nowrap">Play Store</span>
        </div>
        <div className="flex gap-2 items-center">
          <AppleStoreIcon />
          <span className="body-paragraph-medium whitespace-nowrap">Apple Store</span>
        </div>
      </div>
    </div>
    <Image
      src="/img/mockupapp.png"
      alt="Logo do aplicativo Biomob +"
      className=" w-auto  md:h-48 aspect-[2116/1928] md:absolute -right-2"
      quality={100}
      width={800}
      height={800}
    />
  </div>
);

// Componente CtaButton
interface CtaButtonProps {
  text: string;
  link: string;
  icon?: ElementType;
  type?: "default" | "link" | "outline" | "ghost";
}
const CtaButton: React.FC<CtaButtonProps> = ({ text, link, icon, type }) => {
  const Icon = icon;
  return (
    <Link href={link} className={buttonVariants({ variant: type || "default", size: "default" })}>
      {text} {Icon && <Icon />}
    </Link>
  );
};

export const LoadingTextParallax: React.FC = () => (
  <div className="w-full h-[calc(100vh-24px)] rounded-b-[6.25rem] bg-muted animate-pulse" />
);

const IMG_PADDING = 12;

type GlassCardProps =
  | {
      persons: {
        id: number;
        name: string;
        designation: string;
        image: string;
      }[];
      title: string;
      description: string;
      autor: string;
      qrCode?: never;
    }
  | {
      persons?: never;
      qrCode: {
        value?: string;
        legend: string;
        linkUrl: string;
      };
      title: string;
      description?: string;
      autor?: string;
    };

interface TextParallaxContentProps {
  imgUrl?: string;
  darkImageUrl?: string;
  description: string;
  heading: string;
  /** Parágrafo opcional abaixo do subtítulo (ex.: "Mais que um evento...") */
  introParagraph?: string;
  children?: ReactNode;
  ignoreMaxWidth?: boolean;
  appCard: boolean;
  ctaButton?: {
    text: string;
    link: string;
    icon?: ElementType;
  };
  otherButton?: {
    text: string;
    link: string;
    icon: ElementType;
  };
  glassCard?: GlassCardProps;
  badge?: React.JSX.Element;
  tsparticles?: boolean;
}

export const TextParallaxContent: React.FC<TextParallaxContentProps> = ({
  imgUrl,
  darkImageUrl,
  description,
  heading,
  introParagraph,
  children,
  appCard,
  ctaButton,
  otherButton,
  glassCard,
  ignoreMaxWidth,
  badge,
  tsparticles,
}) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const theme = useTheme();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingTextParallax />;
  }

  const imageUrl = theme.resolvedTheme === "dark" ? darkImageUrl : imgUrl;

  return (
    <React.Suspense fallback={<LoadingTextParallax />}>
      <div
        className="xl:block hidden"
        style={{
          paddingLeft: IMG_PADDING,
          paddingRight: IMG_PADDING,
        }}
      >
        <div className="relative h-auto">
          <StickyImage imageUrl={imageUrl} />
          <OverlayCopy
            heading={heading}
            description={description}
            introParagraph={introParagraph}
            appCard={appCard}
            ctaButton={ctaButton}
            otherButton={otherButton}
            glassCard={glassCard}
            ignoreMaxWidth={ignoreMaxWidth}
            badge={badge}
          />
        </div>
        {children}
      </div>

      <div className="xl:hidden block">
        <div
          className="relative h-auto w-full flex flex-col gap-6 items-start justify-center px-6 py-32"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <WritingText
            className="text-start heading-03-bold md:heading-02-bold xl:display-02 text-foreground"
            text={heading}
            spacing={9}
            transition={{
              type: "keyframes",
              bounce: 0,
              duration: 0.5,
              delay: 0.1,
            }}
          />
          <WritingText
            className="mb-2 text-start body-paragraph md:heading-05"
            text={description}
            spacing={9}
            transition={{ type: "keyframes", bounce: 0, duration: 0.5, delay: 0.1 }}
          />
          {introParagraph && (
            <p className="text-start body-paragraph text-foreground/90 max-w-xl mb-4">
              {introParagraph}
            </p>
          )}

          {appCard && (
            <Reveal width="fit-content">
              <AppCard />
            </Reveal>
          )}
          <div className="flex max-md:justify-center gap-2 flex-wrap">
            {ctaButton && <CtaButton {...ctaButton} />}
            {otherButton && <CtaButton type="ghost" {...otherButton} />}
          </div>
        </div>
        {children}
      </div>
    </React.Suspense>
  );
};

interface StickyImageProps {
  imageUrl?: string;
}

const StickyImage: React.FC<StickyImageProps> = ({ imageUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="max-lg:hidden sticky z-0 overflow-hidden rounded-b-[6.25rem]"
    >
      <motion.div
        className="absolute inset-0 "
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

interface OverlayCopyProps {
  description: string;
  heading: string;
  introParagraph?: string;
  appCard: boolean;
  ignoreMaxWidth?: boolean;
  glassCard?: GlassCardProps;
  ctaButton?: {
    text: string;
    link: string;
    icon?: ElementType;
  };
  otherButton?: {
    text: string;
    link: string;
    icon: ElementType;
  };
  badge?: React.JSX.Element;
}

const OverlayCopy: React.FC<OverlayCopyProps> = ({
  description,
  heading,
  introParagraph,
  appCard,
  ctaButton,
  otherButton,
  glassCard,
  ignoreMaxWidth = false,
  badge,
}) => {
  const targetRef = useRef(null);
  const glassCardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  const opacityVariants = {
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: { opacity: 0 },
  };

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className={`lg:absolute left-0 top-0 flex h-full p-[6.25rem] w-full flex-col xl:flex-row gap-6 items-start xl:items-center justify-center ${ignoreMaxWidth ? "" : "max-w-[1220px]"}`}
    >
      <div className="flex flex-col gap-6 items-start justify-center w-full">
        <div className="flex flex-col gap-2">
          {badge && (
            <Reveal>
              <span className="text-primary-foreground">{badge}</span>
            </Reveal>
          )}

          <WritingText
            className="text-start display-02 text-foreground"
            text={heading}
            spacing={9}
            transition={{
              type: "keyframes",
              bounce: 0,
              duration: 0.5,
              delay: 0.1,
            }}
          />
        </div>
        <WritingText
          className="mb-2 text-start body-paragraph"
          text={description}
          spacing={9}
          transition={{ type: "keyframes", bounce: 0, duration: 0.5, delay: 0.1 }}
        />
        {introParagraph && (
          <p className="text-start body-paragraph text-foreground/90 max-w-xl mb-4">
            {introParagraph}
          </p>
        )}

        {appCard && (
          <Reveal>
            <AppCard />
          </Reveal>
        )}
        <div className="flex gap-4">
          {ctaButton && (
            <Reveal>
              <CtaButton {...ctaButton} />
            </Reveal>
          )}
          {otherButton && (
            <Reveal>
              <CtaButton type="ghost" {...otherButton} />
            </Reveal>
          )}
        </div>
      </div>
      {glassCard && (
        <div ref={glassCardRef}>
          <TimelineContent as="div" animationNum={4} timelineRef={glassCardRef} customVariants={opacityVariants}>
            <LiquidGlassCard
              glowIntensity="none"
              shadowIntensity="sm"
              borderRadius="12px"
              blurIntensity="lg"
              className="p-4 ml-auto sm:w-[28rem] w-full"
            >
              {"qrCode" in glassCard && glassCard.qrCode ? (
                <div className="flex flex-col items-center gap-4">
                  <span className="font-medium text-sm text-center w-full">{glassCard.title}</span>
                  <a
                    href={glassCard.qrCode.linkUrl}
                    className="block p-2 bg-white/90 dark:bg-black/30 rounded-xl border border-border"
                    aria-label={glassCard.qrCode.legend}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/img/qr-code.png"
                      alt=""
                      width={140}
                      height={140}
                      className="size-[140px] object-contain"
                      aria-hidden
                    />
                  </a>
                  <figcaption className="body-callout text-muted-foreground text-center">
                    {glassCard.qrCode.legend}
                  </figcaption>
                </div>
              ) : (
                <>
                  {/* Avatar Stack */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex flex-row items-center justify-start">
                      <AnimatedTooltip items={glassCard.persons} />
                    </div>
                    <span className="font-medium text-sm">{glassCard.title}</span>
                  </div>

                  <div className="p-4 rounded-lg bg-white/10">
                    <blockquote className=" text-sm leading-relaxed">“{glassCard.description}”</blockquote>
                    <cite className="pt-2 inline-block font-semibold">{glassCard.autor}</cite>
                  </div>
                </>
              )}
            </LiquidGlassCard>
          </TimelineContent>
        </div>
      )}
    </motion.div>
  );
};
