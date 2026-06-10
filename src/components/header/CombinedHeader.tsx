"use client";

import React from "react";
import SwitchWithIcon from "../ui/switchWithIcon";
import FontSizeSlider from "../ui/FontSizeSlider";
import { HeaderSkeleton } from "../ui/HeaderSkeleton";
import { NextImage } from "../ui/NextImage";
import { useTranslations } from "next-intl";
import { VLibrasIntegration } from "./VLibrasIntegration";
import { IoLogoInstagram } from "react-icons/io5";
import { FaLinkedinIn, FaFacebookF, FaYoutube, FaGooglePlay, FaApple } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "../ui/button";

export const CombinedHeader = ({ ignoreMenu }: { ignoreMenu?: boolean }) => {
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = useTranslations("Header");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "";
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return (
        pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/" || pathname === `/${locale}/home`
      );
    }
    return pathname.endsWith(path);
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownVisible && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible, sidebarOpen]);

  if (!isMounted) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 max-w-[1220px]">
      {/* Primeira section */}
      <div className="px-2 lg:px-[6.25rem] flex justify-between items-center h-full max-h-10 w-full dark:bg-[hsl(var(--brand-primary-dark))] bg-[hsl(var(--brand-primary-mid))]">
        <div
          className="max-h-12 overflow-y-hidden relative flex justify-center 
        md:justify-start gap-4 items-center 
        w-full 
        px-4 py-1 my-0 mx-auto text-white"
        >
          <VLibrasIntegration />
          <div className="flex gap-4 text-white items-center max-md:mx-auto mr-auto">
            <div className="hidden lg:flex gap-1 items-center text-end max-h-[3.125rem] overflow-hidden">
              <span className="flex flex-col body-paragraph justify-end ">
                <span className="w-max text-end ">by</span>
              </span>
              <NextImage
                imageUrl={"/img/LOGO_INSTITUTO_BRANCA.png"}
                altImage={t("logo")}
                ariaLabel={t("logo")}
                sizes="100vw"
                className="w-auto h-[1.625rem]"
              />
            </div>
            <span className="md:contents hidden font-semibold text-[1.4rem] font-montserrat">
              {t("acessibilidade")}
            </span>
            <SwitchWithIcon />
            <FontSizeSlider />
          </div>
        </div>
        <div className="hidden xl:flex items-center justify-center px-2 gap-x-4 text-icon-light">
          <div className="flex items-center justify-center px-2 gap-x-4">
            <Link href="https://www.instagram.com/biomob/" target="_blank">
              <IoLogoInstagram className="body-paragraph " />
              <span className="sr-only">Instagram</span>
            </Link>

            <Link href="https://www.linkedin.com/company/biomob/" target="_blank">
              <FaLinkedinIn className="body-paragraph " />
              <span className="sr-only">Linkedin</span>
            </Link>

            <Link href="https://pt-br.facebook.com/biomob/" target="_blank">
              <FaFacebookF className="body-paragraph " />
              <span className="sr-only">Facebook</span>
            </Link>

            <Link href="https://www.youtube.com/@biomob" target="_blank">
              <FaYoutube className="body-paragraph " />
              <span className="sr-only">Youtube</span>
            </Link>
          </div>

          <div className="flex items-center justify-center h-[1.925rem] px-2 gap-x-4">
            <p className="text-nowrap">Baixe o app</p>

            <Link href="https://apps.apple.com/br/app/biomob/id1090156739" target="_blank">
              <FaApple className="body-paragraph " />
              <span className="sr-only">Download na App Store</span>
            </Link>
            <Link href="https://play.google.com/store/apps/details?id=com.biomob.bioplus" target="_blank">
              <FaGooglePlay className="body-paragraph text-text-gray" />
              <span className="sr-only">Download no Google Play</span>
            </Link>
          </div>

          <Link href={"/dashboard/entrar"} className={buttonVariants({ variant: "card", size: "sm" })}>
            Entrar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Segunda section - Menu de navegação */}
      {!ignoreMenu && (
        <div className="bg-card border-b border-border relative ">
          <div className="mx-auto px-4 py-3 flex justify-between items-center">
            {/* Botão Hambúrguer para telas < 1240px */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {/* HOME */}
                  <Link
                    href="/"
                    className="px-4 py-2 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>

                  {/* NOSSAS SOLUÇÕES */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="solucoes" className="border-none">
                      <AccordionTrigger className="px-4 py-2 hover:bg-accent rounded-md hover:no-underline">
                        Nossas Soluções
                      </AccordionTrigger>
                      <AccordionContent className="pl-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href="/nossos-servicos/acessibilidade-arquitetonica"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Acessibilidade arquitetônica</div>
                            <div className="text-muted-foreground ">
                              Projetos e consultorias para eliminar barreiras físicas.
                            </div>
                          </Link>
                          <Link
                            href="/nossos-servicos/acessibilidade-digital"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Acessibilidade digital</div>
                            <div className="text-muted-foreground ">
                              Inclusão e UX acessível em sistemas, apps e sites.
                            </div>
                          </Link>
                          <Link
                            href="/nossos-servicos/letramento"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Letramento</div>
                            <div className="text-muted-foreground ">
                              Capacitação e treinamentos em acessibilidade e inclusão.
                            </div>
                          </Link>
                          <Link
                            href="/nossos-servicos/bioconecta"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Bioconecta</div>
                            <div className="text-muted-foreground ">
                              Feira de empregabilidade e curso capacitante para o primeiro emprego.
                            </div>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* NOTÍCIAS */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="noticias" className="border-none">
                      <AccordionTrigger className="px-4 py-2 hover:bg-accent rounded-md hover:no-underline">
                        Notícias
                      </AccordionTrigger>
                      <AccordionContent className="pl-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href="/noticias"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Todas as notícias</div>
                            <div className="text-muted-foreground ">Fique por dentro das últimas novidades.</div>
                          </Link>
                          <Link
                            href="/noticias/categoria/acessibilidade"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Acessibilidade</div>
                            <div className="text-muted-foreground ">
                              Mais recentes publicações sobre acessibilidade.
                            </div>
                          </Link>
                          <Link
                            href="/noticias/categoria/cultura"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Cultura</div>
                            <div className="text-muted-foreground ">Mais recentes publicações sobre cultura.</div>
                          </Link>
                          <Link
                            href="/noticias/categoria/politica"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Política</div>
                            <div className="text-muted-foreground ">Mais recentes publicações sobre política.</div>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* BIOMOB NA MÍDIA */}
                  {/* <Link
                    href="/biomob-na-midia"
                    className="px-4 py-2 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Biomob na mídia
                  </Link> */}

                  {/* INSTITUCIONAL */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="institucional" className="border-none">
                      <AccordionTrigger className="px-4 py-2 hover:bg-accent rounded-md hover:no-underline">
                        Institucional
                      </AccordionTrigger>
                      <AccordionContent className="pl-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href="/instituto"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Instituto</div>
                            <div className="text-muted-foreground ">Conheça nossa história e missão</div>
                          </Link>
                          <Link
                            href="/casos-de-sucesso"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Casos de sucesso</div>
                            <div className="text-muted-foreground ">Histórias de transformação e impacto</div>
                          </Link>
                          <Link
                            href="/contato"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Contato</div>
                            <div className="text-muted-foreground ">Entre em contato conosco</div>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* RECURSOS */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="recursos" className="border-none">
                      <AccordionTrigger className="px-4 py-2 hover:bg-accent rounded-md hover:no-underline">
                        Recursos
                      </AccordionTrigger>
                      <AccordionContent className="pl-4">
                        <div className="flex flex-col gap-2">
                          {/* <Link
                            href="/aplicativo-biomob"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Aplicativo Biomob</div>
                            <div className="text-muted-foreground ">Download e funcionalidades do app</div>
                          </Link> */}
                          {/* <Link
                            href="/digitais"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Certificados Digitais</div>
                            <div className="text-muted-foreground ">Emissão e validação de certificados</div>
                          </Link> */}
                          <Link
                            href="/editais"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Editais</div>
                            <div className="text-muted-foreground ">Oportunidades de capacitação e inclusão</div>
                          </Link>
                          <Link
                            href="/vagas-de-emprego"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Vagas de emprego</div>
                            <div className="text-muted-foreground ">Oportunidades de trabalho inclusivo</div>
                          </Link>
                          <Link
                            href="/canais-de-denuncia"
                            className="px-4 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="font-medium">Canais de denúncia</div>
                            <div className="text-muted-foreground ">Reportar situações de discriminação</div>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* PAPO DIVERSO */}
                  <Link
                    href="https://papodiverso.biomob.app"
                    target="_blank"
                    className="px-4 py-2 hover:bg-accent rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Papo Diverso
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Menu Desktop (>= 1240px) */}
            <NavigationMenu viewport={isMobile} className="hidden xl:flex mx-auto w-full">
              <NavigationMenuList className="flex-wrap gap-2">
                {/* HOME */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/">Home</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* NOSSAS SOLUÇÕES */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Nossas Soluções</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <ListItem
                        href="/nossos-servicos/acessibilidade-arquitetonica"
                        title="Acessibilidade arquitetônica"
                      >
                        Projetos e consultorias para eliminar barreiras físicas.
                      </ListItem>

                      <ListItem href="/nossos-servicos/acessibilidade-digital" title="Acessibilidade digital">
                        Inclusão e UX acessível em sistemas, apps e sites.
                      </ListItem>

                      <ListItem href="/nossos-servicos/letramento" title="Letramento">
                        Capacitação e treinamentos em acessibilidade e inclusão.
                      </ListItem>

                      <ListItem href="/nossos-servicos/bioconecta" title="Bioconecta">
                        Feira de empregabilidade e curso capacitante para o primeiro emprego.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* NOTÍCIAS */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Notícias</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                            href="/noticias"
                          >
                            <div className="my-12 relative w-20 h-20 mx-auto">
                              <div className="absolute inset-0 bg-primary rounded-lg rotate-12 opacity-20"></div>
                              <div className="absolute inset-4 bg-primary rounded-lg -rotate-12 opacity-40"></div>
                              <div className="absolute inset-8 flex items-center justify-center">
                                <span className="text-lg">👌</span>
                              </div>
                            </div>

                            <div className="body-title ">Todas as notícias</div>
                            <p className="text-muted-foreground body-paragraph leading-tight">
                              Fique por dentro das últimas novidades sobre acessibilidade e inclusão.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/noticias/categoria/acessibilidade" title="Acessibilidade">
                        Mais recentes publicações e artigos sobre acessibilidade.
                      </ListItem>
                      <ListItem href="/noticias/categoria/cultura" title="Cultura">
                        Mais recentes publicações e artigos sobre cultura.
                      </ListItem>
                      <ListItem href="/noticias/categoria/politica" title="Política">
                        Mais recentes publicações e artigos sobre política.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* BIOMOB NA MÍDIA */}
                {/* <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/biomob-na-midia">Biomob na mídia</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem> */}

                {/* INSTITUCIONAL */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Institucional</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 w-fit sm:w-[320px] ">
                      <ListItem href="/instituto" title="Instituto">
                        Conheça nossa história e missão
                      </ListItem>
                      <ListItem href="/casos-de-sucesso" title="Casos de sucesso">
                        Histórias de transformação e impacto
                      </ListItem>
                      <ListItem href="/contato" title="Contato">
                        Entre em contato conosco
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* RECURSOS */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 w-fit sm:w-[320px] ">
                      {/* <ListItem href="/aplicativo-biomob" title="Aplicativo Biomob">
                        Download e funcionalidades do app
                      </ListItem>
                      <ListItem href="/digitais" title="Certificados Digitais">
                        Emissão e validação de certificados
                      </ListItem> */}
                      <ListItem href="/editais" title="Editais">
                        Oportunidades de capacitação e inclusão
                      </ListItem>
                      <ListItem href="/vagas-de-emprego" title="Vagas de emprego">
                        Oportunidades de trabalho inclusivo
                      </ListItem>
                      <ListItem href="/canais-de-denuncia" title="Canais de denúncia">
                        Reportar situações de discriminação
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="https://papodiverso.biomob.app" target="_blank">
                      Papo Diverso
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      )}
    </header>
  );
};

export default CombinedHeader;

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="body-title leading-none ">{title}</div>
          {children && <p className="text-muted-foreground line-clamp-2 body-paragraph leading-snug">{children}</p>}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
