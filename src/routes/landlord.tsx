import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { Building2, Inbox, Star, ChevronLeft, Eye, Plus, ShieldCheck, MessageCircle, Image as ImageIcon, MapPin, BadgeCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchListings, listLandlordViewingRequests } from "@/lib/api";
import { statusTone } from "@/lib/listings";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/landlord")({
  head: () => ({ meta: [{ title: "لوحة المالك | مَقَر" }] }),
  component: LandlordDashboard,
});

function LandlordDashboard() {
  const { user } = useAuth();
  const { data: landlord } = useQuery({
    queryKey: ["my-landlord", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("landlords").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const { data: listings = [] } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const myProps = landlord ? listings.filter((l) => l.landlordId === landlord.id) : [];
  const { data: requests = [] } = useQuery({
    queryKey: ["landlord-requests", landlord?.id],
    enabled: !!landlord?.id,
    queryFn: () => listLandlordViewingRequests(landlord!.id),
  });
  const avgRating = myProps.length
    ? (myProps.reduce((s, l) => s + (l.rating || 0), 0) / myProps.length).toFixed(1)
    : "—";

  const stats = [
    { label: "عقاراتي", value: myProps.length, icon: Building2 },
    { label: "طلبات معاينة", value: requests.length, icon: Inbox },
    { label: "متوسط التقييم", value: avgRating, icon: Star },
  ];

  return (
    <AppShell>
      <TopBar variant="page" title="لوحة المالك" backTo="/profile" />
      <div className="px-5">
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-card">
          <p className="text-xs text-primary-foreground/70">مرحباً</p>
          <p className="mt-1 text-lg font-extrabold">{landlord?.full_name ?? "السيد"}</p>
          <p className="mt-2 text-[11px] leading-6 text-primary-foreground/70">
            جميع طلبات المعاينة تُدار عبر فريق مَقَر، وبيانات الطلاب محمية.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-2xl bg-card p-3 text-center shadow-soft">
              <Icon size={16} className="text-gold" />
              <p className="text-base font-extrabold text-primary">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <Link to="/landlord/new" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gold py-3 text-sm font-bold text-primary shadow-card">
          <Plus size={16} /> إضافة عقار جديد
        </Link>

        <div className="mt-5 rounded-2xl bg-card p-4 shadow-soft">
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <ShieldCheck size={16} className="text-gold" /> صلاحياتك كمالك
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-[12px] leading-6 text-muted-foreground">
            <li className="flex items-start gap-2"><Plus size={14} className="mt-0.5 shrink-0 text-gold" /> إضافة عقاراتك مع الموقع والتفاصيل والسعر.</li>
            <li className="flex items-start gap-2"><ImageIcon size={14} className="mt-0.5 shrink-0 text-gold" /> رفع وحذف صور عقاراتك في أي وقت.</li>
            <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gold" /> تحديث حالة العقار (متاحة / محجوزة / مؤجرة).</li>
            <li className="flex items-start gap-2"><Inbox size={14} className="mt-0.5 shrink-0 text-gold" /> استقبال طلبات المعاينة من فريق مَقَر فقط (بيانات الطلاب محمية).</li>
            <li className="flex items-start gap-2"><MessageCircle size={14} className="mt-0.5 shrink-0 text-gold" /> التواصل مع الطلاب عبر واتساب بعد ترشيح مَقَر.</li>
            <li className="flex items-start gap-2"><BadgeCheck size={14} className="mt-0.5 shrink-0 text-gold" /> التوثيق وشارات "الأكثر طلباً" تُمنح من الإدارة بعد المراجعة.</li>
          </ul>
        </div>

        <h2 className="mt-6 text-sm font-bold text-primary">عقاراتي</h2>
        <div className="mt-3 flex flex-col gap-3">
          {myProps.length === 0 && <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-soft">لا توجد عقارات مسجلة باسمك.</p>}
          {myProps.map((l) => {
            const t = statusTone(l.status);
            return (
              <div key={l.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft">
                <img src={l.image} alt="" className="h-20 w-24 rounded-xl object-cover" />
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
                    <p className="text-sm font-extrabold text-gold">{l.price.toLocaleString("ar-EG")} <span className="text-[10px] font-medium">ج/شهر</span></p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mt-6 text-sm font-bold text-primary">إشعارات من مَقَر</h2>
        <div className="mt-3 flex flex-col gap-2">
          {["تمت معاينة عقار شارع ميريت", "تم تأجير شقة الحي الثاني", "تقييم جديد من طالب"].map((n) => (
            <div key={n} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-soft">
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
                  <Eye size={16} />
                </span>
                <p className="text-sm font-bold text-primary">{n}</p>
              </span>
              <ChevronLeft size={16} className="text-muted-foreground" />
            </div>
          ))}
        </div>

        <Link to="/profile" className="mt-6 mb-2 flex w-full items-center justify-center rounded-2xl border border-border bg-card py-3 text-xs font-bold text-muted-foreground">
          العودة لحسابي
        </Link>
      </div>
    </AppShell>
  );
}
