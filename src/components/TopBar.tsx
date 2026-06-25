import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Menu, Bell, Heart, Home, Search, User, BookOpen, Building2, ShieldCheck, LogOut, Scale } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/maqar-logo.png";

interface Props {
  variant?: "home" | "page";
  title?: string;
  showFavorite?: boolean;
  backTo?: string;
}

function useUnreadCount() {
  const { user } = useAuth();
  const { data = 0 } = useQuery({
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
  return data as number;
}

const menuItems = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/search", label: "بحث", icon: Search },
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/compare", label: "مقارنة", icon: Scale },
  { to: "/notifications", label: "الإشعارات", icon: Bell },
  { to: "/profile", label: "حسابي", icon: User },
  { to: "/help", label: "الأسئلة الشائعة", icon: BookOpen },
] as const;

function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isAdmin, roles, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Auto-close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on ESC + lock scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/"));

  const rowCls = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
      active ? "bg-primary text-primary-foreground" : "text-primary hover:bg-secondary"
    }`;
  const iconCls = (active: boolean) =>
    `grid h-8 w-8 place-items-center rounded-full ${
      active ? "bg-gold text-primary" : "bg-secondary text-primary"
    }`;

  return (
    <div className="fixed inset-0 z-50" dir="rtl">
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />
      <aside className="absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-primary px-5 py-4 text-primary-foreground">
          <img src={logo} alt="مَقَر" className="h-12 w-auto" />
          <button onClick={onClose} aria-label="إغلاق" className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10">
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
        {user && (
          <div className="border-b border-border px-5 py-3 text-xs text-muted-foreground">
            مرحباً، <span className="font-bold text-primary">{user.email}</span>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="flex flex-col gap-1">
            {menuItems.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <li key={to}>
                  <Link to={to} onClick={onClose} className={rowCls(active)} aria-current={active ? "page" : undefined}>
                    <span className={iconCls(active)}>
                      <Icon size={15} />
                    </span>
                    {label}
                    {active && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-gold" />}
                  </Link>
                </li>
              );
            })}
            {isAdmin && (
              <li>
                <Link to="/admin" onClick={onClose} className={rowCls(isActive("/admin"))} aria-current={isActive("/admin") ? "page" : undefined}>
                  <span className={iconCls(isActive("/admin"))}><ShieldCheck size={15} /></span>
                  لوحة الإدارة
                  {isActive("/admin") && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-gold" />}
                </Link>
              </li>
            )}
            {roles.includes("landlord") && (
              <li>
                <Link to="/landlord" onClick={onClose} className={rowCls(isActive("/landlord"))} aria-current={isActive("/landlord") ? "page" : undefined}>
                  <span className={iconCls(isActive("/landlord"))}><Building2 size={15} /></span>
                  لوحة المالك
                  {isActive("/landlord") && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-gold" />}
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="border-t border-border p-3">
          {user ? (
            <button
              onClick={async () => { await signOut(); onClose(); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-2.5 text-sm font-bold text-destructive"
            >
              <LogOut size={15} /> تسجيل الخروج
            </button>
          ) : (
            <Link
              to="/auth/login"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}

export function TopBar({ variant = "home", title, showFavorite, backTo = "/" }: Props) {
  const unread = useUnreadCount();
  const [open, setOpen] = useState(false);

  if (variant === "home") {
    return (
      <>
        <header className="flex items-center justify-between px-5 pb-2 pt-5">
          <button onClick={() => setOpen(true)} aria-label="القائمة" className="rounded-full p-2 text-primary">
            <Menu size={26} />
          </button>
          <Link to="/" className="flex items-center">
            <img src={logo} alt="مَقَر" className="h-16 w-auto" />
          </Link>
          <Link to="/notifications" aria-label="الإشعارات" className="relative rounded-full p-2 text-primary">
            <Bell size={24} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-primary">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </header>
        <SideDrawer open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <header className="flex items-center justify-between px-5 pb-3 pt-5">
      <Link to={backTo} aria-label="رجوع" className="rounded-full p-2 text-primary">
        <ChevronRight size={24} />
      </Link>
      <h1 className="text-base font-bold text-primary">{title}</h1>
      {showFavorite ? (
        <button aria-label="المفضلة" className="rounded-full p-2 text-primary">
          <Heart size={22} />
        </button>
      ) : (
        <span className="w-10" />
      )}
    </header>
  );
}
