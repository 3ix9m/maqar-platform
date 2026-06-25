import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star, ShieldCheck, Clock, Scale, GraduationCap } from "lucide-react";
import type { Listing } from "@/lib/listings";
import { statusTone } from "@/lib/listings";
import { useCompare } from "@/hooks/use-compare";
import { useUniversity } from "@/hooks/use-university";
import { distanceKm, formatDistanceKm } from "@/lib/universities";
import { toast } from "sonner";

export function StatusPill({ listing, className = "" }: { listing: Listing; className?: string }) {
  const t = statusTone(listing.status);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${t.bg} ${t.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {listing.status}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
      <ShieldCheck size={11} className="text-gold" />
      تمت معاينتها بواسطة مَقَر
    </span>
  );
}

function UniversityDistanceChip({ listing }: { listing: Listing }) {
  const { university } = useUniversity();
  if (!university || listing.latitude == null || listing.longitude == null) return null;
  const km = distanceKm(university, { lat: listing.latitude, lng: listing.longitude });
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold">
      <GraduationCap size={10} />
      {formatDistanceKm(km)}
    </span>
  );
}

export function ListingCard({
  listing,
  variant = "grid",
  isFavorite = false,
  onToggleFavorite,
}: {
  listing: Listing;
  variant?: "grid" | "row";
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, next: boolean) => void;
}) {
  const compare = useCompare();
  const inCompare = compare.isInCompare(listing.id);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(listing.id, !isFavorite);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCompare && !compare.canAdd) {
      toast.error(`الحد الأقصى ${compare.max} عقارات في المقارنة`);
      return;
    }
    const added = compare.toggle(listing.id);
    toast.success(added ? "تمت إضافته للمقارنة" : "تمت إزالته من المقارنة");
  };

  if (variant === "row") {
    return (
      <Link to="/listing/$id" params={{ id: listing.id }} className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
          <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
          {listing.badge && (
            <span className="absolute right-1.5 top-1.5 rounded-md bg-gold px-1.5 py-0.5 text-[9px] font-extrabold text-gold-foreground">
              {listing.badge}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-sm font-bold text-primary">{listing.title}</h3>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCompare}
                  aria-label="إضافة للمقارنة"
                  className={inCompare ? "text-gold" : "text-muted-foreground"}
                >
                  <Scale size={16} className={inCompare ? "fill-current/10" : ""} />
                </button>
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={handleFav}
                    aria-label="مفضلة"
                    className={isFavorite ? "text-gold" : "text-muted-foreground"}
                  >
                    <Heart size={18} className={isFavorite ? "fill-current" : ""} />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{listing.area}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <StatusPill listing={listing} />
              {listing.verified && <ShieldCheck size={12} className="text-gold" aria-label="موثقة" />}
              <span className="flex items-center gap-0.5 text-[11px] font-semibold text-primary">
                <Star size={11} className="fill-gold text-gold" />
                {listing.rating.toFixed(1)}
              </span>
              <UniversityDistanceChip listing={listing} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-sm font-extrabold text-gold">
              {listing.price.toLocaleString("ar-EG")} <span className="text-[11px] font-medium">ج/شهر</span>
            </p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin size={12} className="text-gold" />
              {listing.distance}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/listing/$id" params={{ id: listing.id }} className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={handleFav}
              aria-label="مفضلة"
              className={`grid h-8 w-8 place-items-center rounded-full ${isFavorite ? "bg-gold text-gold-foreground" : "bg-card/90 text-primary"}`}
            >
              <Heart size={16} className={isFavorite ? "fill-current" : ""} />
            </button>
          )}
          <button
            type="button"
            onClick={handleCompare}
            aria-label="مقارنة"
            className={`grid h-8 w-8 place-items-center rounded-full ${inCompare ? "bg-gold text-gold-foreground" : "bg-card/90 text-primary"}`}
          >
            <Scale size={14} />
          </button>
        </div>
        {listing.badge && (
          <span className="absolute right-2 top-2 rounded-md bg-gold px-2 py-0.5 text-[10px] font-extrabold text-gold-foreground">
            {listing.badge}
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded-md bg-primary/95 px-2 py-1 text-[10px] font-bold text-primary-foreground">
          {listing.type}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="truncate text-sm font-bold text-primary">{listing.title}</h3>
        <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
          <MapPin size={12} className="text-gold" />
          {listing.area}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-gold">
            {listing.price.toLocaleString("ar-EG")} <span className="text-[11px] font-medium text-muted-foreground">ج/شهر</span>
          </p>
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-primary">
            <Star size={11} className="fill-gold text-gold" />
            {listing.rating.toFixed(1)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <StatusPill listing={listing} />
          {listing.verified && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              <ShieldCheck size={10} className="text-gold" />
              موثقة
            </span>
          )}
          <UniversityDistanceChip listing={listing} />
          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Clock size={10} />
            منذ {listing.updatedDaysAgo} يوم
          </span>
        </div>
      </div>
    </Link>
  );
}
