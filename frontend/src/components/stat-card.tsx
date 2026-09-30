import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, suffix, icon: Icon, accent = false }: { label: string; value: string | number; suffix?: string; icon: LucideIcon; accent?: boolean }) {
  return <div className={`card relative overflow-hidden ${accent ? "bg-ink text-white" : ""}`}>
    <div className={`mb-8 grid h-10 w-10 place-items-center rounded-2xl ${accent ? "bg-lime text-ink" : "bg-cream"}`}><Icon size={19} /></div>
    <p className={`text-sm font-semibold ${accent ? "text-white/55" : "text-ink/50"}`}>{label}</p>
    <p className="mt-1 text-3xl font-black tracking-tight">{value} <span className="text-base font-bold opacity-50">{suffix}</span></p>
  </div>;
}

