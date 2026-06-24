import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Heart, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { listings } from "@/lib/listings";

export const Route = createFileRoute("/my-listings")({
  head: () => ({
    meta: [
      { title: "إعلاناتي | مَقَر" },
      { name: "description", content: "إدارة إعلانات السكن الخاصة بك." },
    ],
  }),
  component: MyListings,
});

function MyListings() {
  const [tab, setTab] = useState<"all" | "active" | "inactive">("all");
  const data = listings.slice(0, 2).map((l, i) => ({ ...l, active: i === 0 }));
  const filtered = data.filter((l) =>
    tab === "all" ? true : tab === "active" ? l.active : !l.active
  );

  const tabs = [
    { id: "all", label: "الكل" },
    { id: "active", label: "نشط" },
    { id: "inactive", label: "غير نشط" },
  ] as const;

  return (
    <AppShell>
      <TopBar variant="page" title="إعلاناتي" />
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-full bg-secondary p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
                tab === t.id ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {filtered.map((l) => (
            <div key={l.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft">
              <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl">
                <img src={l.image} alt={l.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-bold text-primary">{l.title}</h3>
                  <Heart size={18} className="shrink-0 text-muted-foreground" />
                </div>
                <p className="truncate text-xs text-muted-foreground">{l.area}</p>
                <div className="flex items-end justify-between">
                  <p className="text-sm font-extrabold text-gold">
                    {l.price.toLocaleString("ar-EG")} <span className="text-[11px] font-medium">ج/شهر</span>
                  </p>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                      l.active ? "text-[oklch(0.65_0.17_150)]" : "text-destructive"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${l.active ? "bg-[oklch(0.65_0.17_150)]" : "bg-destructive"}`} />
                    {l.active ? "نشط" : "غير نشط"}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin size={11} className="text-gold" />
                  {l.distance}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/add-listing"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3.5 text-sm font-extrabold text-gold-foreground shadow-card"
        >
          <Plus size={18} />
          إضافة إعلان جديد
        </Link>
      </div>
    </AppShell>
  );
}
