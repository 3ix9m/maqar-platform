import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Heart, Inbox, User, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "./BottomNav";
import logo from "@/assets/maqar-logo.png";

const navItems = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/search", label: "بحث", icon: Search },
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/my-requests", label: "طلباتي", icon: Inbox },
  { to: "/profile", label: "حسابي", icon: User },
] as const;

function DesktopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const { data: unread = 0 } = useQuery({
    queryKey: ["alert-matches-unread", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await (supabase as any)
        .from("alert_matches")
        .select("id", { count: "exact", head: true })
        .eq("student_id", user!.id)
        .eq("read", false);
      return count ?? 0;
    },
    refetchInterval: 60000,
  });
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-background/90 backdrop-blur md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex shrink-0 items-center">
          <img src={logo} alt="مَقَر" className="h-10 w-auto" />
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  active ? "bg-primary text-primary-foreground" : "text-primary hover:bg-secondary"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <Link to="/notifications" aria-label="الإشعارات" className="relative shrink-0 rounded-full p-2 text-primary hover:bg-secondary">
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-primary">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <DesktopNav />
      <div
        className={`relative mx-auto min-h-screen bg-background pb-24 md:pb-10 ${
          wide
            ? "max-w-md sm:max-w-3xl lg:max-w-6xl xl:max-w-7xl"
            : "max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-5xl"
        }`}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
