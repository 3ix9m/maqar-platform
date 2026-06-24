import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Building2, DoorOpen, BedDouble, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createHousingRequest } from "@/lib/api";

export const Route = createFileRoute("/housing-request")({
  head: () => ({
    meta: [
      { title: "نشر طلب سكن | مَقَر" },
      { name: "description", content: "أخبرنا بما تبحث عنه ودعنا نرشّح لك السكن المناسب." },
    ],
  }),
  component: HousingRequest,
});

const types = [
  { id: "شقة كاملة", label: "شقة كاملة", icon: Building2 },
  { id: "أوضة مفروشة", label: "أوضة", icon: DoorOpen },
  { id: "سرير", label: "سرير", icon: BedDouble },
];

function HousingRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState("أوضة مفروشة");
  const [budget, setBudget] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate({ to: "/auth/login" });
    setLoading(true);
    setErr(null);
    try {
      await createHousingRequest({
        student_id: user.id,
        type,
        budget: budget ? Number(budget) : null,
        area: area || null,
        notes: notes || null,
      });
      setDone(true);
    } catch (e: any) {
      setErr(e.message ?? "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AppShell>
        <TopBar variant="page" title="نشر طلب سكن" />
        <div className="px-5">
          <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 text-center">
            <Sparkles className="mx-auto text-gold" size={28} />
            <p className="mt-3 text-base font-extrabold text-primary">تم نشر طلب السكن</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">سيقوم فريق مَقَر بمراجعة طلبك وترشيح أنسب الخيارات لك.</p>
            <Link to="/my-requests" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">عرض طلباتي</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar variant="page" title="نشر طلب سكن" />
      <form onSubmit={submit} className="flex flex-col gap-5 px-5 pb-6">
        <div>
          <label className="text-xs font-bold text-primary">نوع السكن</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {types.map(({ id, label, icon: Icon }) => {
              const active = type === id;
              return (
                <button key={id} type="button" onClick={() => setType(id)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-bold transition ${
                    active ? "border-gold bg-gold/10 text-primary" : "border-border bg-card text-muted-foreground"
                  }`}>
                  <Icon size={20} className={active ? "text-gold" : "text-muted-foreground"} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="الميزانية الشهرية (جنيه)" value={budget} onChange={setBudget} type="number" placeholder="مثال: 2500" />
        <Field label="المنطقة المفضلة" value={area} onChange={setArea} placeholder="مثال: قريب من الجامعة" />
        <div>
          <label className="text-xs font-bold text-primary">ملاحظات</label>
          <div className="mt-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
            <textarea
              rows={4}
              dir="rtl"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي تفاصيل تساعدنا في ترشيح السكن المناسب"
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}

        <button disabled={loading} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {user ? "نشر الطلب" : "سجّل دخولك للمتابعة"}
        </button>
      </form>
    </AppShell>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <input type={type} dir="rtl" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
    </div>
  );
}
