import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { listings } from "@/lib/listings";
import { Calendar, Clock } from "lucide-react";

export const Route = createFileRoute("/request-viewing/$id")({
  head: () => ({ meta: [{ title: "طلب معاينة | مَقَر" }] }),
  loader: ({ params }) => {
    const l = listings.find((x) => x.id === params.id);
    if (!l) throw notFound();
    return l;
  },
  component: RequestViewing,
});

function RequestViewing() {
  const l = Route.useLoaderData();
  const [submitted, setSubmitted] = useState(false);
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
            <Link to="/my-requests" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">عرض طلباتي</Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="mt-5 flex flex-col gap-4"
          >
            <Field label="التاريخ المفضل" icon={Calendar} type="date" />
            <Field label="الوقت المفضل" icon={Clock} type="time" />
            <div>
              <label className="text-xs font-bold text-primary">ملاحظات (اختياري)</label>
              <div className="mt-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
                <textarea rows={3} dir="rtl" placeholder="اكتب أي تفاصيل تساعدنا في تنسيق المعاينة" className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </div>
            </div>
            <p className="text-[11px] leading-6 text-muted-foreground">
              يتم استلام طلبك من فريق مَقَر مباشرة، ولا يتم مشاركة رقم المالك معك. التواصل بالكامل عبر مَقَر.
            </p>
            <button type="submit" className="mt-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card">
              إرسال طلب المعاينة
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, icon: Icon, type }: { label: string; icon: any; type: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Icon size={16} className="text-gold" />
        <input type={type} required dir="rtl" className="w-full bg-transparent text-sm outline-none" />
      </div>
    </div>
  );
}
