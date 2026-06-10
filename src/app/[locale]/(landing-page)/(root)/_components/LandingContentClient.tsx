"use client";

import { AdminFloatingBar } from "@/components/admin/AdminFloatingBar";
import { Footer } from "@/components/footer/footer";
import { useLandingContent } from "@/context/LandingContentContext";
import { DesapegarParaRegenerar } from "./DesapegarParaRegenerar";
import { JusticaClimatica } from "./JusticaClimatica";
import { MainBanner } from "./MainBanner";
import { NossaMissao } from "./NossaMissao";
import { NossaTragetoria } from "./NossaTragetoria";
import { NossosCompromissos } from "./NossosCompromissos";
import { ReconhecimentoLegal } from "./ReconhecimentoLegal";

export function LandingContentClient() {
  const { content } = useLandingContent();
  const sectionByKey = new Map(content.sections.map((section) => [section.key, section]));

  return (
    <div className="flex flex-col w-full">
      <AdminFloatingBar />
      <main id="main-content">
        <MainBanner section={sectionByKey.get("hero")} />
        <DesapegarParaRegenerar section={sectionByKey.get("regenerar")} />
        <NossosCompromissos section={sectionByKey.get("compromissos")} />
        <NossaMissao section={sectionByKey.get("missao")} />
        <NossaTragetoria section={sectionByKey.get("trajetoria")} />
        <ReconhecimentoLegal section={sectionByKey.get("reconhecimento")} />
        <JusticaClimatica section={sectionByKey.get("programacao")} />
      </main>
      <Footer section={sectionByKey.get("footer")} editable />
    </div>
  );
}
