import { Link } from "@tanstack/react-router";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/hooks/use-compare";

export function CompareBar() {
  const { ids, clear, max } = useCompare();
  if (ids.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-gold-foreground">
            <Scale size={16} />
          </span>
          <div className="text-xs leading-tight">
            <p className="font-bold">المقارنة</p>
            <p className="text-primary-foreground/70">
              {ids.length} من {max} عقارات
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            aria-label="مسح المقارنة"
            className="grid h-8 w-8 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground/80"
          >
            <X size={14} />
          </button>
          <Link
            to="/compare"
            className="rounded-full bg-gold px-4 py-2 text-xs font-extrabold text-gold-foreground"
          >
            قارن الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
