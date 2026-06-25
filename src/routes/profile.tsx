import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { User, Heart, BookOpen, LogOut, ChevronLeft, ShieldCheck, Bell, Scale, Trash2, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UniversityPicker } from "@/components/UniversityPicker";
import { deletePriceAlert, listPriceAlerts } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "حسابي | مَقَر" },
      { name: "description", content: "إدارة حسابك في مَقَر." },
    ],
  }),
  component: Profile,
});

const items = [
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/compare", label: "مقارنة العقارات", icon: Scale },
  { to: "/notifications", label: "الإشعارات", icon: Bell },
  { to: "/help", label: "مركز المساعدة", icon: BookOpen },
] as const;

function Profile() {
  const { user, roles, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["student-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });
  const { data: alerts = [] } = useQuery({
    queryKey: ["price-alerts", user?.id],
    enabled: !!user,
    queryFn: () => listPriceAlerts(user!.id),
  });
  const delMut = useMutation({
    mutationFn: deletePriceAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["price-alerts", user?.id] });
      toast.success("تم حذف التنبيه");
    },
    onError: (e: any) => toast.error(e.message || "تعذّر الحذف"),
  });

  return (
    <AppShell>
      <div className="rounded-b-3xl bg-primary px-5 pb-7 pt-6 text-primary-foreground">
        <h1 className="text-center text-base font-bold">حسابي</h1>
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary-foreground/10 ring-2 ring-gold/40">
            <User size={36} className="text-primary-foreground/80" />
          </div>
          {user ? (
            <>
              <p className="text-base font-bold">{profile?.full_name ?? user.email}</p>
              <p className="text-xs text-primary-foreground/70">
                {roles.includes("admin") ? "إدارة مَقَر" : roles.includes("landlord") ? "مالك" : "طالب"}
                {profile?.university ? ` · ${profile.university}` : ""}
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-bold">زائر</p>
              <Link to="/auth" className="mt-2 rounded-full border border-gold/40 px-4 py-1.5 text-[11px] font-bold text-gold">تسجيل الدخول</Link>
            </>
          )}
        </div>
      </div>


      <div className="mt-4 px-5">
        <UniversityPicker />
      </div>

      <ul className="mt-4 flex flex-col gap-2 px-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={label}>
            <Link to={to} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-soft">
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-bold text-primary">{label}</span>
              </span>
              <ChevronLeft size={18} className="text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      {user && (
        <div className="mt-5 px-5">
          <div className="mb-2 flex items-center gap-2">
            <Bell size={14} className="text-gold" />
            <p className="text-[12px] font-bold text-primary">تنبيهات السعر</p>
          </div>
          {alerts.length === 0 ? (
            <Link to="/search" className="block rounded-2xl border border-dashed border-border bg-card p-4 text-center text-[11px] text-muted-foreground">
              لا توجد تنبيهات. أنشئ واحدًا من صفحة البحث.
            </Link>
          ) : (
            <ul className="flex flex-col gap-2">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 rounded-2xl bg-card p-3 shadow-soft">
                  <div className="min-w-0 text-[11px] text-primary">
                    <p className="truncate font-bold">
                      {a.type || "أي نوع"} {a.area ? `• ${a.area}` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {a.max_price ? `حتى ${Number(a.max_price).toLocaleString("ar-EG")} ج` : "بدون سقف سعر"}
                      {a.verified_only ? " • موثقة فقط" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => delMut.mutate(a.id)}
                    aria-label="حذف"
                    className="grid h-8 w-8 place-items-center rounded-full bg-destructive/10 text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(roles.includes("landlord") || isAdmin) && (
        <div className="mt-5 px-5">
          <p className="mb-2 text-[11px] font-bold text-muted-foreground">للموظفين</p>
          <ul className="flex flex-col gap-2">
            {roles.includes("landlord") && (
              <li>
                <Link to="/landlord" className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-soft">
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
                      <Building2 size={16} />
                    </span>
                    <span className="text-sm font-bold text-primary">لوحة المالك</span>
                  </span>
                  <ChevronLeft size={18} className="text-muted-foreground" />
                </Link>
              </li>
            )}
            {isAdmin && (
              <li>
                <Link to="/admin" className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-soft">
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
                      <ShieldCheck size={16} />
                    </span>
                    <span className="text-sm font-bold text-primary">لوحة الإدارة</span>
                  </span>
                  <ChevronLeft size={18} className="text-muted-foreground" />
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {user && (
        <div className="mt-5 px-5">
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-card py-3 text-sm font-bold text-destructive"
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      )}
    </AppShell>
  );
}
