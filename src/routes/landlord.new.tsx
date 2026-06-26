import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { createProperty, uploadPropertyImages } from "@/lib/api";
import { LocationPicker } from "@/components/LocationPicker";
import { MapPin, Loader2, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/landlord/new")({
  head: () => ({ meta: [{ title: "إضافة عقار | مَقَر" }] }),
  component: AddListing,
});

function AddListing() {
  const navigate = useNavigate();
  const { user, loading: authLoading, roles } = useAuth();
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({
    title: "",
    type: "شقة كاملة",
    status: "متاحة",
    area: "",
    distance: "",
    price: 0,
    rooms: 1,
    baths: 1,
    description: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/auth", search: { redirect: "/landlord/new" } }); return; }
    supabase.from("landlords").select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      setLandlordId(data?.id ?? null);
      setChecking(false);
    });
  }, [user, authLoading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!landlordId) return;
    setSaving(true);
    try {
      const payload: any = { ...form, landlord_id: landlordId };
      if (payload.latitude == null) delete payload.latitude;
      if (payload.longitude == null) delete payload.longitude;
      const created = await createProperty(payload);
      if (files.length) await uploadPropertyImages(created.id, files);
      toast.success("تمت إضافة العقار. سيراجعه فريق مَقَر قبل التوثيق.");
      navigate({ to: "/landlord" });
    } catch (err: any) {
      toast.error(err.message || "تعذّر الحفظ");
    } finally { setSaving(false); }
  }

  if (authLoading || checking) {
    return (
      <AppShell>
        <TopBar variant="page" title="إضافة عقار" backTo="/landlord" />
        <div className="grid place-items-center p-10 text-muted-foreground"><Loader2 className="animate-spin" /></div>
      </AppShell>
    );
  }

  if (!roles.includes("landlord") || !landlordId) {
    return (
      <AppShell>
        <TopBar variant="page" title="إضافة عقار" backTo="/profile" />
        <div className="m-5 rounded-2xl bg-card p-5 text-center shadow-soft">
          <ShieldCheck className="mx-auto mb-2 text-gold" />
          <p className="text-sm font-bold text-primary">هذه الصفحة للملاك فقط</p>
          <p className="mt-2 text-xs text-muted-foreground">حسابات الملاك يتم إنشاؤها بواسطة إدارة مَقَر. تواصل معنا عبر واتساب لإنشاء حسابك.</p>
          <a href="https://wa.me/201095346393?text=مرحباً،%20أرغب%20في%20إنشاء%20حساب%20مالك%20على%20مَقَر" target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">تواصل معنا</a>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar variant="page" title="إضافة عقار" backTo="/landlord" />
      <form onSubmit={submit} className="m-5 flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-soft">
        <Input label="عنوان العقار" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <div className="grid grid-cols-2 gap-2">
          <Select label="النوع" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["شقة كاملة", "أوضة مفروشة", "سرير"]} />
          <Select label="الحالة" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["متاحة", "محجوزة", "مؤجرة"]} />
        </div>
        <Input label="المنطقة" value={form.area} onChange={(v) => setForm({ ...form, area: v })} />
        <Input label="المسافة من الجامعة" value={form.distance} onChange={(v) => setForm({ ...form, distance: v })} placeholder="مثال: 10 دقائق سيراً" />
        <div className="grid grid-cols-3 gap-2">
          <Input label="السعر (ج/شهر)" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) })} required />
          <Input label="غرف" type="number" value={String(form.rooms)} onChange={(v) => setForm({ ...form, rooms: Number(v) })} />
          <Input label="حمامات" type="number" value={String(form.baths)} onChange={(v) => setForm({ ...form, baths: Number(v) })} />
        </div>
        <div>
          <label className="text-xs font-bold text-primary">وصف العقار</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs" />
        </div>

        <div className="rounded-xl border border-border p-3">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold text-primary"><MapPin size={12} className="text-gold" /> موقع العقار</p>
          <LocationPicker value={{ lat: form.latitude, lng: form.longitude }} onChange={({ lat, lng }) => setForm({ ...form, latitude: lat, longitude: lng })} />
        </div>

        <div className="rounded-xl border border-border p-3">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold text-primary"><ImageIcon size={12} className="text-gold" /> صور العقار</p>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} className="text-xs" />
          {files.length > 0 && <p className="mt-2 text-[11px] text-muted-foreground">{files.length} صورة جاهزة للرفع</p>}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-gold/5 p-3 text-[11px] leading-6 text-muted-foreground">
          <ShieldCheck size={14} className="shrink-0 text-gold" />
          <span>التوثيق وشارات "الأكثر طلباً" تُمنح من إدارة مَقَر بعد المراجعة. الطلاب يتواصلون معك عبر فريق مَقَر لحماية بياناتهم.</span>
        </div>

        <div className="flex gap-2">
          <Link to="/landlord" className="flex-1 rounded-full border border-border bg-card py-3 text-center text-xs font-bold text-muted-foreground">إلغاء</Link>
          <button disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-bold text-primary-foreground disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}حفظ العقار
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <input type={type} required={required} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs" />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
