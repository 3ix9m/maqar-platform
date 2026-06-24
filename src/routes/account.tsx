import { createFileRoute, Link } from "@tanstack/react-router";
import { User, ClipboardList, Heart, Settings, LogOut, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "حسابي | مَقَر" },
      { name: "description", content: "إدارة حسابك وإعداداتك في مَقَر." },
    ],
  }),
  component: Account,
});

const items = [
  { to: "/account", label: "معلوماتي الشخصية", icon: User },
  { to: "/my-listings", label: "إعلاناتي", icon: ClipboardList },
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/account", label: "الإعدادات", icon: Settings },
  { to: "/account", label: "تسجيل الخروج", icon: LogOut },
] as const;

function Account() {
  return (
    <AppShell>
      <div className="rounded-b-3xl bg-primary px-5 pb-7 pt-6 text-primary-foreground">
        <h1 className="text-center text-base font-bold">حسابي</h1>
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary-foreground/10 ring-2 ring-gold/40">
            <User size={36} className="text-primary-foreground/80" />
          </div>
          <p className="text-base font-bold">أحمد محمد</p>
          <p className="text-xs text-primary-foreground/70">01012345678</p>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2 px-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={label}>
            <Link
              to={to}
              className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-soft"
            >
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
    </AppShell>
  );
}
