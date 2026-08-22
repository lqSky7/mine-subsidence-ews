"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <meta httpEquiv="refresh" content="0;url=/dashboard" />
    </div>
  );
}
