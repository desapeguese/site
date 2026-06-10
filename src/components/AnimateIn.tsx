"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimateInProps {
  children: React.ReactNode;
  /** Atraso em ms para efeito de stagger entre cards */
  delay?: number;
  /** Classe adicional no wrapper */
  className?: string;
  /** Margem (rootMargin) para considerar "visível" - default "0px 0px -40px 0px" */
  rootMargin?: string;
}

export function AnimateIn({ children, delay = 0, className = "", rootMargin = "0px 0px -40px 0px" }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={`animate-in-card ${isVisible ? "animate-in-card-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
