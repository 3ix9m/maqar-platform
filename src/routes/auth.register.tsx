import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import logo from "@/assets/maqar-logo.png";
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "تسجيل طالب جديد | مَقَر" }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: form.full_name, phone: form.phone },
      },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <TopBar variant="page" title="تسجيل طالب جديد" backTo="/profile" />
      <div className="px-5">
        <div className="flex flex-col items-center">
          <img src={logo} alt="مَقَر" className="h-14 w-auto" />
          <p className="mt-2 text-xs text-muted-foreground">إنشاء حساب طالب جديد للوصول إلى مَقَر</p>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
          <Field label="الاسم بالكامل" icon={UserIcon} value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
          <Field label="البريد الإلكتروني" icon={Mail} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="رقم الهاتف" icon={Phone} type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="كلمة المرور" icon={Lock} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />

          <div className="flex items-start gap-2 rounded-2xl border border-gold/30 bg-gold/5 p-3">
            <ShieldCheck size={16} className="shrink-0 text-gold" />
            <p className="text-[11px] leading-6 text-muted-foreground">
              التسجيل متاح للطلاب فقط. حسابات الملاك يتم إنشاؤها بواسطة إدارة مَقَر.
            </p>
          </div>

          {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}

          <button disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            إنشاء الحساب
          </button>
          <p className="text-center text-xs text-muted-foreground">
            لديك حساب؟{" "}
            <Link to="/auth/login" className="font-bold text-gold">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, icon: Icon, value, onChange, type = "text", required }: { label: string; icon: any; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Icon size={16} className="text-gold" />
        <input
          type={type}
          dir="rtl"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
