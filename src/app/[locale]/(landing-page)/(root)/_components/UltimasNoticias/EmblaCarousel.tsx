import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import { PrevButton, NextButton, usePrevNextButtons } from "./EmblaCarouselArrowButtons";
import useEmblaCarousel from "embla-carousel-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

interface News {
  id: string;
  title: string;
  summary: string;
  category: string;
  image: string;
  createdAt: string;
  date: string;
}

type PropType = {
  news: News[];
  options?: EmblaOptionsType;
  featuredNews?: News;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { news, options, featuredNews } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {news.map((newsItem, index) => {
            const isActive = index === selectedIndex;

            return (
              <div className="embla__slide" key={newsItem.id}>
                <div className="embla__slide__content">
                  <div className="flex flex-col py-4 ps-4 bg-background rounded-[1.25rem] w-full h-full max-h-[80vh] select-none">
                    <div
                      className={`relative w-full rounded-l-[1.25rem] overflow-hidden transition-all duration-500 ease-in-out ${
                        isActive ? "aspect-[338/160] mb-4" : `aspect-[1080/1020]`
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-black transition-all duration-500 ease-in-out z-20 ${
                          isActive ? "bg-opacity-0" : "bg-opacity-80"
                        }`}
                      ></div>
                      <Image
                        src={newsItem.image}
                        alt={newsItem.title}
                        width={600}
                        height={800}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {isActive && (
                      <Reveal>
                        <div className="flex flex-col gap-2 px-4">
                          <div className="hidden lg:flex gap-2 mb-2">
                            <Badge variant="outline" className="w-fit">
                              {newsItem.category}
                            </Badge>
                            <Badge variant="outline" className="w-fit">
                              {newsItem.date.split("T")[0]}
                            </Badge>
                          </div>
                          <h3 className="body-title-medium line-clamp-2">{newsItem.title}</h3>
                          <p className="body-paragraph">{newsItem.summary}</p>
                          <Link
                            href={`/noticias/${newsItem.id}`}
                            className={buttonVariants({
                              variant: "link",
                            })}
                          >
                            Ler notícia completa
                            <ArrowRight className="text-primary" />
                          </Link>
                        </div>
                      </Reveal>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="embla__controls">
        <div className="flex w-full justify-center items-center gap-2">
          <div className="w-10 h-10 p-[.625rem] bg-background rounded-full">
            <Image src="/img/LOGO_INSTITUTO_BRANCA.png" alt="Dot Icon" width={26} height={26} />
          </div>

          <div className="flex gap-2 px-3 py-[.625rem] rounded-full bg-background">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                aria-label={`Ir para a notícia ${index + 1}`}
                aria-current={index === selectedIndex ? "true" : undefined}
                className={`w-${index === selectedIndex ? "10" : "3"} h-3 ${
                  index === selectedIndex ? "bg-foreground" : "bg-card"
                } rounded-full transition-all duration-300`}
              />
            ))}
          </div>

          <div className="w-10 h-10 p-[.625rem] bg-background rounded-full flex items-center justify-center cursor-pointer">
            <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} aria-label="Notícia anterior">
              <ChevronLeft className="w-[.875rem]" />
            </PrevButton>
          </div>

          <div className="w-10 h-10 p-[.625rem] bg-background rounded-full flex items-center justify-center cursor-pointer">
            <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} aria-label="Próxima notícia">
              <ChevronRight className="w-[.875rem]" />
            </NextButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
