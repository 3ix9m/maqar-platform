import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Heart, User } from "lucide-react";

const items = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/profile", label: "حسابي", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      dir="rtl"
      className="fixed inset-x-0 bottom-3 z-40 mx-auto w-fit max-w-[90vw] rounded-full border border-border/60 bg-card/80 px-2 py-1.5 shadow-[0_8px_30px_-10px_rgba(13,34,61,0.35)] backdrop-blur-xl md:hidden animate-fade-in"
    >
      <ul className="flex items-center gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ease-out ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/60"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 1.9}
                  className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110 group-active:scale-95"}`}
                />
                <span
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    active ? "max-w-[80px] opacity-100" : "max-w-0 opacity-0"
                  }`}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold animate-pulse" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
