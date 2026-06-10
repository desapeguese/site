"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export const CookieBanner = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 md:bottom-6 left-0 right-0 mx-auto z-[200] w-full px-4 max-w-[600px]"
        >
          <div className="bg-[#FAF8F5] border border-[#0B1B12]/20 text-[#0B1B12] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2rem] p-5 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-espacos-magenta" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
              <div className="hidden sm:block bg-espacos-magenta/10 p-3 rounded-2xl shrink-0">
                <Cookie className="text-espacos-magenta" size={24} />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-base md:text-lg font-bold mb-1 flex items-center justify-center md:justify-start gap-2 text-[#0B1B12]">
                  <Cookie className="sm:hidden text-espacos-magenta" size={18} />
                  Privacidade & Cookies
                </h3>
                <p className="text-xs md:text-sm text-[#0B1B12] leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{" "}
                  <Link href="/politica-de-privacidade" className="text-[#0B1B12] font-semibold underline underline-offset-4">
                    Política
                  </Link>.
                </p>
              </div>

              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={acceptCookies}
                  className="flex-1 border border-[#0B1B12] bg-[#0B1B12] hover:bg-[#183A24] transition-colors text-[#FAF8F5] font-bold py-2.5 md:py-3 px-6 rounded-xl md:rounded-2xl text-xs md:text-sm whitespace-nowrap"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 md:flex-none text-[10px] md:text-xs text-[#0B1B12] hover:underline transition-colors py-2"
                >
                  Recusar
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Fechar aviso de cookies"
              className="absolute top-3 right-3 text-[#0B1B12] hover:opacity-80 p-1"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
