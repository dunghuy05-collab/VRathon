"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = { border: "0", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,.1)" };

export function DistanceChart({ data }: { data: { week: string; distance: number }[] }) {
  return <ResponsiveContainer width="100%" height={260}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#13251e16" /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="distance" fill="#13251e" radius={[8, 8, 0, 0]} name="Kilômét" /></BarChart></ResponsiveContainer>;
}

export function PaceChart({ data }: { data: { date: string; pace: number }[] }) {
  return <ResponsiveContainer width="100%" height={300}><AreaChart data={data}><defs><linearGradient id="pace" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff6b4a" stopOpacity={.4}/><stop offset="95%" stopColor="#ff6b4a" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#13251e16"/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><YAxis reversed domain={["dataMin - 0.5", "dataMax + 0.5"]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><Tooltip contentStyle={tooltipStyle}/><Area type="monotone" dataKey="pace" stroke="#ff6b4a" strokeWidth={3} fill="url(#pace)" name="Phút/km" /></AreaChart></ResponsiveContainer>;
}

export function ZoneChart({ data }: { data: { zone: string; minutes: number }[] }) {
  return <ResponsiveContainer width="100%" height={300}><BarChart data={data} layout="vertical"><XAxis type="number" hide /><YAxis type="category" dataKey="zone" axisLine={false} tickLine={false}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="minutes" fill="#cbf955" stroke="#13251e" radius={[0, 10, 10, 0]} name="Phút" /></BarChart></ResponsiveContainer>;
}

