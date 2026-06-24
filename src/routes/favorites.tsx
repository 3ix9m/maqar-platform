import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ListingCard } from "@/components/ListingCard";
import { listings } from "@/lib/listings";
import { HeartOff } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة | مَقَر" },
      { name: "description", content: "قائمة الشقق المفضلة لديك في مَقَر." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const favs = listings.slice(0, 2);
  return (
    <AppShell>
      <TopBar variant="page" title="المفضلة" />
      <div className="px-5">
        {favs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground">
              <HeartOff size={26} />
            </span>
            <p className="text-sm font-bold text-primary">لا توجد عناصر مفضلة بعد</p>
            <p className="text-xs text-muted-foreground">احفظ العقارات التي تعجبك للرجوع إليها لاحقاً.</p>
            <Link to="/search" className="mt-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">تصفح العقارات</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favs.map((l) => <ListingCard key={l.id} listing={l} variant="row" />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
