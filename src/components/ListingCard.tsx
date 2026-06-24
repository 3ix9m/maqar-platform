import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import type { Listing } from "@/lib/listings";

export function ListingCard({ listing, variant = "grid" }: { listing: Listing; variant?: "grid" | "row" }) {
  if (variant === "row") {
    return (
      <Link
        to="/listing/$id"
        params={{ id: listing.id }}
        className="flex gap-3 rounded-2xl bg-card p-3 shadow-soft"
      >
        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl">
          <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
          {listing.badge && (
            <span className="absolute right-1.5 top-1.5 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {listing.badge}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-primary">{listing.title}</h3>
            <button aria-label="إضافة للمفضلة" className="shrink-0 text-muted-foreground">
              <Heart size={18} />
            </button>
          </div>
          <p className="truncate text-xs text-muted-foreground">{listing.area}</p>
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
    <Link
      to="/listing/$id"
      params={{ id: listing.id }}
      className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
        <button
          aria-label="إضافة للمفضلة"
          className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 text-primary"
        >
          <Heart size={16} />
        </button>
        {listing.badge && (
          <span className="absolute bottom-2 right-2 rounded-md bg-primary/95 px-2 py-1 text-[10px] font-bold text-primary-foreground">
            {listing.badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="truncate text-sm font-bold text-primary">{listing.title}</h3>
        <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
          <MapPin size={12} className="text-gold" />
          {listing.area}
        </p>
        <p className="text-sm font-extrabold text-gold">
          {listing.price.toLocaleString("ar-EG")}{" "}
          <span className="text-[11px] font-medium text-muted-foreground">ج/شهر</span>
        </p>
        <p className="text-[11px] text-muted-foreground">{listing.distance}</p>
      </div>
    </Link>
  );
}
