import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Building2, DoorOpen, BedDouble, Sparkles } from "lucide-react";

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
  { id: "apt", label: "شقة كاملة", icon: Building2 },
  { id: "room", label: "أوضة", icon: DoorOpen },
  { id: "bed", label: "سرير", icon: BedDouble },
];

function HousingRequest() {
  const [type, setType] = useState("room");
  const [done, setDone] = useState(false);

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
      <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="flex flex-col gap-5 px-5 pb-6">
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

        <Field label="الميزانية الشهرية (جنيه)" placeholder="مثال: 2500" />
        <Field label="المنطقة المفضلة" placeholder="مثال: قريب من الجامعة" />
        <div>
          <label className="text-xs font-bold text-primary">ملاحظات</label>
          <div className="mt-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
            <textarea rows={4} dir="rtl" placeholder="اكتب أي تفاصيل تساعدنا في ترشيح السكن المناسب" className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
        </div>

        <button type="submit" className="mt-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card">
          نشر الطلب
        </button>
      </form>
    </AppShell>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <input dir="rtl" placeholder={placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
    </div>
  );
}
