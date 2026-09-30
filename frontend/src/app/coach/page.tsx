"use client";

import { FormEvent, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function CoachPage() {
  const [goal, setGoal] = useState("Hoàn thành half marathon trong 12 tuần, ưu tiên an toàn và cải thiện sức bền");
  const coach = useMutation({ mutationFn: () => api<{ report: string; generated_by: string }>("/coach/report", { method: "POST", body: JSON.stringify({ goal }) }) });
  const submit = (event: FormEvent) => { event.preventDefault(); coach.mutate(); };
  return <div className="mx-auto max-w-5xl p-5 sm:p-8 lg:p-12">
    <header><p className="eyebrow">Trợ lý cá nhân</p><h1 className="mt-2 flex items-center gap-3 text-4xl font-black tracking-tight">AI Coach <Sparkles className="text-coral"/></h1><p className="mt-2 max-w-2xl text-ink/50">Kết hợp lịch sử chạy, tải tập luyện và mục tiêu để tạo khuyến nghị cho tuần tới.</p></header>
    <section className="card mt-9 bg-ink text-white"><form onSubmit={submit}><label className="text-sm font-bold text-white/60">Mục tiêu hiện tại của bạn</label><textarea value={goal} onChange={e => setGoal(e.target.value)} className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none focus:border-lime" minLength={3}/><button className="button-accent mt-4" disabled={coach.isPending}><Bot size={18}/>{coach.isPending ? "Đang phân tích…" : "Tạo báo cáo huấn luyện"}</button></form></section>
    {coach.isError && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{coach.error.message}</p>}
    {coach.data && <article className="card mt-6"><div className="flex items-center justify-between"><p className="eyebrow">Kế hoạch dành cho bạn</p><span className="rounded-full bg-lime px-3 py-1 text-xs font-bold">{coach.data.generated_by === "fallback" ? "Phân tích cơ bản" : "AI generated"}</span></div><div className="mt-6 whitespace-pre-wrap text-[15px] leading-8 text-ink/80">{coach.data.report}</div><p className="mt-8 border-t border-ink/10 pt-4 text-xs text-ink/40">Thông tin chỉ mang tính tham khảo tập luyện, không thay thế tư vấn y tế.</p></article>}
  </div>;
}

