import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ListingCard } from "@/components/ListingCard";
import { HeartOff } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchListings, listFavorites, toggleFavorite } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

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
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const { data: listings = [] } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const { data: favIds = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => listFavorites(user!.id),
    enabled: !!user,
  });
  const favs = listings.filter((l) => favIds.includes(l.id));
  const favMut = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) => toggleFavorite(user!.id, id, next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success("تمت إزالته من المفضلة");
    },
    onError: (e: any) => toast.error(e.message || "تعذّر تحديث المفضلة"),
  });

  if (!loading && !user) {
    return (
      <AppShell>
        <TopBar variant="page" title="المفضلة" />
        <div className="mt-12 flex flex-col items-center gap-3 px-5 text-center">
          <p className="text-sm font-bold text-primary">سجّل دخولك لعرض المفضلة</p>
          <Link to="/auth/login" className="mt-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">
            تسجيل الدخول
          </Link>
        </div>
      </AppShell>
    );
  }

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
            {favs.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                variant="row"
                isFavorite
                onToggleFavorite={(id, next) => favMut.mutate({ id, next })}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
