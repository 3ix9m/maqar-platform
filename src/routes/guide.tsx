import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { BookOpen, MapPin, Wallet, Lightbulb, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "دليل السكن الطلابي | مَقَر" },
      { name: "description", content: "مقالات ونصائح للطلاب لاختيار السكن المناسب حول جامعة ميريت والكوامل." },
      { property: "og:title", content: "دليل السكن الطلابي | مَقَر" },
      { property: "og:description", content: "أفضل المناطق، متوسط الأسعار، نصائح وتجنب الاحتيال." },
    ],
  }),
  component: Guide,
});

const articles = [
  {
    title: "أفضل المناطق حول جامعة ميريت",
    icon: MapPin,
    body: "الكوامل والحي الأول من أقرب المناطق وأهدأها، فيما يوفر شارع ميريت الرئيسي خدمات أكثر مع قرب من الجامعة.",
  },
  {
    title: "متوسط أسعار السكن الطلابي",
    icon: Wallet,
    body: "السرير المشترك يبدأ من 1,000 ج، الأوضة المفروشة بين 1,500-2,500 ج، والشقق الكاملة من 3,500 ج فأكثر.",
  },
  {
    title: "نصائح ذهبية قبل استئجار السكن",
    icon: Lightbulb,
    body: "اطلب معاينة قبل الحجز، تحقق من خدمات الكهرباء والإنترنت، واحرص على توثيق الاتفاق عبر مَقَر.",
  },
  {
    title: "كيف تتجنب الاحتيال في السكن",
    icon: ShieldAlert,
    body: "لا تدفع أي مبلغ قبل المعاينة، ولا تشارك بياناتك خارج مَقَر. كل التواصل يتم عبر فريقنا لضمان حقوقك.",
  },
];

function Guide() {
  return (
    <AppShell>
      <TopBar variant="page" title="دليل السكن الطلابي" />
      <div className="px-5">
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-card">
          <BookOpen className="text-gold" size={22} />
          <p className="mt-2 text-base font-extrabold">دليلك الكامل قبل اختيار السكن</p>
          <p className="mt-1 text-xs text-primary-foreground/80 leading-6">
            مقالات قصيرة جمعها فريق مَقَر لمساعدتك على اتخاذ قرار آمن ومريح.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 pb-4">
          {articles.map(({ title, body, icon: Icon }) => (
            <article key={title} className="rounded-2xl bg-card p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <Icon size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-primary">{title}</h2>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">{body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
