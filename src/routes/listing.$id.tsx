import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  Wifi, Snowflake, ChefHat, Flame, MapPin, BedDouble, Bath, Zap,
  ShieldCheck, Star, Clock, Building2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { StatusPill, VerifiedBadge } from "@/components/ListingCard";
import { listings } from "@/lib/listings";

export const Route = createFileRoute("/listing/$id")({
  head: ({ params }) => {
    const l = listings.find((x) => x.id === params.id);
    return {
      meta: [
        { title: l ? `${l.title} | مَقَر` : "تفاصيل العقار | مَقَر" },
        { name: "description", content: l?.description ?? "تفاصيل سكن طلابي موثوق." },
        ...(l ? [{ property: "og:image", content: l.image }] : []),
      ],
    };
  },
  loader: ({ params }) => {
    const l = listings.find((x) => x.id === params.id);
    if (!l) throw notFound();
    return l;
  },
  notFoundComponent: () => (
    <AppShell><TopBar variant="page" title="تفاصيل العقار" /><p className="px-5 text-sm text-muted-foreground">العقار غير موجود.</p></AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell><TopBar variant="page" title="تفاصيل العقار" /><p className="px-5 text-sm text-destructive">{error.message}</p></AppShell>
  ),
  component: ListingDetail,
});

const amenities = [
  { label: "واي فاي", icon: Wifi },
  { label: "تكييف", icon: Snowflake },
  { label: "مطبخ", icon: ChefHat },
  { label: "مياه ساخنة", icon: Flame },
];

function ListingDetail() {
  const l = Route.useLoaderData();
  const ratings = [
    { label: "النظافة", v: l.detailRating.cleanliness },
    { label: "الإنترنت", v: l.detailRating.internet },
    { label: "الأثاث", v: l.detailRating.furniture },
    { label: "الهدوء", v: l.detailRating.quietness },
  ];

  return (
    <AppShell>
      <TopBar variant="page" title="تفاصيل العقار" showFavorite />

      <div className="px-5 pb-4">
        <div className="relative overflow-hidden rounded-2xl shadow-card">
          <img src={l.image} alt={l.title} className="aspect-[4/3] w-full object-cover" />
          <span className="absolute bottom-3 right-3 rounded-full bg-primary/85 px-2.5 py-1 text-[11px] font-bold text-primary-foreground">1/{l.gallery.length}</span>
          {l.badge && (
            <span className="absolute right-3 top-3 rounded-md bg-gold px-2 py-1 text-[10px] font-extrabold text-gold-foreground">{l.badge}</span>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {l.gallery.map((g, i) => (
            <img key={i} src={g} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" loading="lazy" />
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-extrabold text-primary">{l.title}</h1>
            <StatusPill listing={l} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={13} className="text-gold" />
            {l.area}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {l.verified && <VerifiedBadge />}
            {l.previouslyRented && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                <Building2 size={11} /> تم تأجيرها سابقاً عبر مَقَر
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock size={11} /> آخر تحديث منذ {l.updatedDaysAgo} يوم
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-extrabold text-gold">
              {l.price.toLocaleString("ar-EG")} <span className="text-xs font-medium text-muted-foreground">ج/شهر</span>
            </p>
            <span className="flex items-center gap-1 text-sm font-bold text-primary">
              <Star size={14} className="fill-gold text-gold" />
              {l.rating.toFixed(1)} <span className="text-xs font-medium text-muted-foreground">({l.ratingsCount})</span>
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: l.type, icon: BedDouble },
            { label: `${l.rooms} غرف`, icon: BedDouble },
            { label: `${l.baths} حمام`, icon: Bath },
            { label: "عداد كهرباء", icon: Zap },
          ].map(({ label, icon: Icon }, i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-1 py-2.5 text-center">
              <Icon size={14} className="text-gold" />
              <span className="text-[10px] font-semibold text-primary">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold text-primary">المميزات</h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {amenities.map(({ label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">
                  <Icon size={18} />
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold text-primary">التقييمات</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ratings.map((r) => (
              <div key={r.label} className="rounded-xl bg-card p-3 shadow-soft">
                <p className="text-[11px] text-muted-foreground">{r.label}</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-bold text-primary">
                  <Star size={13} className="fill-gold text-gold" />
                  {r.v.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold text-primary">عن العقار</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{l.description}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck size={18} className="shrink-0 text-gold" />
            <div>
              <p className="text-sm font-bold text-primary">كل التواصل عبر مَقَر</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                لحمايتك، يتم التواصل مع المالك حصرياً من خلال فريق مَقَر بعد طلب المعاينة.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/request-viewing/$id"
          params={{ id: l.id }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card"
        >
          طلب معاينة
        </Link>
      </div>
    </AppShell>
  );
}
