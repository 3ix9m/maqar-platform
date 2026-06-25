import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
const formatPrice = (n: number) => `${Number(n).toLocaleString("ar-EG")} ج/شهر`;

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "الإشعارات | مَقَر" },
      { name: "description", content: "عقارات جديدة تطابق تنبيهاتك في مَقَر." },
    ],
  }),
  component: NotificationsPage,
});

interface MatchRow {
  id: string;
  read: boolean;
  created_at: string;
  property_id: string;
  properties: { id: string; title: string; area: string | null; price: number; cover_image: string | null } | null;
}

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["alert-matches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("alert_matches")
        .select("id, read, created_at, property_id, properties(id, title, area, price, cover_image)")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as MatchRow[];
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("alert_matches")
        .update({ read: true })
        .eq("student_id", user!.id)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alert-matches", user?.id] });
      qc.invalidateQueries({ queryKey: ["alert-matches-unread", user?.id] });
      toast.success("تم تعليم كل الإشعارات كمقروءة");
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("alert_matches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alert-matches", user?.id] });
      qc.invalidateQueries({ queryKey: ["alert-matches-unread", user?.id] });
    },
  });

  if (!user) {
    return (
      <AppShell>
        <TopBar variant="page" title="الإشعارات" />
        <div className="grid place-items-center px-5 py-20 text-center text-sm text-muted-foreground">
          <p className="mb-3">سجّل الدخول لرؤية إشعاراتك</p>
          <Link to="/auth" className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">تسجيل الدخول</Link>
        </div>
      </AppShell>
    );
  }

  const unread = data.filter((m) => !m.read).length;

  return (
    <AppShell>
      <TopBar variant="page" title="الإشعارات" />
      <div className="px-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            {unread > 0 ? `${unread} جديدة` : "كل الإشعارات مقروءة"}
          </p>
          {unread > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-primary"
            >
              <Check size={12} /> تعليم الكل كمقروء
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-xs text-muted-foreground">جارٍ التحميل…</p>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Bell size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-bold text-primary">لا توجد إشعارات بعد</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              أنشئ تنبيه سعر من صفحة البحث وسنخبرك فور توفّر عقار مطابق.
            </p>
            <Link to="/search" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground">
              إنشاء تنبيه
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 pb-6">
            {data.map((m) => (
              <li
                key={m.id}
                className={`flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft ${!m.read ? "ring-1 ring-gold/40" : ""}`}
              >
                <Link to="/listing/$id" params={{ id: m.property_id }} className="flex flex-1 items-center gap-3">
                  {m.properties?.cover_image ? (
                    <img src={m.properties.cover_image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-secondary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-primary">
                      {m.properties?.title ?? "عقار جديد"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.properties?.area ?? ""} {m.properties ? `• ${formatPrice(m.properties.price)}` : ""}
                    </p>
                  </div>
                  {!m.read && <span className="h-2 w-2 rounded-full bg-gold" />}
                </Link>
                <button
                  onClick={() => del.mutate(m.id)}
                  aria-label="حذف"
                  className="grid h-8 w-8 place-items-center rounded-full bg-destructive/10 text-destructive"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
