/** @type {import('next').NextConfig} */
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  maximumFileSizeToCacheInBytes: 4.5 * 1024 * 1024, // 4.5 MB
});

// Função para compor múltiplos plugins
function composePlugins(...plugins) {
  return (config) => plugins.reduceRight((acc, plugin) => plugin(acc), config);
}

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

// Exportando os plugins combinados
export default composePlugins(withNextIntl, withSerwist)(nextConfig);
