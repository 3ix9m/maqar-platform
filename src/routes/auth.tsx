import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import logo from "@/assets/maqar-logo.png";
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { z } from "zod";


export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "تسجيل الدخول | مَقَر" }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
  const goNext = () => navigate({ to: safeRedirect });
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      setLoading(false);
      if (error) return setErr(error.message);
      goNext();
    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: `${window.location.origin}${safeRedirect}`, data: { full_name: form.full_name, phone: form.phone } },
      });
      setLoading(false);
      if (error) return setErr(error.message);
      goNext();
    }
  }

  return (
    <AppShell>
      <TopBar variant="page" title={mode === "login" ? "تسجيل الدخول" : "حساب جديد"} backTo="/profile" />
      <div className="px-5">
        <div className="flex flex-col items-center">
          <img src={logo} alt="مَقَر" className="h-16 w-auto" />
          <p className="mt-2 text-xs text-muted-foreground">
            {mode === "login" ? "أهلاً بك مجدداً في مَقَر" : "إنشاء حساب طالب للوصول إلى مَقَر"}
          </p>
        </div>

        <div className="mt-5 flex gap-2 rounded-2xl bg-card p-1.5 shadow-soft">
          <TabBtn active={mode === "login"} onClick={() => setMode("login")} label="تسجيل دخول" />
          <TabBtn active={mode === "register"} onClick={() => setMode("register")} label="حساب جديد" />
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
          {mode === "register" && (
            <>
              <Field label="الاسم بالكامل" icon={UserIcon} value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
              <Field label="رقم الهاتف" icon={Phone} type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </>
          )}
          <Field label="البريد الإلكتروني" icon={Mail} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="كلمة المرور" icon={Lock} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />

          {mode === "login" && (
            <Link to="/forgot-password" className="self-end text-[11px] font-bold text-primary hover:text-gold">
              نسيت كلمة المرور؟
            </Link>
          )}

          {mode === "register" && (
            <div className="flex items-start gap-2 rounded-2xl border border-gold/30 bg-gold/5 p-3">
              <ShieldCheck size={16} className="shrink-0 text-gold" />
              <p className="text-[11px] leading-6 text-muted-foreground">
                التسجيل متاح للطلاب فقط. حسابات الملاك يتم إنشاؤها بواسطة إدارة مَقَر.
              </p>
            </div>
          )}

          {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}

          <button disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </button>

          <div className="my-1 flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>أو</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={async () => {
              setErr(null);
              const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
              if (result.error) { toast.error("تعذر الدخول بـ Google"); return; }
              if (result.redirected) return;
              navigate({ to: "/" });
            }}
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-card py-3.5 text-sm font-bold text-primary shadow-soft hover:bg-secondary"
          >
            <GoogleIcon /> المتابعة باستخدام Google
          </button>

          <button
            type="button"
            onClick={async () => {
              setErr(null);
              const result = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
              if (result.error) { toast.error("تعذر الدخول بـ Apple"); return; }
              if (result.redirected) return;
              navigate({ to: "/" });
            }}
            className="flex items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm font-bold text-white shadow-soft hover:opacity-90"
          >
            <AppleIcon /> المتابعة باستخدام Apple
          </button>


          <p className="mt-1 text-center text-[10px] leading-5 text-muted-foreground">
            بإنشاء حساب فإنك توافق على{" "}
            <Link to="/terms" className="font-bold text-primary">الشروط</Link> و
            <Link to="/privacy" className="font-bold text-primary"> سياسة الخصوصية</Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 35.5 24 35.5c-6.3 0-11.5-5.2-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29.1 4.5 24 4.5c-7.5 0-14 4.3-17.7 10.2z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13.1-4.7l-6-5.1c-1.9 1.4-4.4 2.3-7.1 2.3-5.3 0-9.7-3-11.3-7.4l-6.5 5C9.9 39.1 16.4 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6 5.1c-.4.4 6.4-4.7 6.4-14.8 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.9 65.2c30-35.6 27.3-68 26.4-79.7-26.5 1.5-57.2 18-74.7 38.3-19.3 21.8-30.6 48.8-28.2 78.8 28.7 2.2 54.9-12.5 76.5-37.4z"/>
    </svg>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
        active ? "bg-primary text-primary-foreground shadow-card" : "text-primary"
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, icon: Icon, value, onChange, type = "text", required }: { label: string; icon: any; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Icon size={16} className="text-gold" />
        <input type={type} required={required} dir="rtl" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
    </div>
  );
}
