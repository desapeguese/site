"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id?: string;
  "aria-labelledby"?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
}) => (
  <section id={id} className={cn("scroll-mt-24", className)} aria-labelledby={ariaLabelledBy}>
    {children}
  </section>
);
