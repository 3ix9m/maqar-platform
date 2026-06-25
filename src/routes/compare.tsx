import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { useQuery } from "@tanstack/react-query";
import { fetchListings } from "@/lib/api";
import { useCompare } from "@/hooks/use-compare";
import { useUniversity } from "@/hooks/use-university";
import { distanceKm, formatDistanceKm } from "@/lib/universities";
import { Check, X, Scale, Trash2, ShieldCheck, Star } from "lucide-react";
import type { Listing } from "@/lib/listings";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "مقارنة العقارات | مَقَر" },
      { name: "description", content: "قارن حتى ٣ عقارات جنب بعض بالسعر، التقييم، المسافة عن جامعتك، والمرافق." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { university } = useUniversity();
  const { data: listings = [], isLoading } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });

  const selected = ids
    .map((id) => listings.find((l) => l.id === id))
    .filter(Boolean) as Listing[];

  return (
    <AppShell wide>
      <TopBar variant="page" title="مقارنة العقارات" />

      <div className="px-5">
        {selected.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary">
              <Scale size={24} />
            </span>
            <p className="text-sm font-bold text-primary">لم تختر أي عقار للمقارنة بعد</p>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "جارٍ التحميل..." : "اضغط أيقونة الميزان على أي كرت عقار لإضافته للمقارنة (حد أقصى ٣)."}
            </p>
            <Link to="/search" className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
              تصفّح العقارات
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between text-xs">
              <p className="text-muted-foreground">{selected.length} عقار في المقارنة</p>
              <button onClick={clear} className="flex items-center gap-1 font-bold text-destructive">
                <Trash2 size={12} /> مسح الكل
              </button>
            </div>

            <div className="mt-4 overflow-x-auto pb-4">
              <table className="w-full min-w-[520px] border-separate border-spacing-y-2 text-right text-xs">
                <thead>
                  <tr>
                    <th className="w-28 pe-2 text-[11px] font-bold text-muted-foreground"></th>
                    {selected.map((l) => (
                      <th key={l.id} className="min-w-[160px] rounded-t-2xl bg-card p-2 text-center align-top shadow-soft">
                        <Link to="/listing/$id" params={{ id: l.id }}>
                          <img src={l.image} alt={l.title} className="mx-auto h-24 w-full rounded-xl object-cover" />
                          <p className="mt-2 line-clamp-2 px-1 text-[12px] font-bold text-primary">{l.title}</p>
                        </Link>
                        <button
                          onClick={() => remove(l.id)}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-destructive"
                        >
                          <X size={11} /> إزالة
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <Row label="السعر" cells={selected.map((l) => (
                    <span className="font-extrabold text-gold">{l.price.toLocaleString("ar-EG")} ج</span>
                  ))} />
                  <Row label="النوع" cells={selected.map((l) => l.type)} />
                  <Row label="المنطقة" cells={selected.map((l) => l.area || "—")} />
                  <Row
                    label={university ? `المسافة عن ${university.name}` : "المسافة"}
                    cells={selected.map((l) => {
                      if (!university) return "اختر جامعتك";
                      if (l.latitude == null || l.longitude == null) return "—";
                      return formatDistanceKm(distanceKm(university, { lat: l.latitude, lng: l.longitude }));
                    })}
                  />
                  <Row label="الحالة" cells={selected.map((l) => l.status)} />
                  <Row label="الغرف" cells={selected.map((l) => l.rooms)} />
                  <Row label="الحمامات" cells={selected.map((l) => l.baths)} />
                  <Row label="التقييم" cells={selected.map((l) => (
                    <span className="inline-flex items-center gap-1 font-bold text-primary">
                      <Star size={11} className="fill-gold text-gold" />
                      {l.rating.toFixed(1)} ({l.ratingsCount})
                    </span>
                  ))} />
                  <Row label="موثقة" cells={selected.map((l) => l.verified ? (
                    <span className="inline-flex items-center gap-1 font-bold text-gold"><ShieldCheck size={12} /> نعم</span>
                  ) : <span className="text-muted-foreground"><X size={12} className="inline" /> لا</span>)} />
                  <Row label="تم تأجيرها سابقًا" cells={selected.map((l) => l.previouslyRented ? (
                    <Check size={14} className="inline text-emerald-600" />
                  ) : <X size={14} className="inline text-muted-foreground" />)} />
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return (
    <tr>
      <td className="pe-2 align-middle text-[11px] font-bold text-muted-foreground">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="bg-card p-2 text-center align-middle text-primary shadow-soft">{c}</td>
      ))}
    </tr>
  );
}
