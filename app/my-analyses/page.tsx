"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyAnalysesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/analyses");
  }, [router]);
  return null;
}
