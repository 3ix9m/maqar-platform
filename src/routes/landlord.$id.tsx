import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Star, CalendarDays, MessageCircle, Clock, ShieldCheck, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fetchListings } from "@/lib/api";
import { statusTone } from "@/lib/listings";

export const Route = createFileRoute("/landlord/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "ملف المالك | مَقَر" },
      { name: "description", content: "ملف المالك على مَقَر — عقاراته، تقييماته، ومعدل الرد." },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: `https://maqar.lovable.app/landlord/${params.id}` }],
  }),
  component: LandlordProfile,
});

interface LandlordRow {
  id: string;
  full_name: string;
  created_at: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0))
    .join("");
}

function formatJoined(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long" });
}

function formatHours(h: number) {
  if (!isFinite(h) || h <= 0) return "—";
  if (h < 1) return `${Math.round(h * 60)} د`;
  if (h < 48) return `${h.toFixed(1).replace(/\.0$/, "")} س`;
  return `${Math.round(h / 24)} يوم`;
}

function LandlordProfile() {
  const { id } = Route.useParams();

  const { data: landlord, isLoading: lLoading } = useQuery<LandlordRow | null>({
    queryKey: ["landlord-public", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landlords")
        .select("id, full_name, created_at")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as LandlordRow;
    },
  });

  const { data: allListings = [], isLoading: pLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
  });
  const myProps = allListings.filter((l) => l.landlordId === id);

  const { data: ratingsAgg } = useQuery({
    queryKey: ["landlord-ratings-agg", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landlord_ratings")
        .select("rating")
        .eq("landlord_id", id);
      if (error) throw error;
      const arr = (data ?? []) as { rating: number }[];
      const count = arr.length;
      const avg = count ? arr.reduce((s, r) => s + Number(r.rating || 0), 0) / count : 0;
      return { count, avg };
    },
  });

  const { data: responseStats } = useQuery({
    queryKey: ["landlord-response-stats", id, myProps.map((p) => p.id).join(",")],
    enabled: myProps.length > 0,
    queryFn: async () => {
      const ids = myProps.map((p) => p.id);
      const { data, error } = await supabase
        .from("viewing_requests")
        .select("status, created_at, updated_at")
        .in("property_id", ids);
      if (error) throw error;
      const rows = (data ?? []) as { status: string; created_at: string; updated_at: string }[];
      const total = rows.length;
      const responded = rows.filter((r) => r.status && r.status !== "pending" && r.status !== "قيد المراجعة");
      const rate = total ? Math.round((responded.length / total) * 100) : 0;
      const hours =
        responded.length > 0
          ? responded.reduce((s, r) => {
              const dt =
                (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60);
              return s + Math.max(0, dt);
            }, 0) / responded.length
          : 0;
      return { rate, hours, total };
    },
  });

  const loading = lLoading || pLoading;

  return (
    <AppShell>
      <TopBar variant="page" title="ملف المالك" />
      <div className="px-5 pb-6">
        {/* Profile Card */}
        {loading || !landlord ? (
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/85 p-5 text-primary-foreground shadow-card transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gold text-2xl font-extrabold text-gold-foreground ring-4 ring-primary-foreground/10">
                {initials(landlord.full_name) || "م"}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-extrabold">{landlord.full_name}</h1>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-primary-foreground/70">
                  <CalendarDays size={12} /> منضم منذ {formatJoined(landlord.created_at)}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                  <ShieldCheck size={11} /> مالك موثّق عبر مَقَر
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: "عدد العقارات",
              value: loading ? null : myProps.length,
              icon: Building2,
            },
            {
              label: "عدد التقييمات",
              value: ratingsAgg ? ratingsAgg.count : null,
              icon: Star,
              extra: ratingsAgg && ratingsAgg.count ? `${ratingsAgg.avg.toFixed(1)} ★` : null,
            },
            {
              label: "نسبة الرد",
              value: responseStats ? `${responseStats.rate}%` : myProps.length === 0 ? "—" : null,
              icon: MessageCircle,
            },
            {
              label: "متوسط الرد",
              value: responseStats ? formatHours(responseStats.hours) : myProps.length === 0 ? "—" : null,
              icon: Clock,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 rounded-2xl bg-card p-3 text-center shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5"
            >
              <s.icon size={16} className="text-gold" />
              {s.value === null ? (
                <Skeleton className="h-5 w-10" />
              ) : (
                <p className="text-base font-extrabold text-primary">{s.value}</p>
              )}
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              {s.extra && <p className="text-[10px] font-bold text-gold">{s.extra}</p>}
            </div>
          ))}
        </div>

        {/* Properties */}
        <h2 className="mt-6 text-sm font-bold text-primary">عقارات المالك</h2>
        <div className="mt-3 flex flex-col gap-3">
          {loading &&
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft">
                <Skeleton className="h-20 w-24 rounded-xl" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}

          {!loading && myProps.length === 0 && (
            <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-soft">
              لا توجد عقارات منشورة حالياً.
            </p>
          )}

          {!loading &&
            myProps.map((l) => {
              const t = statusTone(l.status);
              return (
                <Link
                  key={l.id}
                  to="/listing/$id"
                  params={{ id: l.id }}
                  className="group flex gap-3 rounded-2xl bg-card p-3 shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5"
                >
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={l.image}
                      alt={l.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h3 className="truncate text-sm font-bold text-primary">{l.title}</h3>
                      <p className="truncate text-xs text-muted-foreground">{l.area}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${t.bg} ${t.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                        {l.status}
                      </span>
                      <p className="text-sm font-extrabold text-gold">
                        {l.price.toLocaleString("ar-EG")}{" "}
                        <span className="text-[10px] font-medium text-muted-foreground">ج/شهر</span>
                      </p>
                    </div>
                  </div>
                  <ChevronLeft size={16} className="self-center text-muted-foreground transition-transform group-hover:-translate-x-1" />
                </Link>
              );
            })}
        </div>
      </div>
      <ScrollToTop />
    </AppShell>
  );
}
