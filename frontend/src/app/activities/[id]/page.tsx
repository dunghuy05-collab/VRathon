"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, HeartPulse, Mountain, Route, Timer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, ActivityDetail, formatDuration, formatPace } from "@/services/api";

function RouteMap({ points = [] }: { points?: number[][] }) {
  if (!points.length) return <div className="grid h-72 place-items-center rounded-3xl bg-cream text-sm text-ink/40">Hoạt động này không có dữ liệu GPS.</div>;
  const lats = points.map(p => p[0]), lngs = points.map(p => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const path = points.map((p, i) => `${i ? "L" : "M"}${20 + ((p[1]-minLng)/(maxLng-minLng || 1))*560},${260-((p[0]-minLat)/(maxLat-minLat || 1))*220}`).join(" ");
  return <svg viewBox="0 0 600 280" className="h-72 w-full rounded-3xl bg-ink"><defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#ffffff0d"/></pattern></defs><rect width="600" height="280" fill="url(#grid)"/><path d={path} fill="none" stroke="#cbf955" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="20" cy="260" r="7" fill="#fff"/><circle cx={20 + ((points.at(-1)![1]-minLng)/(maxLng-minLng || 1))*560} cy={260-((points.at(-1)![0]-minLat)/(maxLat-minLat || 1))*220} r="7" fill="#ff6b4a"/></svg>;
}

export default function ActivityPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({ queryKey: ["activity", id], queryFn: () => api<ActivityDetail>(`/activities/${id}`) });
  if (isLoading) return <div className="p-12 text-ink/50">Đang tải hoạt động và GPS…</div>;
  if (error || !data) return <div className="p-12 text-red-700">Không thể tải hoạt động.</div>;
  const stream = data.stream;
  const chart = ((stream?.altitude as number[]) ?? []).map((altitude, i) => ({ index: i, altitude, heartrate: ((stream?.heartrate as number[]) ?? [])[i] }));
  const pace = data.distance ? data.moving_time / 60 / (data.distance / 1000) : null;
  return <div className="mx-auto max-w-6xl p-5 sm:p-8 lg:p-12"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-ink/50 hover:text-ink"><ArrowLeft size={17}/> Tổng quan</Link><header className="mt-7"><p className="eyebrow">{new Date(data.start_date).toLocaleDateString("vi-VN", { dateStyle: "full" })}</p><h1 className="mt-2 text-4xl font-black tracking-tight">{data.name}</h1></header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[Route, (data.distance/1000).toFixed(2), "km"], [Timer, formatDuration(data.moving_time), "thời gian"], [HeartPulse, data.average_heartrate ?? "—", "bpm"], [Mountain, data.elevation_gain ?? "—", "m"]].map(([Icon, value, unit], i) => { const I = Icon as typeof Route; return <div className="card" key={i}><I size={20} className="mb-6 text-coral"/><p className="text-3xl font-black">{value as string}</p><p className="mt-1 text-sm text-ink/45">{unit as string}{i===1 ? ` · ${formatPace(pace)}/km` : ""}</p></div>;})}</section>
    <section className="card mt-6"><p className="eyebrow">Dấu chân GPS</p><h2 className="mb-6 mt-2 text-2xl font-black">Lộ trình</h2><RouteMap points={(stream?.latlng as number[][]) ?? []}/></section>
    <section className="card mt-6"><p className="eyebrow">Địa hình & nhịp tim</p><h2 className="mb-6 mt-2 text-2xl font-black">Diễn biến buổi chạy</h2>{chart.length ? <ResponsiveContainer width="100%" height={300}><AreaChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="index" hide/><YAxis yAxisId="left" axisLine={false} tickLine={false}/><YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false}/><Tooltip/><Area yAxisId="left" dataKey="altitude" stroke="#13251e" fill="#cbf955" name="Cao độ"/><Area yAxisId="right" dataKey="heartrate" stroke="#ff6b4a" fill="transparent" name="Nhịp tim"/></AreaChart></ResponsiveContainer> : <p className="py-16 text-center text-ink/40">Không có stream cao độ cho hoạt động này.</p>}</section>
  </div>;
}

