import { Link } from "@tanstack/react-router";
import { ChevronRight, Menu, Bell, Heart } from "lucide-react";
import logo from "@/assets/maqar-logo.png";

interface Props {
  variant?: "home" | "page";
  title?: string;
  showFavorite?: boolean;
  backTo?: string;
}

export function TopBar({ variant = "home", title, showFavorite, backTo = "/" }: Props) {
  if (variant === "home") {
    return (
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <button aria-label="القائمة" className="rounded-full p-2 text-primary">
          <Menu size={24} />
        </button>
        <Link to="/" className="flex items-center">
          <img src={logo} alt="مَقَر" className="h-10 w-auto" />
        </Link>
        <button aria-label="الإشعارات" className="relative rounded-full p-2 text-primary">
          <Bell size={22} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
        </button>
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
