"use client";

import { Activity, Bot, ChartNoAxesCombined, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/performance", label: "Hiệu suất", icon: ChartNoAxesCombined },
  { href: "/coach", label: "AI Coach", icon: Bot },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/login") return null;
  return (
    <aside className="border-b border-ink/10 bg-ink text-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0">
      <div className="flex h-20 items-center justify-between px-6 lg:h-auto lg:py-8">
        <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime text-ink"><Activity size={22} /></span>
          MarathonVis
        </Link>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:pt-6">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? "bg-lime text-ink" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon size={18} />{label}</Link>;
        })}
      </nav>
      <button onClick={() => { localStorage.removeItem("token"); router.push("/login"); }} className="mx-4 mb-6 mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/50 hover:text-white lg:absolute lg:bottom-0 lg:w-[calc(100%-2rem)]">
        <LogOut size={18} /> Đăng xuất
      </button>
    </aside>
  );
}

