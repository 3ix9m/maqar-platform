import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { BookOpen, MapPin, Wallet, Lightbulb, ShieldAlert, HelpCircle, ChevronLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "مركز المساعدة | مَقَر" },
      { name: "description", content: "دليل السكن الطلابي والأسئلة الشائعة حول مَقَر." },
      { property: "og:title", content: "مركز المساعدة | مَقَر" },
      { property: "og:description", content: "دليل السكن الطلابي والأسئلة الشائعة." },
    ],
  }),
  component: Help,
});

const articles = [
  { title: "أفضل المناطق حول جامعة ميريت", icon: MapPin, body: "الكوامل والحي الأول من أقرب المناطق وأهدأها، فيما يوفر شارع ميريت الرئيسي خدمات أكثر مع قرب من الجامعة." },
  { title: "متوسط أسعار السكن الطلابي", icon: Wallet, body: "السرير المشترك يبدأ من 1,000 ج، الأوضة المفروشة بين 1,500-2,500 ج، والشقق الكاملة من 3,500 ج فأكثر." },
  { title: "نصائح ذهبية قبل استئجار السكن", icon: Lightbulb, body: "اطلب معاينة قبل الحجز، تحقق من خدمات الكهرباء والإنترنت، واحرص على توثيق الاتفاق عبر مَقَر." },
  { title: "كيف تتجنب الاحتيال في السكن", icon: ShieldAlert, body: "لا تدفع أي مبلغ قبل المعاينة، ولا تشارك بياناتك خارج مَقَر. كل التواصل يتم عبر فريقنا لضمان حقوقك." },
];

const faqs = [
  { q: "هل يوجد عربون للحجز؟", a: "نعم، يُدفع عربون رمزي بعد المعاينة لتثبيت الحجز، ويُحتسب من الإيجار الأول." },
  { q: "ما متوسط أسعار الإيجار؟", a: "تتراوح الأسعار بين 1,000 و 4,500 جنيه شهرياً حسب نوع السكن وموقعه." },
  { q: "كم المسافة من الجامعة؟", a: "أغلب العقارات تبعد بين 3 و 10 دقائق سيراً عن جامعة ميريت والكوامل." },
  { q: "ما قواعد السكن الطلابي؟", a: "الالتزام بالهدوء، احترام السكان، وعدم استضافة أي شخص دون إذن المالك." },
  { q: "هل بيانات المالك تظهر للطلاب؟", a: "لا، جميع التواصل يتم عبر فريق مَقَر لحماية الطرفين." },
  { q: "متى يمكنني تقييم العقار؟", a: "بعد تأكيد الإيجار رسمياً عبر مَقَر، يحق لك تقييم العقار والمالك." },
];

function Help() {
  const [tab, setTab] = useState<"guide" | "faq">("guide");
  return (
    <AppShell>
      <TopBar variant="page" title="مركز المساعدة" />
      <div className="px-5">
        <div className="flex gap-2 rounded-2xl bg-card p-1.5 shadow-soft">
          <TabBtn active={tab === "guide"} onClick={() => setTab("guide")} icon={BookOpen} label="دليل السكن" />
          <TabBtn active={tab === "faq"} onClick={() => setTab("faq")} icon={HelpCircle} label="الأسئلة الشائعة" />
        </div>

        {tab === "guide" ? (
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
        ) : (
          <div className="mt-5 flex flex-col gap-2 pb-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-card p-4 shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-primary">
                  {f.q}
                  <ChevronLeft size={16} className="text-muted-foreground transition group-open:-rotate-90" />
                </summary>
                <p className="mt-2 text-xs leading-7 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
        active ? "bg-primary text-primary-foreground shadow-card" : "text-primary"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
