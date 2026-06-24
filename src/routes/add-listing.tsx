import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, DoorOpen, BedDouble, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";

export const Route = createFileRoute("/add-listing")({
  head: () => ({
    meta: [
      { title: "إضافة إعلان جديد | مَقَر" },
      { name: "description", content: "أضف إعلان سكن جديد للطلاب." },
    ],
  }),
  component: AddListing,
});

const types = [
  { id: "apt", label: "شقة كاملة", icon: Building2 },
  { id: "room", label: "أوضة", icon: DoorOpen },
  { id: "bed", label: "سرير", icon: BedDouble },
];

function AddListing() {
  const [type, setType] = useState("apt");
  return (
    <AppShell>
      <TopBar variant="page" title="إضافة إعلان جديد" backTo="/my-listings" />
      <form className="flex flex-col gap-5 px-5 pb-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="text-xs font-bold text-primary">نوع السكن</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {types.map(({ id, label, icon: Icon }) => {
              const active = type === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setType(id)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-bold transition ${
                    active
                      ? "border-gold bg-gold/10 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Icon size={20} className={active ? "text-gold" : "text-muted-foreground"} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="السعر الشهري (جنيه)" placeholder="مثال: 2500" />
        <Field label="الموقع بالتفصيل" placeholder="اكتب المنطقة أو أقرب مكان" />
        <Field label="وصف مختصر" placeholder="اكتب وصف مختصر عن السكن..." textarea />

        <button
          type="submit"
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-card"
        >
          <ChevronLeft size={16} />
          التالي
        </button>
      </form>
    </AppShell>
  );
}

function Field({ label, placeholder, textarea }: { label: string; placeholder: string; textarea?: boolean }) {
  return (
    <div>
      <label className="text-xs font-bold text-primary">{label}</label>
      <div className="mt-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        {textarea ? (
          <textarea
            rows={3}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            dir="rtl"
          />
        ) : (
          <input
            placeholder={placeholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            dir="rtl"
          />
        )}
      </div>
    </div>
  );
}
