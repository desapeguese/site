import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width",
      },
      fontFamily: {
        display: ["var(--font-univers)", "var(--font-geist-sans)", "sans-serif"],
        "display-hero": ["var(--font-univers-ultra-condensed)", "var(--font-univers)", "sans-serif"],
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
      screens: {
        "2sm": "481px",
        "max-2sm": {
          raw: "(max-width: 480px)",
        },
        "2smh": {
          raw: "(max-height: 600px)",
        },
        smh: {
          raw: "(max-height: 680px)",
        },
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "max-sm": {
          raw: "(max-width: 640px)",
        },
        "max-md": {
          raw: "(max-width: 768px)",
        },
        "max-lg": {
          raw: "(max-width: 1024px)",
        },
        "max-xl": {
          raw: "(max-width: 1280px)",
        },
        "max-2xl": {
          raw: "(max-width: 1536px)",
        },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          hover: "hsl(var(--background-hover))",
          "story-area": "hsl(var(--story-area))",
          "story-card": "hsl(var(--story-card))",
          "story-arrow": "hsl(var(--story-arrow))",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          "5": "hsla(var(--primary-5))",
          "10": "hsla(var(--primary-10))",
          "20": "hsla(var(--primary-20))",
          "30": "hsla(var(--primary-30))",
          "40": "hsla(var(--primary-40))",
          "50": "hsla(var(--primary-50))",
          "60": "hsla(var(--primary-60))",
          "70": "hsla(var(--primary-70))",
          "80": "hsla(var(--primary-80))",
          "90": "hsla(var(--primary-90))",
          DEFAULT: "hsl(var(--primary))",
          dark: {
            DEFAULT: "hsl(var(--primary-dark))",
            background: "hsl(var(--primary-dark-background))",
          },
          light: "hsl(var(--primary-light))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          lightest: "hsl(var(--primary-lightest))",
        },
        secondary: {
          "5": "hsla(var(--secondary-5))",
          "10": "hsla(var(--secondary-10))",
          "20": "hsla(var(--secondary-20))",
          "30": "hsla(var(--secondary-30))",
          "40": "hsla(var(--secondary-40))",
          "50": "hsla(var(--secondary-50))",
          "60": "hsla(var(--secondary-60))",
          "70": "hsla(var(--secondary-70))",
          "80": "hsla(var(--secondary-80))",
          "90": "hsla(var(--secondary-90))",
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
          dark: "hsl(var(--secondary-dark))",
          mid: "hsl(var(--secondary-mid))",
          light: "hsl(var(--secondary-light))",
          lightest: "hsl(var(--secondary-lightest))",
        },
        destructive: {
          "5": "hsla(var(--destructive-5))",
          "10": "hsla(var(--destructive-10))",
          "20": "hsla(var(--destructive-20))",
          "30": "hsla(var(--destructive-30))",
          "40": "hsla(var(--destructive-40))",
          "50": "hsla(var(--destructive-50))",
          "60": "hsla(var(--destructive-60))",
          "70": "hsla(var(--destructive-70))",
          "80": "hsla(var(--destructive-80))",
          "90": "hsla(var(--destructive-90))",
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          hover: "hsl(var(--destructive-hover))",
        },
        warning: {
          "5": "hsla(var(--warning-5))",
          "10": "hsla(var(--warning-10))",
          "20": "hsla(var(--warning-20))",
          "30": "hsla(var(--warning-30))",
          "40": "hsla(var(--warning-40))",
          "50": "hsla(var(--warning-50))",
          "60": "hsla(var(--warning-60))",
          "70": "hsla(var(--warning-70))",
          "80": "hsla(var(--warning-80))",
          "90": "hsla(var(--warning-90))",
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          hover: "hsl(var(--warning-hover))",
        },
        info: {
          "5": "hsla(var(--info-5))",
          "10": "hsla(var(--info-10))",
          "20": "hsla(var(--info-20))",
          "30": "hsla(var(--info-30))",
          "40": "hsla(var(--info-40))",
          "50": "hsla(var(--info-50))",
          "60": "hsla(var(--info-60))",
          "70": "hsla(var(--info-70))",
          "80": "hsla(var(--info-80))",
          "90": "hsla(var(--info-90))",
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          hover: "hsl(var(--info-hover))",
        },
        success: {
          "5": "hsl(var(--success-5))",
          "10": "hsl(var(--success-10))",
          "20": "hsl(var(--success-20))",
          "30": "hsl(var(--success-30))",
          "40": "hsl(var(--success-40))",
          "50": "hsl(var(--success-50))",
          "60": "hsl(var(--success-60))",
          "70": "hsl(var(--success-70))",
          "80": "hsl(var(--success-80))",
          "90": "hsl(var(--success-90))",
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          hover: "hsl(var(--success-hover))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          secondary: {
            DEFAULT: "hsl(var(--card-secondary))",
            foreground: "hsl(var(--card-secondary-foreground))",
          },
          darker: "hsl(var(--neutral-darker))",
        },
        "neutral-dark": {
          DEFAULT: "hsl(var(--neutral-mid-dark))",
        },
        "icon-light": {
          DEFAULT: "hsl(var(--icon-light))",
        },
        espacos: {
          "roxo-escuro": "hsl(var(--espacos-roxo-escuro))",
          magenta: "hsl(var(--espacos-magenta))",
          "verde-escuro": "hsl(var(--espacos-verde-escuro))",
          roxo: "hsl(var(--espacos-roxo))",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-linear-card":
          "linear-gradient(180deg, hsl(var(--gradient-card-from)) 0%, hsl(var(--gradient-card-to)) 100%)",
        "gradient-linear-orange":
          "linear-gradient(180deg, hsl(var(--gradient-orange-from)) 0%, hsl(var(--gradient-orange-to)) 100%)",
        miniSectionBackgroundTexture: "url(/img/miniSectionBackgroundTexture.svg)",
      },
      animation: {
        scroll: "scroll 40s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "canopy-horizontal": "canopy-x var(--duration) infinite linear",
        "canopy-vertical": "canopy-y var(--duration) linear infinite",
        "spin-color-blobs": "spinColorBlobs 8s linear infinite",
        "slow-spin": "slow-spin 5s linear infinite",
      },
      keyframes: {
        scroll: {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(calc(-250px * 14))",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "canopy-x": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(calc(-100% - var(--gap)))",
          },
        },
        "canopy-y": {
          from: {
            transform: "translateY(0)",
          },
          to: {
            transform: "translateY(calc(-100% - var(--gap)))",
          },
        },
        spinColorBlobs: {
          "0%": { transform: "translate(-50%, -50%) rotate(0deg) scale(2)" },
          "100%": { transform: "translate(-50%, -50%) rotate(1turn) scale(2)" },
        },
        "slow-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      fontSize: {
        "display-01": "7.5rem",
        "display-02": "4rem",
        "heading-01": "3.5rem",
        "heading-02": "3rem",
        "heading-03": "2rem",
        "heading-04": "1.75rem",
        "heading-05": "1.5rem",
        "body-title": "1.25rem",
        "body-paragraph": "1rem",
        "body-callout": "0.875rem",
        "body-caption": "0.75rem",
      },
      fontWeight: {
        light: "300",
        medium: "500",
        bold: "700",
      },
    },
  },
  plugins: [
    animatePlugin,
    function ({ addUtilities }: any) {
      const newUtilities = {
        ".scrollbar-thin": {
          scrollbarWidth: "thin",
          scrollbarColor: "hsl(var(--primary))",
        },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "hsl(var(--primary))",
            borderRadius: "20px",
            border: "1px solid white",
          },
        },
        ".display-01": { fontWeight: "700", fontSize: "7.5rem", lineHeight: "1.2" },
        ".display-02": { fontWeight: "700", fontSize: "3.75rem", lineHeight: "1.2" },
        ".heading-01": { fontWeight: "700", fontSize: "3.5rem", lineHeight: "1.2" },
        ".heading-02-bold": { fontWeight: "700", fontSize: "3rem", lineHeight: "1.2" },
        ".heading-02-medium": { fontWeight: "500", fontSize: "3rem", lineHeight: "1.2" },
        ".heading-02": { fontWeight: "400", fontSize: "3rem", lineHeight: "1.2" },
        ".heading-02-light": { fontWeight: "300", fontSize: "3rem", lineHeight: "1.2" },
        ".heading-03-bold": { fontWeight: "700", fontSize: "2.25rem", lineHeight: "1.2" },
        ".heading-03-medium": { fontWeight: "500", fontSize: "2.25rem", lineHeight: "1.2" },
        ".heading-03": { fontWeight: "400", fontSize: "2.25rem", lineHeight: "1.2" },
        ".heading-04-bold": { fontWeight: "700", fontSize: "1.75rem", lineHeight: "1.2" },
        ".heading-04-medium": { fontWeight: "500", fontSize: "1.75rem", lineHeight: "1.2" },
        ".heading-04": { fontWeight: "400", fontSize: "1.75rem", lineHeight: "1.2" },
        ".heading-04-light": { fontWeight: "300", fontSize: "1.75rem", lineHeight: "1.2" },
        ".heading-05-bold": { fontWeight: "700", fontSize: "1.5rem", lineHeight: "1.2" },
        ".heading-05-medium": { fontWeight: "500", fontSize: "1.5rem", lineHeight: "1.2" },
        ".heading-05": { fontWeight: "400", fontSize: "1.5rem", lineHeight: "1.2" },
        ".heading-05-light": { fontWeight: "300", fontSize: "1.5rem", lineHeight: "1.2" },
        ".body-title-bold": { fontWeight: "700", fontSize: "1.25rem", lineHeight: "1.2" },
        ".body-title-medium": { fontWeight: "500", fontSize: "1.25rem", lineHeight: "1.2" },
        ".body-title": { fontWeight: "400", fontSize: "1.25rem", lineHeight: "1.2" },
        ".body-title-light": { fontWeight: "300", fontSize: "1.25rem", lineHeight: "1.2" },
        ".body-paragraph-bold": { fontWeight: "700", fontSize: "1rem", lineHeight: "1.2" },
        ".body-paragraph-medium": { fontWeight: "500", fontSize: "1rem", lineHeight: "1.2" },
        ".body-paragraph": { fontWeight: "400", fontSize: "1rem", lineHeight: "1.2" },
        ".body-paragraph-light": { fontWeight: "300", fontSize: "1rem", lineHeight: "1.2" },
        ".body-callout-bold": { fontWeight: "700", fontSize: "0.875rem", lineHeight: "1.2" },
        ".body-callout-medium": { fontWeight: "500", fontSize: "0.875rem", lineHeight: "1.2" },
        ".body-callout": { fontWeight: "400", fontSize: "0.875rem", lineHeight: "1.2" },
        ".body-callout-light": { fontWeight: "300", fontSize: "0.875rem", lineHeight: "1.2" },
        ".body-caption-bold": { fontWeight: "700", fontSize: "0.75rem", lineHeight: "1.2" },
        ".body-caption-medium": { fontWeight: "500", fontSize: "0.75rem", lineHeight: "1.2" },
        ".body-caption": { fontWeight: "400", fontSize: "0.75rem", lineHeight: "1.2" },
        ".body-caption-light": { fontWeight: "300", fontSize: "0.75rem", lineHeight: "1.2" },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
    require("tailwind-scrollbar-hide"),
  ],
};

export default config;
