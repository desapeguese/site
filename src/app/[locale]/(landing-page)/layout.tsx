import { LandingHeader } from "@/components/header/LandingHeader";
import { getMessages } from "next-intl/server";
import LandingPageProviders from "@/components/layout/LandingPageProviders";
import { AdminModeProvider } from "@/context/AdminModeContext";
import { CookieBanner } from "./(root)/_components/CookieBanner";

export default async function LandingPageLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const messages = await getMessages(resolvedParams.locale as any);

  return (
    <LandingPageProviders messages={messages} locale={resolvedParams.locale}>
      <noscript>
        <style>
          {`
            .noscript-warning {
              background: #000;
              color: #fff;
              padding: 1rem;
              text-align: center;
              font-size: 1rem;
            }
          `}
        </style>
        <div className="noscript-warning">
          Este site requer JavaScript para funcionar corretamente. Por favor, habilite o JavaScript no seu navegador.
        </div>
      </noscript>
      <a
        href="#main-content"
        accessKey="1"
        className="
          sr-only 
          focus:not-sr-only 
          focus:absolute 
          focus:top-4 
          focus:left-4 
          focus:z-50 
          bg-black text-white 
          px-4 py-2 rounded-md
          focus:outline-2 
          focus:outline-white 
          focus:outline-offset-2
        "
      >
        Pular para o conteúdo
      </a>
      <h1 className="sr-only">Festival Desapegue-se – Sustentabilidade, Economia Circular e Arte</h1>
      <AdminModeProvider>
        <LandingHeader />
        {children}
        <CookieBanner />
      </AdminModeProvider>
    </LandingPageProviders>
  );
}
