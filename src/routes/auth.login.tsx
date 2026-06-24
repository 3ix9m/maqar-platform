import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import logo from "@/assets/maqar-logo.png";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | مَقَر" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(form);
    setLoading(false);
    if (error) return setErr(error.message);
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <TopBar variant="page" title="تسجيل الدخول" backTo="/profile" />
      <div className="px-5">
        <div className="flex flex-col items-center">
          <img src={logo} alt="مَقَر" className="h-16 w-auto" />
          <p className="mt-2 text-xs text-muted-foreground">أهلاً بك مجدداً في مَقَر</p>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
          <Field label="البريد الإلكتروني" icon={Mail} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="كلمة المرور" icon={Lock} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
          <button disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            تسجيل الدخول
          </button>
          <p className="text-center text-xs text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/auth/register" className="font-bold text-gold">إنشاء حساب طالب</Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, icon: Icon, value, onChange, type = "text" }: { label: string; icon: any; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Icon size={16} className="text-gold" />
        <input type={type} required dir="rtl" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
    </div>
  );
}
