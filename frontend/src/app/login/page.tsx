"use client";

import { Activity, ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function previewDemo() {
    setLoading(true); setError("");
    try {
      const result = await api<{ access_token: string }>("/auth/demo", { method: "POST" });
      localStorage.setItem("token", result.access_token);
      router.push("/");
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể tạo bản demo"); }
    finally { setLoading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api<{ access_token: string }>(`/auth/${register ? "register" : "login"}`, { method: "POST", body: JSON.stringify(data) });
      localStorage.setItem("token", result.access_token);
      router.push("/");
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể đăng nhập"); }
    finally { setLoading(false); }
  }

  return <div className="grid min-h-screen lg:grid-cols-2">
    <section className="relative hidden overflow-hidden bg-ink p-16 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[80px] border-lime/10" />
      <div className="flex items-center gap-3 text-xl font-black"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-ink"><Activity /></span> MarathonVis</div>
      <div className="relative max-w-lg"><p className="eyebrow !text-lime">Run smarter. Recover better.</p><h1 className="mt-5 text-6xl font-black leading-[1.03] tracking-tight">Mỗi bước chạy đều kể một câu chuyện.</h1><p className="mt-6 text-lg leading-8 text-white/55">Biến dữ liệu Strava thành quyết định tập luyện rõ ràng, khoa học và phù hợp riêng với bạn.</p></div>
      <p className="text-sm text-white/30">Dữ liệu của bạn. Tiến bộ của bạn.</p>
    </section>
    <section className="flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-3 text-xl font-black lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-lime"><Activity size={20}/></span> MarathonVis</div>
        <p className="eyebrow">Chào mừng trở lại</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight">{register ? "Tạo tài khoản" : "Sẵn sàng chạy?"}</h2>
        <p className="mt-3 text-ink/50">{register ? "Bắt đầu hành trình tập luyện thông minh." : "Đăng nhập để xem tiến độ mới nhất."}</p>
        <form onSubmit={submit} className="mt-9 space-y-4">
          {register && <input className="input" name="name" placeholder="Tên của bạn" required minLength={2} />}
          <input className="input" name="email" type="email" placeholder="Email" required />
          <input className="input" name="password" type="password" placeholder="Mật khẩu (tối thiểu 8 ký tự)" required minLength={8} />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <button className="button-primary w-full" disabled={loading}>{loading ? "Đang xử lý…" : register ? "Tạo tài khoản" : "Đăng nhập"}<ArrowRight size={17}/></button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-ink/30"><span className="h-px flex-1 bg-ink/10"/>hoặc<span className="h-px flex-1 bg-ink/10"/></div>
        <button onClick={previewDemo} disabled={loading} className="button-accent w-full border border-ink">Xem dashboard với dữ liệu demo <ArrowRight size={17}/></button>
        <button onClick={() => { setRegister(!register); setError(""); }} className="mt-6 w-full text-center text-sm font-bold text-ink/55 hover:text-ink">{register ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}</button>
      </div>
    </section>
  </div>;
}

