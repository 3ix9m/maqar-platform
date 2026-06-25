import { GraduationCap } from "lucide-react";
import { useUniversity } from "@/hooks/use-university";
import { UNIVERSITIES } from "@/lib/universities";

export function UniversityPicker({ compact = false }: { compact?: boolean }) {
  const { universityId, setUniversity } = useUniversity();

  return (
    <label className={`flex items-center gap-2 rounded-2xl border border-border bg-card ${compact ? "px-3 py-2" : "px-4 py-3"} shadow-soft`}>
      <GraduationCap size={16} className="shrink-0 text-gold" />
      <span className="text-[11px] font-bold text-muted-foreground">جامعتك</span>
      <select
        value={universityId ?? ""}
        onChange={(e) => setUniversity(e.target.value || null)}
        className="flex-1 bg-transparent text-xs font-bold text-primary outline-none"
        dir="rtl"
      >
        <option value="">اختر جامعتك</option>
        {UNIVERSITIES.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </label>
  );
}
