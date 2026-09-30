"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity as ActivityIcon, ArrowUpRight, Gauge, HeartPulse, RefreshCw, Route, Timer } from "lucide-react";
import Link from "next/link";
import { api, Activity, formatDuration, formatPace, Metrics, User } from "@/services/api";
import { StatCard } from "@/components/stat-card";
import { DistanceChart } from "@/components/charts";

export default function Dashboard() {
  const qc = useQueryClient();
  const user = useQuery({ queryKey: ["me"], queryFn: () => api<User>("/auth/me") });
  const metrics = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Metrics>("/analytics/dashboard") });
  const activities = useQuery({ queryKey: ["activities"], queryFn: () => api<Activity[]>("/activities?limit=5") });
  const sync = useMutation({ mutationFn: () => api<{ synced: number }>("/strava/sync", { method: "POST" }), onSuccess: () => { qc.invalidateQueries(); } });
  const connect = async () => { const result = await api<{ authorization_url: string }>("/strava/connect"); window.location.href = result.authorization_url; };
  const summary = metrics.data?.summary;

  return <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-12">
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="eyebrow">Bảng điều khiển</p><h1 className="mt-2 text-4xl font-black tracking-tight">Chào {user.data?.name?.split(" ")[0] ?? "runner"}.</h1><p className="mt-2 text-ink/50">Hôm nay cơ thể bạn nói gì?</p></div>
      {user.data?.strava_connected ? <button className="button-primary" onClick={() => sync.mutate()} disabled={sync.isPending}><RefreshCw size={17} className={sync.isPending ? "animate-spin" : ""}/> {sync.isPending ? "Đang đồng bộ" : "Đồng bộ Strava"}</button> : <button className="button-accent border border-ink" onClick={connect}>Kết nối Strava <ArrowUpRight size={17}/></button>}
    </header>

    <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Quãng đường 7 ngày" value={summary?.weekly_distance_km ?? "—"} suffix="km" icon={Route} accent />
      <StatCard label="Pace trung bình" value={formatPace(summary?.average_pace_min_km ?? null)} suffix="/km" icon={Timer} />
      <StatCard label="Nhịp tim trung bình" value={summary?.average_heartrate ?? "—"} suffix="bpm" icon={HeartPulse} />
      <StatCard label="Tỷ lệ tải ACWR" value={summary?.acwr ?? "—"} suffix={summary?.overtraining_risk === "balanced" ? "ổn định" : ""} icon={Gauge} />
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="card"><div className="mb-7 flex items-center justify-between"><div><p className="eyebrow">Khối lượng</p><h2 className="mt-2 text-2xl font-black">Quãng đường theo tuần</h2></div><span className="rounded-full bg-cream px-3 py-1 text-xs font-bold">12 tuần</span></div><DistanceChart data={metrics.data?.weekly_distance ?? []}/></div>
      <div className="card">
        <div className="flex items-center justify-between"><div><p className="eyebrow">Gần đây</p><h2 className="mt-2 text-2xl font-black">Hoạt động mới</h2></div><ActivityIcon className="text-ink/25"/></div>
        <div className="mt-5 divide-y divide-ink/10">
          {activities.data?.length ? activities.data.map(a => <Link href={`/activities/${a.id}`} key={a.id} className="group flex items-center justify-between py-4"><div><p className="font-bold group-hover:underline">{a.name}</p><p className="mt-1 text-xs text-ink/45">{new Date(a.start_date).toLocaleDateString("vi-VN")} · {formatDuration(a.moving_time)}</p></div><div className="text-right"><p className="font-black">{(a.distance / 1000).toFixed(1)} km</p><p className="mt-1 text-xs text-ink/45">{formatPace(a.moving_time / 60 / (a.distance / 1000))}/km</p></div></Link>) : <div className="py-16 text-center text-sm text-ink/45">Kết nối và đồng bộ Strava để xem hoạt động.</div>}
        </div>
      </div>
    </section>
  </div>;
}

