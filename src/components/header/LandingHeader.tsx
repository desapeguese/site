"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { VLibrasIntegration } from "./VLibrasIntegration";
import SwitchWithIcon from "../ui/switchWithIcon";
import FontSizeSlider from "../ui/FontSizeSlider";
import { HeaderSkeleton } from "../ui/HeaderSkeleton";
import { NextImage } from "../ui/NextImage";

export function LandingHeader() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full mx-auto">
      {/* Barra de acessibilidade */}
      <div className=" px-2 lg:px-[6.25rem] flex justify-between items-center h-full max-h-10 w-full bg-primary-dark-background">
        <div className=" max-w-[1220px] max-h-12 overflow-y-hidden relative flex justify-center md:justify-start gap-4 items-center w-full px-4 py-1 my-0 mx-auto text-white">
          <VLibrasIntegration />
          <div className="flex gap-4 text-white items-center mx-auto">
            <div className="hidden lg:flex gap-1 items-center text-end max-h-[3.125rem] overflow-hidden">
              <span className="flex flex-col body-paragraph justify-end text-[0.65rem]">by</span>
              <NextImage
                imageUrl={"/img/LOGO_INSTITUTO_BRANCA.png"}
                altImage={"Biomob"}
                ariaLabel={"Biomob"}
                sizes="100vw"
                className="w-auto h-[1.625rem]"
              />
            </div>
            <span className="md:contents hidden body-paragraph-medium">Acessibilidade</span>
            <SwitchWithIcon />
            <FontSizeSlider />
          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;
