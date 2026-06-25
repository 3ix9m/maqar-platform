import { useState } from "react";
import { Bell, X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPriceAlert } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: {
    area?: string;
    type?: string;
    maxPrice?: string;
    verifiedOnly?: boolean;
  };
}

export function PriceAlertDialog({ open, onClose, initial }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [area, setArea] = useState(initial?.area ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice ?? "");
  const [verifiedOnly, setVerifiedOnly] = useState(!!initial?.verifiedOnly);

  const mut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("سجّل دخولك أولاً");
      await createPriceAlert({
        student_id: user.id,
        area: area || null,
        type: type || null,
        max_price: maxPrice ? Number(maxPrice) : null,
        verified_only: verifiedOnly,
      });
    },
    onSuccess: () => {
      toast.success("تم حفظ التنبيه. هنبلغك بأي عقار جديد يطابق الشروط.");
      qc.invalidateQueries({ queryKey: ["price-alerts", user?.id] });
      onClose();
    },
    onError: (e: any) => toast.error(e.message || "تعذّر حفظ التنبيه"),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 px-4 pb-4 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-card p-5 shadow-card"
        dir="rtl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
              <Bell size={18} />
            </span>
            <div>
              <p className="text-sm font-extrabold text-primary">تنبيه سعر جديد</p>
              <p className="text-[11px] text-muted-foreground">هنبلغك بأول عقار يطابق شروطك</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <Field label="المنطقة">
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="مثلاً: القاهرة الجديدة"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none"
            />
          </Field>
          <Field label="نوع العقار">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none"
            >
              <option value="">أي نوع</option>
              <option value="شقة كاملة">شقة كاملة</option>
              <option value="أوضة مفروشة">أوضة مفروشة</option>
              <option value="سرير">سرير</option>
            </select>
          </Field>
          <Field label="أقصى سعر (ج/شهر)">
            <input
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
              placeholder="مثلاً: 3000"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none"
            />
          </Field>
          <label className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs font-semibold text-primary">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
            موثقة فقط
          </label>
        </div>

        <button
          type="button"
          disabled={mut.isPending || !user}
          onClick={() => mut.mutate()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-extrabold text-gold-foreground disabled:opacity-60"
        >
          {mut.isPending && <Loader2 size={14} className="animate-spin" />}
          {user ? "حفظ التنبيه" : "سجّل دخولك أولاً"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-primary">{label}</span>
      {children}
    </label>
  );
}
