import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { User, Heart, Inbox, BookOpen, HelpCircle, Settings, LogOut, ChevronLeft, Building2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "حسابي | مَقَر" },
      { name: "description", content: "إدارة حسابك في مَقَر." },
    ],
  }),
  component: Profile,
});

const items = [
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/my-requests", label: "طلباتي", icon: Inbox },
  { to: "/housing-request", label: "نشر طلب سكن", icon: Building2 },
  { to: "/guide", label: "دليل السكن الطلابي", icon: BookOpen },
  { to: "/faq", label: "الأسئلة الشائعة", icon: HelpCircle },
  { to: "/profile", label: "الإعدادات", icon: Settings },
] as const;

const tools = [
  { to: "/landlord", label: "لوحة المالك", icon: Building2 },
  { to: "/admin", label: "لوحة الإدارة", icon: ShieldCheck },
] as const;

function Profile() {
  return (
    <AppShell>
      <div className="rounded-b-3xl bg-primary px-5 pb-7 pt-6 text-primary-foreground">
        <h1 className="text-center text-base font-bold">حسابي</h1>
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary-foreground/10 ring-2 ring-gold/40">
            <User size={36} className="text-primary-foreground/80" />
          </div>
          <p className="text-base font-bold">أحمد محمد</p>
          <p className="text-xs text-primary-foreground/70">طالب · جامعة ميريت</p>
          <Link to="/auth/login" className="mt-2 rounded-full border border-gold/40 px-4 py-1.5 text-[11px] font-bold text-gold">تسجيل الدخول</Link>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2 px-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={label}>
            <Link to={to} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-soft">
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-bold text-primary">{label}</span>
              </span>
              <ChevronLeft size={18} className="text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 px-5">
        <p className="mb-2 text-[11px] font-bold text-muted-foreground">للموظفين</p>
        <ul className="flex flex-col gap-2">
          {tools.map(({ to, label, icon: Icon }) => (
            <li key={label}>
              <Link to={to} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-soft">
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-bold text-primary">{label}</span>
                </span>
                <ChevronLeft size={18} className="text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 px-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-card py-3 text-sm font-bold text-destructive">
          <LogOut size={16} /> تسجيل الخروج
        </button>
      </div>
    </AppShell>
  );
}
