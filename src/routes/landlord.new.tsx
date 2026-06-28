import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { createProperty, uploadPropertyImages } from "@/lib/api";
import { LocationPicker } from "@/components/LocationPicker";
import {
  MapPin,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
  Home,
  BedDouble,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/landlord/new")({
  head: () => ({ meta: [{ title: "إضافة عقار | مَقَر" }] }),
  component: AddListing,
});

type PropType = "شقة كاملة" | "أوضة مفروشة" | "سرير";

const TYPE_OPTIONS: { value: PropType; title: string; desc: string; Icon: any }[] = [
  { value: "شقة كاملة", title: "شقة كاملة", desc: "الشقة بالكامل للإيجار", Icon: Home },
  { value: "أوضة مفروشة", title: "أوضة مفروشة", desc: "غرفة خاصة داخل شقة", Icon: BedDouble },
  { value: "سرير", title: "سرير", desc: "سرير في غرفة مشتركة", Icon: UserIcon },
];

const POPULAR_AREAS = ["المنصورة", "طلخا", "ميت خميس", "جيهان", "الجامعة الجديدة"];

function AddListing() {
  const navigate = useNavigate();
  const { user, loading: authLoading, roles } = useAuth();
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    type: "شقة كاملة" as PropType,
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
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/landlord/new" } });
      return;
    }
    supabase
      .from("landlords")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setLandlordId(data?.id ?? null);
        setChecking(false);
      });
  }, [user, authLoading, navigate]);

  // Image previews
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...incoming].slice(0, 12));
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  const steps = ["النوع", "الأساسيات", "الموقع", "الصور", "مراجعة"];
  const totalSteps = steps.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const canNext = useMemo(() => {
    if (step === 0) return !!form.type;
    if (step === 1) return form.title.trim().length >= 4 && form.area.trim().length >= 2 && form.price > 0;
    if (step === 2) return true; // location optional
    if (step === 3) return true; // photos recommended not required
    return true;
  }, [step, form]);

  async function submit() {
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
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || checking) {
    return (
      <AppShell>
        <TopBar variant="page" title="إضافة عقار" backTo="/landlord" />
        <div className="grid place-items-center p-10 text-muted-foreground">
          <Loader2 className="animate-spin" />
        </div>
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
          <p className="mt-2 text-xs text-muted-foreground">
            حسابات الملاك يتم إنشاؤها بواسطة إدارة مَقَر. تواصل معنا عبر واتساب لإنشاء حسابك.
          </p>
          <a
            href="https://wa.me/201095346393?text=مرحباً،%20أرغب%20في%20إنشاء%20حساب%20مالك%20على%20مَقَر"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
          >
            تواصل معنا
          </a>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar variant="page" title="إضافة عقار" backTo="/landlord" />

      {/* Progress header */}
      <div className="sticky top-[56px] z-10 bg-background/95 px-5 pt-3 pb-2 backdrop-blur">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-bold text-primary">
            خطوة {step + 1} من {totalSteps}
          </span>
          <span>{steps[step]}</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="m-5 mt-3 rounded-2xl bg-card p-4 shadow-soft animate-in fade-in duration-300">
        {/* Step 0 — Type */}
        {step === 0 && (
          <div className="space-y-3">
            <Header
              title="إيه نوع العقار اللي هتعلنه؟"
              hint="اختر النوع الأقرب لاعلانك. تقدر تغيره بعدين."
            />
            <div className="grid gap-2">
              {TYPE_OPTIONS.map(({ value, title, desc, Icon }) => {
                const active = form.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, type: value })}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-right transition active:scale-[0.99] ${
                      active
                        ? "border-gold bg-gold/10 ring-2 ring-gold"
                        : "border-border bg-card hover:border-gold/40"
                    }`}
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                        active ? "bg-gold text-primary" : "bg-secondary text-primary"
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-bold text-primary">{title}</span>
                      <span className="block text-[11px] text-muted-foreground">{desc}</span>
                    </span>
                    {active && <Check size={18} className="text-gold" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1 — Basics */}
        {step === 1 && (
          <div className="space-y-3">
            <Header
              title="معلومات أساسية"
              hint="عنوان واضح وسعر صحيح بيرفع فرصة التأجير."
            />
            <Field label="عنوان مختصر للعقار" required>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: شقة مفروشة بجوار جامعة المنصورة"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs"
              />
            </Field>

            <Field label="المنطقة" required>
              <input
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="مثال: جيهان"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {POPULAR_AREAS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setForm({ ...form, area: a })}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                      form.area === a
                        ? "border-gold bg-gold/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="المسافة من الجامعة">
              <input
                value={form.distance}
                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                placeholder="مثال: 10 دقائق سيراً"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs"
              />
            </Field>

            <Field label="السعر الشهري (ج.م)" required>
              <input
                type="number"
                inputMode="numeric"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="مثال: 3500"
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="عدد الغرف">
                <Stepper
                  value={form.rooms}
                  onChange={(v) => setForm({ ...form, rooms: v })}
                  min={1}
                  max={10}
                />
              </Field>
              <Field label="عدد الحمامات">
                <Stepper
                  value={form.baths}
                  onChange={(v) => setForm({ ...form, baths: v })}
                  min={1}
                  max={6}
                />
              </Field>
            </div>

            <Field label="وصف بسيط (اختياري)">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="إيه المميز في الشقة؟ مفروشة؟ مكيفة؟ قريبة من إيه؟"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs leading-6"
              />
            </Field>
          </div>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <div className="space-y-2">
            <Header
              title="حدد الموقع على الخريطة"
              hint="اضغط على المكان الصح. ده بيساعد الطلاب يلاقوك بسهولة."
            />
            <LocationPicker
              value={{ lat: form.latitude, lng: form.longitude }}
              onChange={({ lat, lng }) => setForm({ ...form, latitude: lat, longitude: lng })}
            />
            {form.latitude == null && (
              <p className="text-[11px] text-muted-foreground">
                تقدر تتخطى الخطوة دي وتكمل بدون تحديد موقع.
              </p>
            )}
          </div>
        )}

        {/* Step 3 — Photos */}
        {step === 3 && (
          <div className="space-y-3">
            <Header
              title="ارفع صور للعقار"
              hint="الصور الواضحة بترفع الثقة وبتجيب طلبات أكتر. ينصح بـ 4 صور على الأقل."
            />
            <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-6 text-center transition hover:border-gold hover:bg-gold/5">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-card text-gold shadow-soft">
                <ImageIcon size={22} />
              </span>
              <span className="text-xs font-bold text-primary">اضغط لاختيار الصور</span>
              <span className="text-[11px] text-muted-foreground">JPG / PNG — حتى 12 صورة</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-border">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 right-1 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-primary">
                        غلاف
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="space-y-3">
            <Header
              title="مراجعة أخيرة"
              hint="راجع البيانات قبل النشر. تقدر ترجع تعدل أي خطوة."
            />
            <div className="rounded-2xl bg-secondary/60 p-3">
              {previews[0] ? (
                <img src={previews[0]} alt="" className="mb-3 h-32 w-full rounded-xl object-cover" />
              ) : (
                <div className="mb-3 grid h-32 place-items-center rounded-xl bg-card text-[11px] text-muted-foreground">
                  بدون صور
                </div>
              )}
              <Row k="العنوان" v={form.title || "—"} />
              <Row k="النوع" v={form.type} />
              <Row k="المنطقة" v={form.area || "—"} />
              <Row k="السعر" v={form.price ? `${form.price.toLocaleString("ar-EG")} ج.م / شهر` : "—"} />
              <Row k="الغرف / الحمامات" v={`${form.rooms} • ${form.baths}`} />
              <Row k="الموقع" v={form.latitude ? "محدد على الخريطة" : "غير محدد"} />
              <Row k="عدد الصور" v={String(files.length)} last />
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-gold/5 p-3 text-[11px] leading-6 text-muted-foreground">
              <ShieldCheck size={14} className="shrink-0 text-gold" />
              <span>
                التوثيق وشارات "الأكثر طلباً" تُمنح من إدارة مَقَر بعد المراجعة. الطلاب يتواصلون
                معك عبر فريق مَقَر لحماية بياناتهم.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-10 mt-2 border-t border-border bg-card/95 px-5 py-3 backdrop-blur">
        <div className="flex gap-2">
          {step === 0 ? (
            <Link
              to="/landlord"
              className="flex-1 rounded-full border border-border bg-card py-3 text-center text-xs font-bold text-muted-foreground"
            >
              إلغاء
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="flex items-center justify-center gap-1 rounded-full border border-border bg-card px-5 py-3 text-xs font-bold text-muted-foreground"
            >
              <ArrowRight size={14} /> رجوع
            </button>
          )}

          {step < totalSteps - 1 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-primary py-3 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              التالي <ArrowLeft size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={submit}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-xs font-bold text-primary disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              نشر العقار
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Header({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-base font-bold text-primary">{title}</h2>
      <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold text-primary">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {children}
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-primary disabled:opacity-40"
        disabled={value <= min}
      >
        −
      </button>
      <span className="text-sm font-bold text-primary">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-primary disabled:opacity-40"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 text-xs ${last ? "" : "border-b border-border/60"}`}>
      <span className="text-muted-foreground">{k}</span>
      <span className="font-bold text-primary">{v}</span>
    </div>
  );
}
