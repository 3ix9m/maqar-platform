import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط الاستخدام | مَقَر" },
      { name: "description", content: "شروط وأحكام استخدام منصة مَقَر لسكن الطلاب." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <AppShell>
      <TopBar variant="page" title="شروط الاستخدام" backTo="/profile" />
      <article className="prose prose-sm max-w-none px-5 pb-10 text-primary [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_p]:leading-7 [&_p]:text-muted-foreground">
        <p className="mt-2 text-[11px] text-muted-foreground">آخر تحديث: يونيو 2026</p>
        <p>
          باستخدامك لمنصة <strong>مَقَر</strong> فإنك توافق على الشروط التالية.
        </p>

        <h2>طبيعة المنصة</h2>
        <p>مَقَر منصة وسيطة تعرض إعلانات سكن طلابي. لسنا طرفًا في عقود الإيجار بين الطالب والمالك.</p>

        <h2>التسجيل</h2>
        <p>التسجيل متاح للطلاب فقط. حسابات الملاك تُنشأ بواسطة إدارة مَقَر بعد التحقق.</p>

        <h2>المسؤولية</h2>
        <p>نبذل قصارى جهدنا للتحقق من صحة الإعلانات الموثقة، لكن الطالب مسؤول عن المعاينة الميدانية قبل أي التزام مالي.</p>

        <h2>السلوك المقبول</h2>
        <p>يُمنع نشر بيانات كاذبة أو محتوى مسيء أو محاولة التحايل على الموثقين والتقييمات.</p>

        <h2>التقييمات</h2>
        <p>التقييم متاح فقط للطلاب الذين سكنوا في العقار فعلًا، ويخضع للمراجعة.</p>

        <h2>إنهاء الحساب</h2>
        <p>تحتفظ إدارة مَقَر بحق إيقاف أي حساب يخالف هذه الشروط.</p>

        <h2>التواصل</h2>
        <p>للاستفسار أو الإبلاغ: 01095346393</p>
      </article>
    </AppShell>
  );
}
