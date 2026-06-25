import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/maqar-logo.png";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "نسيت كلمة المرور | مَقَر" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setSent(true);
  }

  return (
    <AppShell>
      <TopBar variant="page" title="نسيت كلمة المرور" backTo="/auth" />
      <div className="px-5">
        <div className="flex flex-col items-center">
          <img src={logo} alt="مَقَر" className="h-16 w-auto" />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </p>
        </div>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center">
            <p className="text-sm font-bold text-primary">تم إرسال الرابط ✓</p>
            <p className="mt-2 text-xs text-muted-foreground leading-6">
              راجع بريدك <span className="font-bold">{email}</span> واتبع الرابط لإعادة تعيين كلمة المرور.
            </p>
            <Link to="/auth" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
              العودة لتسجيل الدخول <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
            <div>
              <label className="text-xs font-bold text-primary">البريد الإلكتروني</label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
                <Mail size={16} className="text-gold" />
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
            <button
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              إرسال رابط الاستعادة
            </button>
            <Link to="/auth" className="text-center text-xs font-bold text-muted-foreground">
              تذكرت كلمة المرور؟ تسجيل الدخول
            </Link>
          </form>
        )}
      </div>
    </AppShell>
  );
}
