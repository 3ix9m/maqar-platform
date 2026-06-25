import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية | مَقَر" },
      { name: "description", content: "كيف تجمع منصة مَقَر بيانات الطلاب وتستخدمها وتحميها." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <AppShell>
      <TopBar variant="page" title="سياسة الخصوصية" backTo="/profile" />
      <article className="prose prose-sm max-w-none px-5 pb-10 text-primary [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_p]:leading-7 [&_p]:text-muted-foreground">
        <p className="mt-2 text-[11px] text-muted-foreground">آخر تحديث: يونيو 2026</p>
        <p>
          نهتم في <strong>مَقَر</strong> بخصوصية الطلاب ونحرص على حماية بياناتهم.
          هذه السياسة توضح أنواع البيانات التي نجمعها وكيف نستخدمها.
        </p>

        <h2>البيانات التي نجمعها</h2>
        <p>الاسم، البريد الإلكتروني، رقم الهاتف، الجامعة، تفضيلات السكن والمفضلة، وسجلات استخدام المنصة لتحسين التجربة.</p>

        <h2>كيف نستخدم البيانات</h2>
        <p>لإنشاء حسابك، عرض العقارات المناسبة، تواصلك مع الملاك عبر واتساب، وإرسال إشعارات مطابقة الأسعار.</p>

        <h2>مشاركة البيانات</h2>
        <p>لا نبيع بياناتك. لا يتم عرض رقم هاتفك للملاك تلقائيًا — التواصل يتم عبر روابط محمية.</p>

        <h2>الأمان</h2>
        <p>نستخدم Row-Level Security و HTTPS و تشفير على مستوى قاعدة البيانات لحماية حسابك.</p>

        <h2>حقوقك</h2>
        <p>يمكنك تعديل بياناتك من صفحة "تعديل بياناتي" أو طلب حذف حسابك بالتواصل معنا عبر واتساب.</p>

        <h2>التواصل</h2>
        <p>لأي استفسار: 01095346393</p>
      </article>
    </AppShell>
  );
}
