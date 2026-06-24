import { createFileRoute, notFound } from "@tanstack/react-router";
import { Wifi, Snowflake, ChefHat, Flame, MapPin, BedDouble, Bath, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { listings } from "@/lib/listings";

export const Route = createFileRoute("/listing/$id")({
  head: ({ params }) => {
    const l = listings.find((x) => x.id === params.id);
    return {
      meta: [
        { title: l ? `${l.title} | مَقَر` : "تفاصيل الشقة | مَقَر" },
        { name: "description", content: l?.description ?? "تفاصيل سكن طلابي." },
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
    <AppShell>
      <TopBar variant="page" title="تفاصيل الشقة" />
      <p className="px-5 text-sm text-muted-foreground">العقار غير موجود.</p>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <TopBar variant="page" title="تفاصيل الشقة" />
      <p className="px-5 text-sm text-destructive">{error.message}</p>
    </AppShell>
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

  return (
    <AppShell>
      <TopBar variant="page" title="تفاصيل الشقة" showFavorite />

      <div className="px-5">
        <div className="relative overflow-hidden rounded-2xl shadow-card">
          <img src={l.image} alt={l.title} className="aspect-[4/3] w-full object-cover" />
          <span className="absolute bottom-3 right-3 rounded-full bg-primary/85 px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
            1/8
          </span>
        </div>

        <div className="mt-5">
          <h1 className="text-xl font-extrabold text-primary">{l.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={13} className="text-gold" />
            {l.area}
          </p>
          <p className="mt-3 text-lg font-extrabold text-gold">
            {l.price.toLocaleString("ar-EG")}{" "}
            <span className="text-xs font-medium text-muted-foreground">ج/شهر</span>
          </p>
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
          <h2 className="text-sm font-bold text-primary">عن الشقة</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{l.description}</p>
        </div>

        <a
          href="https://wa.me/201000000000"
          className="mt-6 mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card"
        >
          تواصل مع المالك
        </a>
      </div>
    </AppShell>
  );
}
