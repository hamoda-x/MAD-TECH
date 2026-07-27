"use client";

import { useEffect } from "react";
import { trackVisitor } from "@/lib/api";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      trackVisitor(pathname);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
