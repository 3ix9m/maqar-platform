import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import logo from "@/assets/maqar-logo.png";
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "تسجيل طالب جديد | مَقَر" }] }),
  component: Register,
});

function Register() {
  return (
    <AppShell>
      <TopBar variant="page" title="تسجيل طالب جديد" backTo="/profile" />
      <div className="px-5">
        <div className="flex flex-col items-center">
          <img src={logo} alt="مَقَر" className="h-14 w-auto" />
          <p className="mt-2 text-xs text-muted-foreground">إنشاء حساب طالب جديد للوصول إلى مَقَر</p>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <Field label="الاسم بالكامل" icon={UserIcon} placeholder="مثال: أحمد محمد" />
          <Field label="البريد الإلكتروني" icon={Mail} placeholder="example@email.com" type="email" />
          <Field label="رقم الهاتف" icon={Phone} placeholder="01xxxxxxxxx" type="tel" />
          <Field label="كلمة المرور" icon={Lock} placeholder="********" type="password" />

          <div className="flex items-start gap-2 rounded-2xl border border-gold/30 bg-gold/5 p-3">
            <ShieldCheck size={16} className="shrink-0 text-gold" />
            <p className="text-[11px] leading-6 text-muted-foreground">
              التسجيل متاح للطلاب فقط. حسابات الملاك يتم إنشاؤها بواسطة إدارة مَقَر.
            </p>
          </div>

          <button className="rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card">إنشاء الحساب</button>
          <p className="text-center text-xs text-muted-foreground">
            لديك حساب؟{" "}
            <Link to="/auth/login" className="font-bold text-gold">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, icon: Icon, placeholder, type = "text" }: { label: string; icon: any; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Icon size={16} className="text-gold" />
        <input type={type} dir="rtl" placeholder={placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
    </div>
  );
}
