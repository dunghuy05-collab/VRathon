"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { PaceChart, ZoneChart } from "@/components/charts";
import { api, Metrics } from "@/services/api";

export default function PerformancePage() {
  const { data, isLoading } = useQuery({ queryKey: ["performance"], queryFn: () => api<Metrics>("/analytics/performance") });
  const risk = data?.summary.overtraining_risk;
  return <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-12">
    <header><p className="eyebrow">Phân tích</p><h1 className="mt-2 text-4xl font-black tracking-tight">Hiệu suất</h1><p className="mt-2 text-ink/50">Nhìn ra xu hướng, không chỉ những con số đơn lẻ.</p></header>
    {isLoading ? <p className="mt-12 text-ink/50">Đang phân tích dữ liệu…</p> : <>
      <div className={`mt-9 flex items-center gap-4 rounded-[24px] p-5 ${risk === "high" || risk === "elevated" ? "bg-orange-100 text-orange-950" : "bg-lime/60"}`}>
        {risk === "high" || risk === "elevated" ? <AlertTriangle/> : <CheckCircle2/>}<div><p className="font-black">Tải tập luyện: {risk === "balanced" ? "Cân bằng" : risk === "insufficient_data" ? "Chưa đủ dữ liệu" : "Đang tăng cao"}</p><p className="mt-1 text-sm opacity-65">ACWR hiện tại: {data?.summary.acwr ?? "—"}. Khoảng 0.8–1.3 thường được dùng như một tín hiệu tham khảo, không phải chẩn đoán.</p></div>
      </div>
      <section className="mt-6 grid gap-6 xl:grid-cols-2"><div className="card"><p className="eyebrow">Tốc độ</p><h2 className="mt-2 text-2xl font-black">Xu hướng pace</h2><div className="mt-8"><PaceChart data={data?.pace_trend ?? []}/></div></div><div className="card"><p className="eyebrow">Cường độ</p><h2 className="mt-2 text-2xl font-black">Phân bổ vùng nhịp tim</h2><div className="mt-8"><ZoneChart data={data?.heart_rate_zones ?? []}/></div></div></section>
    </>}
  </div>;
}

