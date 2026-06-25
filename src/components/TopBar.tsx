import { Link } from "@tanstack/react-router";
import { ChevronRight, Menu, Bell, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

export function TopBar({ variant = "home", title, showFavorite, backTo = "/" }: Props) {
  const unread = useUnreadCount();
  if (variant === "home") {
    return (
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <button aria-label="القائمة" className="rounded-full p-2 text-primary">
          <Menu size={24} />
        </button>
        <Link to="/" className="flex items-center">
          <img src={logo} alt="مَقَر" className="h-10 w-auto" />
        </Link>
        <Link to="/notifications" aria-label="الإشعارات" className="relative rounded-full p-2 text-primary">
          <Bell size={22} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-primary">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </header>
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
