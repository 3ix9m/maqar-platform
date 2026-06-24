import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ListingCard } from "@/components/ListingCard";
import { listings } from "@/lib/listings";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة | مَقَر" },
      { name: "description", content: "قائمة الشقق المفضلة لديك." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const favs = listings.slice(0, 3);
  return (
    <AppShell>
      <TopBar variant="page" title="المفضلة" />
      <div className="px-5">
        {favs.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">لا توجد عناصر مفضلة بعد.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {favs.map((l) => (
              <ListingCard key={l.id} listing={l} variant="row" />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
