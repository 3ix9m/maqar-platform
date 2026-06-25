import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Lock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "إعادة تعيين كلمة المرور | مَقَر" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Supabase recovery link sets a session via URL hash automatically
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pwd.length < 6) return setErr("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    if (pwd !== pwd2) return setErr("كلمتا المرور غير متطابقتين");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) return setErr(error.message);
    toast.success("تم تحديث كلمة المرور");
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <TopBar variant="page" title="كلمة مرور جديدة" backTo="/auth" />
      <div className="px-5">
        <p className="mt-2 text-center text-xs text-muted-foreground">
          اختر كلمة مرور جديدة وآمنة لحسابك
        </p>

        {!ready ? (
          <div className="mt-8 rounded-2xl bg-card p-6 text-center shadow-soft">
            <Loader2 className="mx-auto animate-spin text-gold" size={20} />
            <p className="mt-3 text-xs text-muted-foreground">
              جارٍ التحقق من رابط إعادة التعيين... تأكد من فتحه من نفس البريد.
            </p>
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
            <Field label="كلمة المرور الجديدة" value={pwd} onChange={setPwd} />
            <Field label="تأكيد كلمة المرور" value={pwd2} onChange={setPwd2} />
            {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
            <button
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              حفظ كلمة المرور
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Lock size={16} className="text-gold" />
        <input
          type="password"
          required
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}
