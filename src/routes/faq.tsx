import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ChevronLeft, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "الأسئلة الشائعة | مَقَر" },
      { name: "description", content: "أجوبة عن العربون، الأسعار، المسافة من الجامعة، وقواعد السكن." },
      { property: "og:title", content: "الأسئلة الشائعة | مَقَر" },
      { property: "og:description", content: "كل ما تريد معرفته عن السكن الطلابي مع مَقَر." },
    ],
  }),
  component: Faq,
});

const faqs = [
  { q: "هل يوجد عربون للحجز؟", a: "نعم، يُدفع عربون رمزي بعد المعاينة لتثبيت الحجز، ويُحتسب من الإيجار الأول." },
  { q: "ما متوسط أسعار الإيجار؟", a: "تتراوح الأسعار بين 1,000 و 4,500 جنيه شهرياً حسب نوع السكن وموقعه." },
  { q: "كم المسافة من الجامعة؟", a: "أغلب العقارات تبعد بين 3 و 10 دقائق سيراً عن جامعة ميريت والكوامل." },
  { q: "ما قواعد السكن الطلابي؟", a: "الالتزام بالهدوء، احترام السكان، وعدم استضافة أي شخص دون إذن المالك." },
  { q: "هل بيانات المالك تظهر للطلاب؟", a: "لا، جميع التواصل يتم عبر فريق مَقَر لحماية الطرفين." },
  { q: "متى يمكنني تقييم العقار؟", a: "بعد تأكيد الإيجار رسمياً عبر مَقَر، يحق لك تقييم العقار والمالك." },
];

function Faq() {
  return (
    <AppShell>
      <TopBar variant="page" title="الأسئلة الشائعة" />
      <div className="px-5">
        <div className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-card">
          <HelpCircle className="text-gold" size={22} />
          <p className="text-sm font-bold">إجابات سريعة عن أكثر الأسئلة شيوعاً</p>
        </div>

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
      </div>
    </AppShell>
  );
}
