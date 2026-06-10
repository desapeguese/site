import "./globals.css";
import "./embla.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import LandingPageProviders from "@/components/layout/LandingPageProviders";
import { getMessages } from "next-intl/server";
import Script from "next/script";
import localFont from "next/font/local";

const univers = localFont({
  src: [
    { path: "./fonts/Univers Next Pro Light.ttf", weight: "300" },
    { path: "./fonts/UniversNextProRegular.ttf", weight: "400" },
    { path: "./fonts/Univers Next Pro Medium.ttf", weight: "500" },
    { path: "./fonts/UniversNextProBold.ttf", weight: "700" },
  ],
  variable: "--font-univers",
  display: "swap",
});

const universUltraCondensed = localFont({
  src: "./fonts/Univers LT Std 49 Light Ultra Condensed.otf",
  variable: "--font-univers-ultra-condensed",
  display: "swap",
});

const APP_NAME = "Festival Desapegue-se";
const APP_DEFAULT_TITLE = "Festival Desapegue-se | Sustentabilidade, Economia Circular e Arte";
const APP_TITLE_TEMPLATE = "%s";
const APP_DESCRIPTION =
  "Festival itinerante de sustentabilidade, economia circular, arte e conexão. 19 a 22 de Março 2026 no Grajaú, Rio de Janeiro.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const resolvedParams = await params;
  const messages = await getMessages(resolvedParams.locale as any);
  const FB_PIXEL_ID = "1407999291010671";

  return (
    <html className={`${univers.variable} ${universUltraCondensed.variable} scroll-container`} suppressHydrationWarning lang="pt-BR">
      <head>
        <Script id="plausible-init" strategy="beforeInteractive">
          {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
        <Script
          id="plausible-script"
          src="https://plausible.biomob.app/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
          data-domain="biomobnovo"
          strategy="afterInteractive"
        />
       <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className={univers.className}>
        <noscript>
          <img
            height="1"
            width="1"
            alt=""
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <LandingPageProviders messages={messages} locale={resolvedParams.locale}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
          </ThemeProvider>
        </LandingPageProviders>
        <Toaster richColors />
      </body>
    </html>
  );
}
