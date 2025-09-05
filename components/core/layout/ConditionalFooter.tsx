"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide Footer on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <Footer />;
}
