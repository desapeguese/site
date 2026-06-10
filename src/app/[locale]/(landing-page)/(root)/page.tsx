"use server";

import React from "react";
import { createDefaultMetadata } from "@/lib/metadata";
import { PageContainer } from "./_components/PageContainer";

export async function generateMetadata() {
  return createDefaultMetadata(
    "Festival Desapegue-se | Sustentabilidade, Economia Circular e Arte",
    "Festival itinerante de sustentabilidade, economia circular, arte e conexão. 19 a 22 de Março 2026 no Grajaú, Rio de Janeiro. Feira de trocas, oficinas, shows e muito mais!"
  );
}
export default async function Home() {
  return <PageContainer />;
}
