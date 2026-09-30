import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "MarathonVis — AI Running Coach",
  description: "Phân tích quá trình tập luyện và nhận khuyến nghị từ AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><Providers><Nav /><Shell>{children}</Shell></Providers></body></html>;
}

