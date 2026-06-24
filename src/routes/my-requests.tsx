import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Plus, MapPin, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { listMyHousingRequests, listMyViewingRequests } from "@/lib/api";
import { resolveImage } from "@/lib/listings";

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

function statusTone(state: string) {
  if (state.includes("تأكيد") || state.includes("نشط")) return { bg: "bg-[oklch(0.95_0.05_150)]", text: "text-[oklch(0.45_0.15_150)]", dot: "bg-[oklch(0.65_0.17_150)]" };
  if (state.includes("مكتمل")) return { bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-muted-foreground" };
  return { bg: "bg-gold/15", text: "text-gold", dot: "bg-gold" };
}

function MyRequests() {
  const [tab, setTab] = useState<Tab>("viewing");
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return (
      <AppShell>
        <TopBar variant="page" title="طلباتي" />
        <div className="mt-12 flex flex-col items-center gap-3 px-5 text-center">
          <p className="text-sm font-bold text-primary">سجّل دخولك لعرض طلباتك</p>
          <Link to="/auth/login" className="mt-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">تسجيل الدخول</Link>
        </div>
      </AppShell>
    );
  }

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

        {tab === "viewing" ? <ViewingList userId={user?.id} /> : <HousingList userId={user?.id} />}
      </div>
    </AppShell>
  );
}

function ViewingList({ userId }: { userId?: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["my-viewings", userId],
    queryFn: () => listMyViewingRequests(userId!),
    enabled: !!userId,
  });
  if (isLoading) return <p className="mt-6 text-center text-xs text-muted-foreground">جارٍ التحميل...</p>;
  if (!data.length) return <p className="mt-12 text-center text-xs text-muted-foreground">لا توجد طلبات معاينة بعد.</p>;
  return (
    <div className="mt-4 flex flex-col gap-3">
      {data.map((it: any) => {
        const tone = statusTone(it.status);
        const days = Math.max(0, Math.floor((Date.now() - new Date(it.created_at).getTime()) / 86400000));
        return (
          <Link key={it.id} to="/listing/$id" params={{ id: it.property_id }} className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft">
            <img src={resolveImage(it.properties?.cover_image)} alt="" className="h-20 w-24 rounded-xl object-cover" />
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <h3 className="truncate text-sm font-bold text-primary">{it.properties?.title}</h3>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin size={11} className="text-gold" /> {it.properties?.area}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone.bg} ${tone.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                  {it.status}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock size={10} /> منذ {days} يوم
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function HousingList({ userId }: { userId?: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["my-housing", userId],
    queryFn: () => listMyHousingRequests(userId!),
    enabled: !!userId,
  });
  return (
    <div className="mt-4 flex flex-col gap-3">
      {isLoading && <p className="text-center text-xs text-muted-foreground">جارٍ التحميل...</p>}
      {!isLoading && data.length === 0 && <p className="text-center text-xs text-muted-foreground">لم تنشر أي طلب سكن بعد.</p>}
      {data.map((h: any) => (
        <div key={h.id} className="rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold text-primary">{h.type} {h.area ? `- ${h.area}` : ""}</p>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">{h.status}</span>
          </div>
          {h.budget && <p className="mt-1 text-xs text-muted-foreground">الميزانية: حتى {Number(h.budget).toLocaleString("ar-EG")} ج/شهر</p>}
          {h.notes && <p className="mt-2 text-xs leading-6 text-muted-foreground">{h.notes}</p>}
        </div>
      ))}
      <Link to="/housing-request" className="flex items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-extrabold text-gold-foreground">
        <Plus size={16} /> نشر طلب سكن جديد
      </Link>
    </div>
  );
}
