"use client";

import { BaseCard } from "@/components/cards/BaseCard";
import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import EmblaCarousel from "./EmblaCarousel";

interface News {
  id: string;
  title: string;
  summary: string;
  category: string;
  image: string;
  createdAt: string;
  date: string;
}

const mockNews: News[] = [
  {
    id: "1dfcd950-648b-49a5-9580-e8b1c3e3a806",
    title: "Bullying: A Luta da Atriz Haonê Thinar por Respeito",
    summary:
      "A atriz Haonê Thinar expôs o bullying que sofreu por sua condição física. O preconceito, que se manifesta em formas como o ciberbullying por IA, afeta milhões de pessoas. Em resposta, a Comissão de Defesa dos Direitos aprovou um projeto para criar uma campanha nacional contra crimes digitais. A urgência é por mais respeito e justiça social.",
    category: "Acessibilidade",
    image: "https://storage.googleapis.com/noticias-imagens/news%2F1761572834230-cropped-image.jpg",
    createdAt: "2025-10-27T13:47:16.015Z",
    date: "2025-10-27T13:47:15.203Z",
  },
  {
    id: "d60a8d1b-02a7-4e71-a009-0e3da1b88e97",
    title: "A Inclusão Pela Metade: Representatividade no Congresso e o Marketing da Causa Única",
    summary:
      'A coluna "Recortes" (22/10/2025) critica a baixa representatividade no Congresso (menos de 2%) e a lentidão em projetos de acessibilidade. O especialista Valmir de Souza, da Biomob, alerta contra o uso da inclusão como "marketing" por partidos que focam em causas únicas (como o TEA), dividindo a pauta de acessibilidade.',
    category: "Justiça e Política",
    image: "https://storage.googleapis.com/noticias-imagens/news%2F1761569546753-cropped-image.jpg",
    createdAt: "2025-10-27T12:52:28.633Z",
    date: "2025-10-27T12:52:27.691Z",
  },
  {
    id: "9761e62c-1320-45ae-8e09-ceddb1ed0303",
    title: "Revolução na Neurociência: Implante com IA Devolve Sensibilidade a Pessoas com Lesão Medular",
    summary:
      'Cientistas dos EUA desenvolveram um implante cerebral com Inteligência Artificial que devolveu a sensibilidade e o movimento a Keith Thomas, tetraplégico desde 2020. A tecnologia, chamada de "bypass neural duplo", usa microchips para traduzir pensamentos em comandos, e até permite que Keith sinta e controle a mão de outra pessoa em tempo real.',
    category: "Acessibilidade",
    image: "https://storage.googleapis.com/noticias-imagens/news%2F1761054781312-cropped-image.jpg",
    createdAt: "2025-10-21T13:53:02.326Z",
    date: "2025-10-21T13:53:02.325Z",
  },
];

export const UltimasNoticiasSection = () => {
  return (
    <Reveal width="100%">
      <BaseCard>
        <React.Fragment>
          <div className="flex flex-col items-center text-center gap-3 w-full justify-center">
            <Badge variant={"outline"} className="flex gap-2 items-center w-fit">
              <span className="relative flex size-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex size-4 rounded-full bg-green-600"></span>
              </span>
              Informações inclusivas
            </Badge>
            <h2 className="sr-only">Últimas Notícias</h2>
            <span className="heading-03-bold">
              As mais recentes informações sobre o mundo da <span className="text-primary-hover"> acessibilidade</span>
            </span>
            <span className="body-paragraph">
              Navegue por todas as notícias da Biomob. Embarque em um mundo de informação inclusiva e acessível para
              todos os públicos.
            </span>
          </div>

          <div className="w-full">
            <EmblaCarousel
              news={mockNews}
              options={{
                loop: true,
                align: "center",
                slidesToScroll: 1,
              }}
            />
          </div>

          <div className="flex justify-center w-full">
            <Link
              href={"/noticias"}
              className={buttonVariants({
                variant: "link",
              })}
            >
              Visualizar todas as notícias
              <ArrowRight className="text-primary-hover" />
            </Link>
          </div>
        </React.Fragment>
      </BaseCard>
    </Reveal>
  );
};
