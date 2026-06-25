import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminStats, fetchListings, deleteProperty, updateProperty, createProperty,
  listLandlords, createLandlord, deleteLandlord, updateLandlordById,
  listAllViewingRequests, updateViewingStatus, uploadPropertyImage,
  listAllHousingRequests, updateHousingRequestStatus,
  listRentals, createRental, deleteRental, listStudents,
} from "@/lib/api";
import { statusTone, type ListingStatus } from "@/lib/listings";
import { Users, Building2, Inbox, CheckCircle2, UserPlus, Plus, Edit3, Trash2, BarChart3, Star, Loader2, X, Upload, Search, HomeIcon, Phone, KeyRound } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
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
            <div className="mt-3 flex gap-2">
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
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      let id = editId;
      if (editId) {
        await updateProperty(editId, form);
      } else {
        const created = await createProperty(form as any);
        id = created.id;
      }
      if (file && id) await uploadPropertyImage(id, file);
      onSaved();
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
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
        <label className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Upload size={14} className="text-gold" />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-viewings"] }),
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
