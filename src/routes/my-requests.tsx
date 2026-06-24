import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { listings } from "@/lib/listings";
import { Plus, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/my-requests")({
  head: () => ({
    meta: [
      { title: "طلباتي | مَقَر" },
      { name: "description", content: "طلبات المعاينة وطلبات السكن الخاصة بك." },
    ],
  }),
  component: MyRequests,
});

type Tab = "viewing" | "housing";

function MyRequests() {
  const [tab, setTab] = useState<Tab>("viewing");

  return (
    <AppShell>
      <TopBar variant="page" title="طلباتي" />
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-full bg-secondary p-1">
          {[
            { id: "viewing" as const, label: "طلبات المعاينة" },
            { id: "housing" as const, label: "طلبات السكن" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
                tab === t.id ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "viewing" ? <ViewingList /> : <HousingList />}
      </div>
    </AppShell>
  );
}

const states = [
  { label: "قيد المراجعة", bg: "bg-gold/15", text: "text-gold", dot: "bg-gold" },
  { label: "تم تأكيد الموعد", bg: "bg-[oklch(0.95_0.05_150)]", text: "text-[oklch(0.45_0.15_150)]", dot: "bg-[oklch(0.65_0.17_150)]" },
  { label: "مكتمل", bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-muted-foreground" },
];

function ViewingList() {
  const items = listings.slice(0, 3).map((l, i) => ({ ...l, state: states[i] }));
  return (
    <div className="mt-4 flex flex-col gap-3">
      {items.map((it) => (
        <Link key={it.id} to="/listing/$id" params={{ id: it.id }} className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft">
          <img src={it.image} alt="" className="h-20 w-24 rounded-xl object-cover" />
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <h3 className="truncate text-sm font-bold text-primary">{it.title}</h3>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin size={11} className="text-gold" /> {it.area}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${it.state.bg} ${it.state.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${it.state.dot}`} />
                {it.state.label}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock size={10} /> منذ يومين
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function HousingList() {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="rounded-2xl bg-card p-4 shadow-soft">
        <div className="flex items-start justify-between">
          <p className="text-sm font-bold text-primary">أوضة مفروشة قرب الجامعة</p>
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">نشط</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">الميزانية: حتى 2,500 ج/شهر</p>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">يفضل أن تكون قريبة من جامعة ميريت، مع واي فاي وتكييف.</p>
      </div>
      <Link to="/housing-request" className="flex items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-extrabold text-gold-foreground">
        <Plus size={16} /> نشر طلب سكن جديد
      </Link>
    </div>
  );
}
