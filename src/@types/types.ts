import { IconType } from "react-icons";
import { ElementType } from "react";

type NextImageType = {
  imageUrl: string;
  imageDarkUrl?: string;
  altImage: string;
  extraClassName?: string;
  className?: string;
  ariaLabel: string;
  sizes: string;
  fill?: boolean;
  draggable?: boolean;
  priority?: boolean;
  blurDataURL?: string;
};

type IconProps = {
  Icon: IconType;
  url: string;
  size?: string;
  color?: string;
  alt: string;
};

type TitleDefaultType = {
  title: string;
  subtitle?: string;
  description?: string;
  extraClassName?: string;
  textColor: "text-cinza-800" | "text-branco-100";
};

type ItemCarouselType = {
  image: NextImageType;
  texts: TitleDefaultType;
};

type InnovationInMovieSectionType = {
  texts: TitleDefaultType;
  images: ItemCarouselType[];
  link: string;
};

type IconTextCardType = {
  title: string;
  description: string;
  icon: IconType | ElementType;
};

/** Landing Supercomputador: depoimentos, cartas, apoiadores, benefícios */
export type Depoimento = {
  id: string;
  visible: boolean;
  nome: string;
  cargo: string;
  instituicao: string;
  texto: string;
  foto?: string | null;
};

export type Carta = {
  id: string;
  visible: boolean;
  titulo: string;
  autor?: string;
  previewUrl?: string | null; // imagem ou thumbnail do PDF
  pdfUrl: string;
  categoria?: "autoridades" | "instituicoes";
};

export type Apoiador = {
  id: string;
  visible: boolean;
  nome: string;
  logoUrl: string;
  link?: string | null;
};

export type Beneficio = {
  id: string;
  titulo: string;
  descricao: string;
};

export type {
  NextImageType,
  IconProps,
  TitleDefaultType,
  InnovationInMovieSectionType,
  ItemCarouselType,
  IconTextCardType,
};
