import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, Building2, BedDouble, DoorOpen, ShieldCheck, MapPin,
  MessageSquare, Percent, BookOpen, HelpCircle, ChevronLeft, Sparkles, Star,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ListingCard } from "@/components/ListingCard";
import { useQuery } from "@tanstack/react-query";
import { fetchListings } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مَقَر | سكنك قرب جامعتك" },
      { name: "description", content: "ابحث عن شقق وأوض وسرير قريبة من جامعة ميريت والكوامل. منصة سكن طلابي موثوقة." },
      { property: "og:title", content: "مَقَر | سكنك قرب جامعتك" },
      { property: "og:description", content: "منصة سكن طلابي موثوقة بالقرب من جامعة ميريت والكوامل." },
    ],
  }),
  component: Home,
});

const typeChips = [
  { label: "شقة كاملة", icon: Building2, to: "/search" },
  { label: "أوضة", icon: DoorOpen, to: "/search" },
  { label: "سرير", icon: BedDouble, to: "/search" },
] as const;

const benefits = [
  { label: "شقق موثقة", icon: ShieldCheck },
  { label: "قريبة من الجامعة", icon: MapPin },
  { label: "تواصل عبر مَقَر", icon: MessageSquare },
  { label: "بدون عمولات خفية", icon: Percent },
];

const faqs = [
  { q: "هل يوجد عربون للحجز؟", a: "نعم، يُدفع عربون رمزي بعد المعاينة لتثبيت الحجز." },
  { q: "ما متوسط الإيجار حول الجامعة؟", a: "يتراوح بين 1,200 و 4,500 جنيه شهرياً حسب النوع والموقع." },
];

const articles = [
  { slug: "best-areas", title: "أفضل المناطق حول جامعة ميريت" },
  { slug: "prices", title: "متوسط أسعار السكن الطلابي" },
  { slug: "tips", title: "نصائح ذهبية قبل استئجار السكن" },
];

function Home() {
  const { data: listings = [], isLoading } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const featured = listings.filter((l) => l.badge).slice(0, 2);
  const recommended = listings.slice(0, 3);

  return (
    <AppShell>
      <TopBar variant="home" />

      <section className="px-5 pt-2">
        <h1 className="text-2xl font-extrabold leading-tight text-primary">سكنك قرب جامعتك</h1>
        <p className="mt-1 text-sm text-muted-foreground">ابحث عن شقق وأوض وسرير في الكوامل وميريت</p>

        <Link to="/search" className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-soft">
          <Search size={18} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">ابحث عن منطقة أو نوع سكن...</span>
        </Link>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {typeChips.map(({ label, icon: Icon, to }) => (
            <Link key={label} to={to} className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-soft">
              <Icon size={14} className="text-gold" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mt-6 px-5">
          <SectionHeader title="شقق مميزة" to="/search" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <section className="mt-6 px-5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-gold" />
          <h2 className="text-base font-bold text-primary">مقترحة لك</h2>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {isLoading && <p className="text-xs text-muted-foreground">جارٍ التحميل...</p>}
          {!isLoading && recommended.length === 0 && (
            <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-soft">
              لا توجد عقارات متاحة بعد. تابعنا قريباً.
            </p>
          )}
          {recommended.map((l) => <ListingCard key={l.id} listing={l} variant="row" />)}
        </div>
      </section>

      <section className="mt-7 px-5">
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-card">
          <p className="text-sm font-bold text-gold">عن مَقَر</p>
          <p className="mt-2 text-sm leading-7 text-primary-foreground/90">
            مَقَر منصة تجمع الشقق والسرير والأوض القريبة من جامعة ميريت والكوامل في مكان واحد، مع معاينة وتوثيق لكل عقار.
          </p>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {benefits.map(({ label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/40 text-gold">
                  <Icon size={18} />
                </span>
                <span className="text-[10px] font-semibold leading-tight text-primary-foreground/90">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <SectionHeader title="دليل السكن الطلابي" to="/guide" icon={BookOpen} />
        <div className="mt-3 flex flex-col gap-2">
          {articles.map((a) => (
            <Link key={a.slug} to="/guide" className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
                  <BookOpen size={16} />
                </span>
                <p className="text-sm font-bold text-primary">{a.title}</p>
              </div>
              <ChevronLeft size={18} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <SectionHeader title="الأسئلة الشائعة" to="/faq" icon={HelpCircle} />
        <div className="mt-3 flex flex-col gap-2">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-card p-4 shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-primary">
                {f.q}
                <ChevronLeft size={16} className="text-muted-foreground transition group-open:-rotate-90" />
              </summary>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.32_0.07_260)] p-5 text-center text-primary-foreground shadow-card">
          <Star size={28} className="mx-auto fill-gold text-gold" />
          <p className="mt-2 text-base font-extrabold">لم تجد سكنك المناسب؟</p>
          <p className="mt-1 text-xs text-primary-foreground/80">انشر طلب سكن وسنرشح لك أنسب الخيارات</p>
          <Link to="/housing-request" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-extrabold text-gold-foreground">
            نشر طلب سكن
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function SectionHeader({ title, to, icon: Icon }: { title: string; to: string; icon?: typeof BookOpen }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-gold" />}
        <h2 className="text-base font-bold text-primary">{title}</h2>
      </div>
      <Link to={to} className="text-xs font-bold text-gold">عرض الكل</Link>
    </div>
  );
}
