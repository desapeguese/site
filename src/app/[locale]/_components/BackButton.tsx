"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export function BackButton() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <Link className={buttonVariants()} href="/" onClick={handleClick}>
      Voltar
    </Link>
  );
}
