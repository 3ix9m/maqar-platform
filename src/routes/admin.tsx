import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminStats, fetchListings, deleteProperty, updateProperty, createProperty,
  listLandlords, createLandlord, deleteLandlord, updateLandlordById,
  listAllViewingRequests, updateViewingStatus, uploadPropertyImages,
  listPropertyImages, deletePropertyImage,
  listAllHousingRequests, updateHousingRequestStatus,
  listRentals, createRental, deleteRental, listStudents,
} from "@/lib/api";
import { statusTone, resolveImage, type ListingStatus } from "@/lib/listings";
import { Users, Building2, Inbox, CheckCircle2, UserPlus, Plus, Edit3, Trash2, BarChart3, Star, Loader2, X, Upload, Search, HomeIcon, Phone, KeyRound, MapPin, ImageIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { LocationPicker } from "@/components/LocationPicker";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة | مَقَر" }] }),
  component: AdminDashboard,
});

type Tab = "overview" | "properties" | "requests" | "housing" | "rentals" | "landlords";

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const { isAdmin, loading } = useAuth();

  if (loading) return <AppShell><TopBar variant="page" title="لوحة الإدارة" backTo="/profile" /><p className="px-5 text-center text-xs text-muted-foreground">جارٍ التحميل...</p></AppShell>;
  if (!isAdmin) return (
    <AppShell>
      <TopBar variant="page" title="لوحة الإدارة" backTo="/profile" />
      <p className="px-5 text-center text-xs text-muted-foreground">هذه الصفحة للإدارة فقط.</p>
    </AppShell>
  );

  return (
    <AppShell>
      <TopBar variant="page" title="لوحة الإدارة" backTo="/profile" />
      <div className="px-5">
        <div className="flex gap-1 overflow-x-auto rounded-full bg-secondary p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "overview", label: "نظرة عامة" },
            { id: "properties", label: "العقارات" },
            { id: "requests", label: "طلبات المعاينة" },
            { id: "housing", label: "طلبات السكن" },
            { id: "rentals", label: "الإيجارات الموثقة" },
            { id: "landlords", label: "الملاك" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                tab === t.id ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview />}
        {tab === "properties" && <PropertiesTab />}
        {tab === "requests" && <RequestsTab />}
        {tab === "housing" && <HousingTab />}
        {tab === "rentals" && <RentalsTab />}
        {tab === "landlords" && <LandlordsTab />}
      </div>
    </AppShell>
  );
}

function Overview() {
  const { data: s } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });
  const { data: listings = [] } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const avg = useMemo(() => {
    const rated = listings.filter((l) => l.ratingsCount > 0);
    if (!rated.length) return "—";
    return (rated.reduce((sum, l) => sum + l.rating, 0) / rated.length).toFixed(1);
  }, [listings]);
  const available = listings.filter((l) => l.status === "متاحة").length;
  const stats = [
    { label: "الطلاب", value: s?.students ?? 0, icon: Users },
    { label: "الملاك", value: s?.landlords ?? 0, icon: Building2 },
    { label: "العقارات", value: s?.properties ?? 0, icon: Building2 },
    { label: "متاحة الآن", value: available, icon: CheckCircle2 },
    { label: "طلبات معاينة", value: s?.viewingRequests ?? 0, icon: Inbox },
    { label: "طلبات سكن", value: s?.housingRequests ?? 0, icon: HomeIcon },
    { label: "متوسط التقييم", value: avg, icon: Star },
  ];
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon size={16} className="text-gold" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-primary">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-card">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-gold" />
          <p className="text-sm font-bold">رؤى سوق السكن</p>
        </div>
        <p className="mt-2 text-xs leading-6 text-primary-foreground/80">
          {listings.length > 0
            ? `${available} عقار متاح حالياً، بمتوسط سعر ${Math.round(listings.reduce((a, l) => a + l.price, 0) / Math.max(1, listings.length)).toLocaleString("ar-EG")} ج/شهر.`
            : "ابدأ بإضافة عقارات لرؤية الإحصائيات."}
        </p>
      </div>
    </>
  );
}

function PropertiesTab() {
  const qc = useQueryClient();
  const { data: listings = [] } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const { data: landlords = [] } = useQuery({ queryKey: ["landlords"], queryFn: listLandlords });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ListingStatus>("all");

  const filtered = useMemo(() =>
    listings.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return l.title.toLowerCase().includes(s) || l.area.toLowerCase().includes(s);
    }), [listings, q, statusFilter]);

  const delMut = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["listings"] }); toast.success("تم حذف العقار"); },
    onError: (e: any) => toast.error(e.message || "تعذّر الحذف"),
  });
  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) => updateProperty(id, { status } as any),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing"] });
      toast.success(`تم تغيير الحالة إلى ${v.status}`);
    },
    onError: (e: any) => toast.error(e.message || "تعذّر تحديث الحالة"),
  });

  return (
    <div className="mt-4 flex flex-col gap-3">
      <button onClick={() => { setEditId(null); setShowForm(true); }} className="flex items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-extrabold text-gold-foreground">
        <Plus size={16} /> إضافة عقار جديد
      </button>

      {showForm && (
        <PropertyForm
          landlords={landlords}
          editId={editId}
          existing={listings.find((l) => l.id === editId)}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["listings"] }); }}
        />
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-card p-3 shadow-soft">
        <label className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالعنوان أو المنطقة"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["all", "متاحة", "محجوزة", "مؤجرة"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              {s === "all" ? "الكل" : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-soft">لا توجد نتائج.</p>}
      {filtered.map((l) => {
        const t = statusTone(l.status);
        return (
          <div key={l.id} className="rounded-2xl bg-card p-3 shadow-soft">
            <div className="flex gap-3">
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
                  <p className="text-sm font-extrabold text-gold">{l.price.toLocaleString("ar-EG")} ج</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["متاحة", "محجوزة", "مؤجرة"] as ListingStatus[]).map((s) => {
                const active = l.status === s;
                const pending = statusMut.isPending && statusMut.variables?.id === l.id && statusMut.variables?.status === s;
                return (
                  <button
                    key={s}
                    disabled={active || statusMut.isPending}
                    onClick={() => statusMut.mutate({ id: l.id, status: s })}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary hover:bg-secondary/70"
                    } disabled:opacity-60`}
                  >
                    {pending ? <Loader2 size={11} className="inline animate-spin" /> : s}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => { setEditId(l.id); setShowForm(true); }} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-secondary py-2 text-xs font-bold text-primary">
                <Edit3 size={13} /> تعديل
              </button>
              <button onClick={() => { if (confirm("حذف العقار؟")) delMut.mutate(l.id); }} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-destructive/10 py-2 text-xs font-bold text-destructive">
                <Trash2 size={13} /> حذف
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PropertyForm({ landlords, editId, existing, onClose, onSaved }: any) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    landlord_id: existing?.landlordId ?? landlords[0]?.id ?? "",
    title: existing?.title ?? "",
    type: existing?.type ?? "شقة كاملة",
    status: (existing?.status ?? "متاحة") as ListingStatus,
    area: existing?.area ?? "",
    distance: existing?.distance ?? "",
    price: existing?.price ?? 0,
    rooms: existing?.rooms ?? 1,
    baths: existing?.baths ?? 1,
    description: existing?.description ?? "",
    latitude: (existing?.latitude ?? null) as number | null,
    longitude: (existing?.longitude ?? null) as number | null,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: existingImages = [] } = useQuery({
    queryKey: ["property-images", editId],
    queryFn: () => listPropertyImages(editId!),
    enabled: !!editId,
  });

  const delImgMut = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) => deletePropertyImage(id, url),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property-images", editId] });
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing", editId] });
      toast.success("تم حذف الصورة");
    },
    onError: (e: any) => toast.error(e.message || "تعذّر الحذف"),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      let id = editId;
      const payload: any = { ...form };
      if (payload.latitude == null) delete payload.latitude;
      if (payload.longitude == null) delete payload.longitude;
      if (editId) {
        await updateProperty(editId, payload);
      } else {
        const created = await createProperty(payload);
        id = created.id;
      }
      if (files.length && id) await uploadPropertyImages(id, files);
      toast.success(editId ? "تم تحديث العقار" : "تمت إضافة العقار");
      onSaved();
    } catch (e: any) { setErr(e.message); toast.error(e.message || "تعذّر الحفظ"); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-primary">{editId ? "تعديل عقار" : "عقار جديد"}</p>
        <button type="button" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <select required value={form.landlord_id} onChange={(e) => setForm({ ...form, landlord_id: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs">
          <option value="" disabled>اختر مالك</option>
          {landlords.map((l: any) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
        </select>
        <input required placeholder="عنوان العقار" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs">
            <option>شقة كاملة</option><option>أوضة مفروشة</option><option>سرير</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ListingStatus })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs">
            <option>متاحة</option><option>محجوزة</option><option>مؤجرة</option>
          </select>
        </div>
        <input placeholder="المنطقة" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
        <input placeholder="المسافة من الجامعة" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
        <div className="grid grid-cols-3 gap-2">
          <input type="number" placeholder="السعر" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
          <input type="number" placeholder="غرف" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: Number(e.target.value) })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
          <input type="number" placeholder="حمامات" value={form.baths} onChange={(e) => setForm({ ...form, baths: Number(e.target.value) })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
        </div>
        <textarea rows={2} placeholder="وصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />

        {/* Location picker */}
        <div className="rounded-xl border border-border p-3">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold text-primary">
            <MapPin size={12} className="text-gold" /> موقع العقار على الخريطة
          </p>
          <LocationPicker
            value={{ lat: form.latitude, lng: form.longitude }}
            onChange={({ lat, lng }) => setForm({ ...form, latitude: lat, longitude: lng })}
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="number" step="any" placeholder="خط العرض"
              value={form.latitude ?? ""}
              onChange={(e) => setForm({ ...form, latitude: e.target.value === "" ? null : Number(e.target.value) })}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs"
            />
            <input
              type="number" step="any" placeholder="خط الطول"
              value={form.longitude ?? ""}
              onChange={(e) => setForm({ ...form, longitude: e.target.value === "" ? null : Number(e.target.value) })}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs"
            />
          </div>
          {form.latitude != null && form.longitude != null && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={11} className="text-gold" /> معاينة فورية للموقع</span>
                <a
                  href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                  target="_blank" rel="noreferrer"
                  className="font-bold text-gold hover:underline"
                >فتح في خرائط جوجل</a>
              </div>
              <iframe
                key={`${form.latitude},${form.longitude}`}
                title="معاينة الموقع"
                src={`https://www.google.com/maps?q=${form.latitude},${form.longitude}&z=16&output=embed`}
                className="h-40 w-full rounded-xl border border-border"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Existing images (edit mode) */}
        {editId && existingImages.length > 0 && (
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-bold text-primary">
              <ImageIcon size={12} className="text-gold" /> الصور الحالية ({existingImages.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((img: any) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={resolveImage(img.url)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { if (confirm("حذف الصورة؟")) delImgMut.mutate({ id: img.id, url: img.url }); }}
                    className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-destructive/90 text-white"
                    aria-label="حذف"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi upload */}
        <label className="flex flex-col gap-1 rounded-xl border border-dashed border-border bg-card px-3 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <Upload size={14} className="text-gold" />
            رفع صور جديدة (يمكنك اختيار أكثر من صورة)
          </span>
          <input
            type="file" accept="image/*" multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="text-xs"
          />
          {files.length > 0 && <span className="text-[11px] text-primary">تم اختيار {files.length} صورة</span>}
        </label>

        {err && <p className="text-xs text-destructive">{err}</p>}
        <button disabled={loading} className="mt-1 flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60">
          {loading && <Loader2 size={12} className="animate-spin" />}
          حفظ
        </button>
      </div>
    </form>
  );

}

function RequestsTab() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["all-viewings"], queryFn: listAllViewingRequests });
  const updMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateViewingStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["all-viewings"] }); toast.success("تم تحديث حالة الطلب"); },
    onError: (e: any) => toast.error(e.message || "تعذّر التحديث"),
  });
  if (isLoading) return <p className="mt-6 text-center text-xs text-muted-foreground">جارٍ التحميل...</p>;
  return (
    <div className="mt-4 flex flex-col gap-3">
      {data.length === 0 && <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-soft">لا توجد طلبات.</p>}
      {data.map((r: any) => (
        <div key={r.id} className="rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-primary">{r.students?.full_name ?? "طالب"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{r.properties?.title}</p>
            </div>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">{r.status}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => updMut.mutate({ id: r.id, status: "تم تأكيد الموعد" })} className="flex-1 rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground">تأكيد</button>
            <button onClick={() => updMut.mutate({ id: r.id, status: "مكتمل" })} className="flex-1 rounded-full bg-secondary py-2 text-xs font-bold text-primary">إنهاء</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function LandlordsTab() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["landlords"], queryFn: listLandlords });
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", notes: "" });
  const [err, setErr] = useState<string | null>(null);
  const createMut = useMutation({
    mutationFn: () => createLandlord(form),
    onSuccess: () => { setShow(false); setForm({ full_name: "", phone: "", email: "", notes: "" }); qc.invalidateQueries({ queryKey: ["landlords"] }); },
    onError: (e: any) => setErr(e.message),
  });
  const delMut = useMutation({
    mutationFn: deleteLandlord,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["landlords"] }),
  });

  return (
    <div className="mt-4 flex flex-col gap-3">
      <button onClick={() => setShow((s) => !s)} className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">
        <UserPlus size={16} /> {show ? "إغلاق" : "إنشاء حساب مالك"}
      </button>
      {show && (
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-soft">
          <input required placeholder="الاسم الكامل" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl border border-border px-3 py-2 text-xs" />
          <input required placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-border px-3 py-2 text-xs" />
          <input placeholder="البريد (اختياري)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-border px-3 py-2 text-xs" />
          <textarea rows={2} placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl border border-border px-3 py-2 text-xs" />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button className="rounded-full bg-gold py-2 text-xs font-bold text-gold-foreground">حفظ المالك</button>
        </form>
      )}
      {data.map((u: any) => (
        <LandlordRow key={u.id} u={u} onDelete={() => { if (confirm("حذف؟")) delMut.mutate(u.id); }} />
      ))}
    </div>
  );
}

function LandlordRow({ u, onDelete }: { u: any; onDelete: () => void }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: u.full_name, phone: u.phone, email: u.email ?? "", notes: u.notes ?? "" });
  const upd = useMutation({
    mutationFn: () => updateLandlordById(u.id, form),
    onSuccess: () => { setEditing(false); qc.invalidateQueries({ queryKey: ["landlords"] }); },
  });
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
            <Users size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-primary">{u.full_name}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><Phone size={10} />{u.phone}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setEditing((e) => !e)} className="rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-primary">{editing ? "إغلاق" : "تعديل"}</button>
          <button onClick={onDelete} className="rounded-full bg-destructive/10 px-3 py-1.5 text-[11px] font-bold text-destructive">حذف</button>
        </div>
      </div>
      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); upd.mutate(); }} className="mt-3 flex flex-col gap-2">
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl border border-border px-3 py-2 text-xs" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-border px-3 py-2 text-xs" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="البريد" className="rounded-xl border border-border px-3 py-2 text-xs" />
          <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات" className="rounded-xl border border-border px-3 py-2 text-xs" />
          <button disabled={upd.isPending} className="rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">حفظ التعديلات</button>
        </form>
      )}
    </div>
  );
}

function HousingTab() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["all-housing"], queryFn: listAllHousingRequests });
  const upd = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateHousingRequestStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-housing"] }),
  });
  if (isLoading) return <p className="mt-6 text-center text-xs text-muted-foreground">جارٍ التحميل...</p>;
  return (
    <div className="mt-4 flex flex-col gap-3">
      {data.length === 0 && <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-soft">لا توجد طلبات سكن.</p>}
      {data.map((r: any) => (
        <div key={r.id} className="rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-primary">{r.students?.full_name ?? "طالب"}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{r.type} • {r.area || "أي منطقة"} • {r.budget ? `${Number(r.budget).toLocaleString("ar-EG")} ج` : "—"}</p>
              {r.notes && <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{r.notes}</p>}
            </div>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">{r.status}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => upd.mutate({ id: r.id, status: "قيد المراجعة" })} className="flex-1 rounded-full bg-secondary py-2 text-xs font-bold text-primary">قيد المراجعة</button>
            <button onClick={() => upd.mutate({ id: r.id, status: "تمت المطابقة" })} className="flex-1 rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground">مطابقة</button>
            <button onClick={() => upd.mutate({ id: r.id, status: "مغلق" })} className="flex-1 rounded-full bg-destructive/10 py-2 text-xs font-bold text-destructive">إغلاق</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Verified renters: admin records who actually rented a property. Only
// these students can submit a property/landlord rating (enforced by DB RLS).
function RentalsTab() {
  const qc = useQueryClient();
  const { data: rentals = [], isLoading } = useQuery({ queryKey: ["rentals"], queryFn: listRentals });
  const { data: properties = [] } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const { data: students = [] } = useQuery({ queryKey: ["students-lite"], queryFn: listStudents });
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ student_id: "", property_id: "", start_date: "", end_date: "", notes: "" });

  const createMut = useMutation({
    mutationFn: () => {
      const prop = properties.find((p) => p.id === form.property_id);
      return createRental({
        student_id: form.student_id,
        property_id: form.property_id,
        landlord_id: prop?.landlordId,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        notes: form.notes || null,
      });
    },
    onSuccess: () => {
      toast.success("تم توثيق الإيجار — يمكن للطالب الآن إضافة تقييم");
      setShow(false);
      setForm({ student_id: "", property_id: "", start_date: "", end_date: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["rentals"] });
    },
    onError: (e: any) => toast.error(e.message || "تعذّر إنشاء السجل"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => deleteRental(id),
    onSuccess: () => { toast.success("تم حذف السجل"); qc.invalidateQueries({ queryKey: ["rentals"] }); },
    onError: (e: any) => toast.error(e.message || "تعذّر الحذف"),
  });

  return (
    <div className="mt-4 flex flex-col gap-3">
      <button
        onClick={() => setShow((s) => !s)}
        className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
      >
        <KeyRound size={16} /> {show ? "إغلاق" : "توثيق إيجار جديد"}
      </button>
      {show && (
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-soft">
          <select required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs">
            <option value="" disabled>اختر طالب</option>
            {students.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
          <select required value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs">
            <option value="" disabled>اختر عقار</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
          </div>
          <textarea rows={2} placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2 text-xs" />
          <button disabled={createMut.isPending} className="flex items-center justify-center gap-2 rounded-full bg-gold py-2 text-xs font-bold text-gold-foreground disabled:opacity-60">
            {createMut.isPending && <Loader2 size={12} className="animate-spin" />}
            حفظ التوثيق
          </button>
        </form>
      )}

      {isLoading && <p className="text-center text-xs text-muted-foreground">جارٍ التحميل...</p>}
      {!isLoading && rentals.length === 0 && (
        <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-soft">لا يوجد إيجارات موثقة بعد.</p>
      )}
      {rentals.map((r: any) => (
        <div key={r.id} className="rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary">{r.students?.full_name ?? "طالب"}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{r.properties?.title ?? "—"}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {r.start_date ?? "—"} ← {r.end_date ?? "—"}
              </p>
            </div>
            <button onClick={() => { if (confirm("حذف السجل؟")) delMut.mutate(r.id); }} className="rounded-full bg-destructive/10 px-3 py-1.5 text-[11px] font-bold text-destructive">
              حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
