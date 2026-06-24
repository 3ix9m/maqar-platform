import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, Building2, Tag, Filter } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopBar } from "@/components/TopBar";
import { ListingCard } from "@/components/ListingCard";
import { listings } from "@/lib/listings";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "البحث | مَقَر" },
      { name: "description", content: "ابحث وفلتر الشقق والأوض والسرير القريبة من جامعة ميريت والكوامل." },
    ],
  }),
  component: SearchPage,
});

const filters = [
  { label: "النوع", icon: Building2 },
  { label: "السعر", icon: Tag },
  { label: "فلترة", icon: Filter },
];

function SearchPage() {
  const [q, setQ] = useState("");
  const results = listings.filter((l) =>
    !q || l.title.includes(q) || l.area.includes(q) || l.type.includes(q),
  );
  return (
    <AppShell>
      <TopBar variant="page" title="البحث" />
      <div className="px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
          <SearchIcon size={18} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن منطقة..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            dir="rtl"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map(({ label, icon: Icon }) => (
            <button key={label} className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-soft">
              <Icon size={14} className="text-gold" />
              {label}
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs text-muted-foreground">{results.length} نتيجة مطابقة</p>

        <div className="mt-3 flex flex-col gap-3 pb-4">
          {results.map((l) => <ListingCard key={l.id} listing={l} variant="row" />)}
        </div>
      </div>
    </AppShell>
  );
}
