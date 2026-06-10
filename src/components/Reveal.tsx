"use client";

import React, { ReactNode } from "react";
import { useTheme } from "next-themes";
import { motion, useAnimation, useInView } from "framer-motion";

interface Props {
  children: JSX.Element;
  width?: "fit-content" | "100%";
}

export const Reveal = ({ children, width = "fit-content" }: Props) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
      slideControls.start("visible");
    }
  }, [isInView]);

  // Define o background conforme o tema
  const background =
    resolvedTheme === "dark"
      ? "linear-gradient(to right, transparent, hsl(var(--brand-primary-dark)))"
      : "linear-gradient(to right, transparent, hsl(var(--brand-primary-lightest)))";

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ width }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{
          duration: 0.5,
          delay: 0.25,
        }}
      >
        {children}
        <motion.div
          variants={{
            hidden: { left: 0 },
            visible: { left: "100%" },
          }}
          initial="hidden"
          animate={slideControls}
          transition={{
            duration: 0.5,
            ease: "easeIn",
          }}
          style={{
            position: "absolute" as const,
            top: "4px",
            bottom: "4px",
            left: "0px",
            right: "0px",
            background: mounted ? background : "transparent",
            zIndex: "20",
          }}
        ></motion.div>
      </motion.div>
    </section>
  );
};
