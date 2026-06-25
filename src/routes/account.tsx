import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { User as UserIcon, Phone, GraduationCap, Mail, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "تعديل بياناتي | مَقَر" }] }),
  component: AccountEdit,
});

function AccountEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", university: "" });
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        university: profile.university ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("students")
      .update({ full_name: form.full_name, phone: form.phone, university: form.university })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ التغييرات");
    navigate({ to: "/profile" });
  }

  return (
    <AppShell>
      <TopBar variant="page" title="تعديل بياناتي" backTo="/profile" />
      <div className="px-5">
        {isLoading ? (
          <div className="mt-10 text-center"><Loader2 className="mx-auto animate-spin text-gold" /></div>
        ) : (
          <form className="mt-4 flex flex-col gap-4" onSubmit={save}>
            <Field label="البريد الإلكتروني" icon={Mail} value={user?.email ?? ""} disabled />
            <Field label="الاسم بالكامل" icon={UserIcon} value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
            <Field label="رقم الهاتف" icon={Phone} type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="الجامعة" icon={GraduationCap} value={form.university} onChange={(v) => setForm({ ...form, university: v })} />
            <button
              disabled={saving}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              حفظ التغييرات
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, icon: Icon, value, onChange, type = "text", disabled }: { label: string; icon: any; value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className={`mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft ${disabled ? "opacity-60" : ""}`}>
        <Icon size={16} className="text-gold" />
        <input
          type={type}
          disabled={disabled}
          dir="rtl"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}
