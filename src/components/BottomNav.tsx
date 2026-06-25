import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Heart, Bell, User } from "lucide-react";

const items = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/search", label: "بحث", icon: Search },
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/notifications", label: "الإشعارات", icon: Bell },
  { to: "/profile", label: "حسابي", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
    >
      <ul className="flex items-center justify-between">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to} className="flex-1">
              <Link to={to} className="flex flex-col items-center gap-1 py-1 text-[11px] font-medium">
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <Icon className={active ? "text-primary" : "text-muted-foreground"} size={22} strokeWidth={active ? 2.4 : 1.8} />
                  {active && <span className="absolute -top-2 h-1 w-1 rounded-full bg-gold" />}
                </span>
                <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
