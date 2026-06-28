import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLandlordRequest, getMyLandlordRequest } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { X, Building2, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

export function LandlordRequestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const { data: existing, isLoading } = useQuery({
    queryKey: ["my-landlord-request", user?.id],
    enabled: !!user && open,
    queryFn: () => getMyLandlordRequest(user!.id),
  });

  const mut = useMutation({
    mutationFn: () =>
      createLandlordRequest({ user_id: user!.id, full_name: fullName.trim(), phone: phone.trim(), note: note.trim() || undefined }),
    onSuccess: () => {
      toast.success("تم إرسال طلبك. سنراجعه قريبًا.");
      qc.invalidateQueries({ queryKey: ["my-landlord-request", user?.id] });
    },
    onError: (e: any) => toast.error(e.message || "تعذّر إرسال الطلب"),
  });

  if (!open) return null;

  const pending = existing?.status === "pending";
  const approved = existing?.status === "approved";
  const rejected = existing?.status === "rejected";
  const canSubmit = !pending && !approved;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
              <Building2 size={18} />
            </span>
            <h2 className="text-base font-bold text-primary">طلب صلاحيات مالك</h2>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-10"><Loader2 className="animate-spin text-gold" /></div>
        ) : pending ? (
          <div className="mt-5 rounded-2xl bg-secondary p-4 text-center">
            <Clock className="mx-auto mb-2 text-gold" />
            <p className="text-sm font-bold text-primary">طلبك قيد المراجعة</p>
            <p className="mt-1 text-xs text-muted-foreground">سنخبرك بمجرد اعتماده من الإدارة.</p>
          </div>
        ) : approved ? (
          <div className="mt-5 rounded-2xl bg-green-50 p-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 text-green-600" />
            <p className="text-sm font-bold text-primary">تم اعتماد طلبك</p>
            <p className="mt-1 text-xs text-muted-foreground">يمكنك الآن الدخول إلى لوحة المالك وإضافة عقاراتك.</p>
          </div>
        ) : (
          <>
            {rejected && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-destructive/10 p-3 text-[12px] text-destructive">
                <XCircle size={14} /> تم رفض طلبك السابق. يمكنك تقديم طلب جديد.
              </div>
            )}
            <p className="mt-4 text-[12px] text-muted-foreground">
              املأ بياناتك وسنراجع طلبك يدويًا. بعد الاعتماد ستتمكن من إضافة عقاراتك وإدارتها.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الكامل"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف (واتساب)"
                inputMode="tel"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="نبذة عن عقاراتك (اختياري)"
                rows={3}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm"
              />
              <button
                disabled={!canSubmit || mut.isPending || !fullName.trim() || !phone.trim()}
                onClick={() => mut.mutate()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {mut.isPending && <Loader2 size={14} className="animate-spin" />}
                إرسال الطلب
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
