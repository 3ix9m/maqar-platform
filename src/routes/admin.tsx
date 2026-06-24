import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { listings, statusTone } from "@/lib/listings";
import { Users, Building2, Inbox, CheckCircle2, UserPlus, Plus, Edit3, Trash2, BarChart3, Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة | مَقَر" }] }),
  component: AdminDashboard,
});

type Tab = "overview" | "properties" | "requests" | "users";

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <AppShell>
      <TopBar variant="page" title="لوحة الإدارة" backTo="/profile" />
      <div className="px-5">
        <div className="flex gap-1 overflow-x-auto rounded-full bg-secondary p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "overview", label: "نظرة عامة" },
            { id: "properties", label: "العقارات" },
            { id: "requests", label: "الطلبات" },
            { id: "users", label: "المستخدمون" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                tab === t.id ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview />}
        {tab === "properties" && <Properties />}
        {tab === "requests" && <Requests />}
        {tab === "users" && <UsersTab />}
      </div>
    </AppShell>
  );
}

function Overview() {
  const stats = [
    { label: "الطلاب", value: 348, icon: Users, tone: "text-gold" },
    { label: "الملاك", value: 42, icon: Building2, tone: "text-gold" },
    { label: "العقارات", value: 126, icon: Building2, tone: "text-gold" },
    { label: "طلبات نشطة", value: 19, icon: Inbox, tone: "text-gold" },
    { label: "إيجارات منجزة", value: 87, icon: CheckCircle2, tone: "text-gold" },
    { label: "متوسط التقييم", value: "4.7", icon: Star, tone: "text-gold" },
  ];
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon size={16} className={tone} />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-card">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-gold" />
          <p className="text-sm font-bold">رؤى سوق السكن</p>
        </div>
        <p className="mt-2 text-xs leading-6 text-primary-foreground/80">
          متوسط الإيجار ارتفع 8٪ هذا الفصل، والطلب الأعلى على الأوض المفروشة.
        </p>
      </div>
    </>
  );
}

function Properties() {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <button className="flex items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-extrabold text-gold-foreground">
        <Plus size={16} /> إضافة عقار جديد
      </button>
      {listings.map((l) => {
        const t = statusTone(l.status);
        return (
          <div key={l.id} className="rounded-2xl bg-card p-3 shadow-soft">
            <div className="flex gap-3">
              <img src={l.image} alt="" className="h-20 w-24 rounded-xl object-cover" />
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <h3 className="truncate text-sm font-bold text-primary">{l.title}</h3>
                  <p className="truncate text-xs text-muted-foreground">{l.area}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${t.bg} ${t.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                    {l.status}
                  </span>
                  <p className="text-sm font-extrabold text-gold">{l.price.toLocaleString("ar-EG")} ج</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1 rounded-full bg-secondary py-2 text-xs font-bold text-primary">
                <Edit3 size={13} /> تعديل
              </button>
              <button className="flex flex-1 items-center justify-center gap-1 rounded-full bg-destructive/10 py-2 text-xs font-bold text-destructive">
                <Trash2 size={13} /> حذف
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Requests() {
  const reqs = [
    { who: "أحمد محمد", what: "طلب معاينة - شقة ميريت", state: "قيد المراجعة" },
    { who: "سارة خالد", what: "طلب سكن - أوضة", state: "جديد" },
    { who: "محمد علي", what: "طلب معاينة - سرير مشترك", state: "تم التأكيد" },
  ];
  return (
    <div className="mt-4 flex flex-col gap-3">
      {reqs.map((r, i) => (
        <div key={i} className="rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-primary">{r.who}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{r.what}</p>
            </div>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">{r.state}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground">قبول</button>
            <button className="flex-1 rounded-full bg-secondary py-2 text-xs font-bold text-primary">تواصل</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <button className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">
        <UserPlus size={16} /> إنشاء حساب مالك
      </button>
      {[
        { name: "محمد علي", role: "مالك", count: "3 عقارات" },
        { name: "أحمد محمد", role: "طالب", count: "5 طلبات" },
        { name: "سارة خالد", role: "طالب", count: "2 طلبات" },
      ].map((u, i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
              <Users size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-primary">{u.name}</p>
              <p className="text-[11px] text-muted-foreground">{u.role} · {u.count}</p>
            </div>
          </div>
          <button className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-primary">إدارة</button>
        </div>
      ))}
    </div>
  );
}
