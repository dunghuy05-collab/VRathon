"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (pathname !== "/login" && !localStorage.getItem("token")) router.replace("/login");
  }, [pathname, router]);
  return <main className={pathname === "/login" ? "" : "min-h-screen lg:ml-64"}>{children}</main>;
}

