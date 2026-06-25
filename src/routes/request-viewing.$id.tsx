import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Calendar, Clock, Loader2, MessageCircle } from "lucide-react";
import { fetchListing, createViewingRequest } from "@/lib/api";
import { openWhatsApp } from "@/lib/whatsapp";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/request-viewing/$id")({
  head: () => ({ meta: [{ title: "طلب معاينة | مَقَر" }] }),
  loader: async ({ params }) => {
    const l = await fetchListing(params.id);
    if (!l) throw notFound();
    return l;
  },
  notFoundComponent: () => (
    <AppShell><TopBar variant="page" title="طلب معاينة" /><p className="px-5 text-sm text-muted-foreground">العقار غير موجود.</p></AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell><TopBar variant="page" title="طلب معاينة" /><p className="px-5 text-sm text-destructive">{error.message}</p></AppShell>
  ),
  component: RequestViewing,
});

function RequestViewing() {
  const l = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ preferred_date: "", preferred_time: "", notes: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      await createViewingRequest({
        student_id: user.id,
        property_id: l.id,
        preferred_date: form.preferred_date || undefined,
        preferred_time: form.preferred_time || undefined,
        notes: form.notes || undefined,
      });
      setSubmitted(true);
      toast.success("تم إرسال طلب المعاينة بنجاح");
    } catch (e: any) {
      const msg = e.message ?? "حدث خطأ";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <TopBar variant="page" title="طلب معاينة" backTo="/listing/$id" />
      <div className="px-5">
        <div className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft">
          <img src={l.image} alt={l.title} className="h-20 w-24 rounded-xl object-cover" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-primary">{l.title}</h2>
            <p className="truncate text-xs text-muted-foreground">{l.area}</p>
            <p className="mt-1 text-sm font-extrabold text-gold">{l.price.toLocaleString("ar-EG")} <span className="text-[11px] font-medium">ج/شهر</span></p>
          </div>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center">
            <p className="text-base font-extrabold text-primary">تم إرسال طلب المعاينة</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">سيتواصل فريق مَقَر معك قريباً لتأكيد الموعد وترتيب الزيارة.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openWhatsApp(l.title, "أرسلت طلب معاينة عبر التطبيق.")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white"
              >
                <MessageCircle size={16} /> تواصل مع فريق مَقَر عبر واتساب
              </button>
              <Link to="/my-requests" className="inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">عرض طلباتي</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <Field label="التاريخ المفضل" icon={Calendar} type="date" value={form.preferred_date} onChange={(v) => setForm({ ...form, preferred_date: v })} />
            <Field label="الوقت المفضل" icon={Clock} type="time" value={form.preferred_time} onChange={(v) => setForm({ ...form, preferred_time: v })} />
            <div>
              <label className="text-xs font-bold text-primary">ملاحظات (اختياري)</label>
              <div className="mt-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
                <textarea
                  rows={3}
                  dir="rtl"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="اكتب أي تفاصيل تساعدنا في تنسيق المعاينة"
                  className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <p className="text-[11px] leading-6 text-muted-foreground">
              يتم استلام طلبك من فريق مَقَر مباشرة، ولا يتم مشاركة رقم المالك معك. التواصل بالكامل عبر مَقَر.
            </p>
            {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
            <button disabled={loading} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {user ? "إرسال طلب المعاينة" : "سجّل دخولك للمتابعة"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, icon: Icon, type, value, onChange }: { label: string; icon: any; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Icon size={16} className="text-gold" />
        <input type={type} required dir="rtl" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
      </div>
    </div>
  );
}
