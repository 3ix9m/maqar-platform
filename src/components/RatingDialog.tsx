import { useEffect, useState } from "react";
import { Star, X, Loader2, ShieldCheck } from "lucide-react";
import { getMyPropertyRating, submitPropertyRating, submitLandlordRating } from "@/lib/api";

const CATS: { key: "cleanliness" | "internet" | "furniture" | "quietness"; label: string }[] = [
  { key: "cleanliness", label: "النظافة" },
  { key: "internet", label: "الإنترنت" },
  { key: "furniture", label: "الأثاث" },
  { key: "quietness", label: "الهدوء" },
];

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-row-reverse items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} نجوم`}
          className="p-0.5"
        >
          <Star
            size={22}
            className={n <= value ? "fill-gold text-gold" : "text-muted-foreground/40"}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingDialog({
  open,
  onClose,
  studentId,
  propertyId,
  landlordId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  studentId: string;
  propertyId: string;
  landlordId?: string;
  onSaved?: () => void;
}) {
  const [values, setValues] = useState({ cleanliness: 0, internet: 0, furniture: 0, quietness: 0 });
  const [landlordRating, setLandlordRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    getMyPropertyRating(studentId, propertyId).then((r) => {
      if (r) {
        setValues({
          cleanliness: Number(r.cleanliness) || 0,
          internet: Number(r.internet) || 0,
          furniture: Number(r.furniture) || 0,
          quietness: Number(r.quietness) || 0,
        });
        setComment(r.comment ?? "");
      }
    });
  }, [open, studentId, propertyId]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = CATS.some((c) => values[c.key] === 0);
    if (missing) { setErr("قيّم كل البنود من فضلك"); return; }
    setLoading(true);
    setErr(null);
    try {
      await submitPropertyRating({
        student_id: studentId,
        property_id: propertyId,
        cleanliness: values.cleanliness,
        internet: values.internet,
        furniture: values.furniture,
        quietness: values.quietness,
        comment: comment || null,
      });
      if (landlordId && landlordRating > 0) {
        await submitLandlordRating({
          student_id: studentId,
          landlord_id: landlordId,
          rating: landlordRating,
        });
      }
      onSaved?.();
      onClose();
    } catch (e: any) {
      setErr(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 shadow-card sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-primary">قيّم تجربتك</h3>
          <button type="button" onClick={onClose} aria-label="إغلاق"><X size={18} /></button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">تقييمك يساعد بقية الطلاب على اختيار أفضل سكن.</p>

        <div className="mt-4 flex flex-col gap-3">
          {CATS.map((c) => (
            <div key={c.key} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-3 py-2.5">
              <span className="text-sm font-bold text-primary">{c.label}</span>
              <Stars value={values[c.key]} onChange={(n) => setValues({ ...values, [c.key]: n })} />
            </div>
          ))}
        </div>

        {landlordId && (
          <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/5 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-gold" />
              <p className="text-xs font-bold text-primary">تقييم المالك</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">التعامل والمصداقية</span>
              <Stars value={landlordRating} onChange={setLandlordRating} />
            </div>
          </div>
        )}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="شاركنا تجربتك (اختياري)"
          className="mt-4 w-full rounded-2xl border border-border bg-card px-3 py-2 text-xs"
        />

        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}

        <button
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          إرسال التقييم
        </button>
      </form>
    </div>
  );
}
