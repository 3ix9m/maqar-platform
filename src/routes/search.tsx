import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, SlidersHorizontal, ShieldCheck, MapIcon, List, X, Bell } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ListingCard } from "@/components/ListingCard";
import { PropertyMap } from "@/components/PropertyMap";
import { UniversityPicker } from "@/components/UniversityPicker";
import { PriceAlertDialog } from "@/components/PriceAlertDialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchListings, listFavorites, toggleFavorite } from "@/lib/api";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUniversity } from "@/hooks/use-university";
import { distanceKm } from "@/lib/universities";
import { toast } from "sonner";
import type { ListingType } from "@/lib/listings";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "البحث | مَقَر" },
      { name: "description", content: "ابحث وفلتر العقارات حسب السعر والنوع والتوثيق وشاهدها على الخريطة." },
    ],
  }),
  component: SearchPage,
});

const TYPES: ListingType[] = ["شقة كاملة", "أوضة مفروشة", "سرير"];

function SearchPage() {
  const { user } = useAuth();
  const { university } = useUniversity();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [types, setTypes] = useState<ListingType[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<string>("");
  const [alertOpen, setAlertOpen] = useState(false);

  const { data: listings = [], isLoading } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const { data: favIds = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => listFavorites(user!.id),
    enabled: !!user,
  });

  const favMut = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) => toggleFavorite(user!.id, id, next),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success(vars.next ? "تمت إضافته إلى المفضلة" : "تمت إزالته من المفضلة");
    },
    onError: (e: any) => toast.error(e.message || "تعذّر تحديث المفضلة"),
  });

  const handleFav = (id: string, next: boolean) => {
    if (!user) return toast.error("سجّل دخولك لحفظ المفضلة");
    favMut.mutate({ id, next });
  };

  const results = useMemo(() => {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    const maxD = maxDistance ? Number(maxDistance) : Infinity;
    return listings.filter((l) => {
      if (q && !`${l.title} ${l.area} ${l.type}`.includes(q)) return false;
      if (l.price < min || l.price > max) return false;
      if (types.length && !types.includes(l.type)) return false;
      if (verifiedOnly && !l.verified) return false;
      if (university && maxDistance) {
        if (l.latitude == null || l.longitude == null) return false;
        const km = distanceKm(university, { lat: l.latitude, lng: l.longitude });
        if (km > maxD) return false;
      }
      return true;
    });
  }, [listings, q, minPrice, maxPrice, types, verifiedOnly, university, maxDistance]);

  const activeFilterCount =
    (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + types.length + (verifiedOnly ? 1 : 0) + (maxDistance ? 1 : 0);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setTypes([]);
    setVerifiedOnly(false);
    setMaxDistance("");
  };

  return (
    <AppShell>
      <TopBar variant="page" title="البحث" />
      <div className="px-5">
        <UniversityPicker />
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
          <SearchIcon size={18} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم العقار أو المنطقة..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            dir="rtl"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="مسح" className="text-muted-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-soft"
          >
            <SlidersHorizontal size={14} className="text-gold" />
            الفلاتر {activeFilterCount > 0 && <span className="rounded-full bg-gold px-1.5 text-[10px] text-gold-foreground">{activeFilterCount}</span>}
          </button>
          <button
            type="button"
            onClick={() => setVerifiedOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-soft ${verifiedOnly ? "border-gold bg-gold/10 text-gold" : "border-border bg-card text-primary"}`}
          >
            <ShieldCheck size={14} className={verifiedOnly ? "text-gold" : "text-muted-foreground"} />
            موثقة فقط
          </button>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                toast.error("سجّل دخولك أولاً");
                return;
              }
              setAlertOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold shadow-soft"
          >
            <Bell size={14} /> تنبيه سعر
          </button>
          <div className="ms-auto flex overflow-hidden rounded-full border border-border bg-card shadow-soft">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-bold ${view === "list" ? "bg-primary text-primary-foreground" : "text-primary"}`}
            >
              <List size={13} /> قائمة
            </button>
            <button
              type="button"
              onClick={() => setView("map")}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-bold ${view === "map" ? "bg-primary text-primary-foreground" : "text-primary"}`}
            >
              <MapIcon size={13} /> خريطة
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-3 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div>
              <p className="mb-1.5 text-xs font-bold text-primary">السعر (ج/شهر)</p>
              <div className="flex items-center gap-2">
                <input
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
                  placeholder="من"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none"
                />
                <span className="text-muted-foreground">—</span>
                <input
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                  placeholder="إلى"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold text-primary">نوع العقار</p>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => {
                  const active = types.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setTypes((prev) => (active ? prev.filter((x) => x !== t) : [...prev, t]))
                      }
                      className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-gold underline-offset-2 hover:underline"
              >
                مسح كل الفلاتر
              </button>
            )}
          </div>
        )}

        <p className="mt-5 text-xs text-muted-foreground">
          {isLoading ? "جارٍ التحميل..." : `${results.length} نتيجة مطابقة`}
        </p>

        {view === "map" && (
          <div className="mt-3">
            <PropertyMap listings={results} />
          </div>
        )}

        <div className="mt-3 flex flex-col gap-3 pb-4">
          {!isLoading && results.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <SearchIcon size={28} className="text-muted-foreground" />
              <p className="text-sm font-bold text-primary">لا توجد عقارات بهذه المعايير</p>
              <p className="text-xs text-muted-foreground">جرّب تعديل الفلاتر أو توسيع نطاق السعر.</p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          ) : (
            results.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                variant="row"
                isFavorite={favIds.includes(l.id)}
                onToggleFavorite={handleFav}
              />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
