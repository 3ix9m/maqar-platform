import { supabase } from "@/integrations/supabase/client";
import apt1 from "@/assets/apt-1.jpg";

export type ListingType = "شقة كاملة" | "أوضة مفروشة" | "سرير";
export type ListingStatus = "متاحة" | "محجوزة" | "مؤجرة";

export interface Rating {
  cleanliness: number;
  internet: number;
  furniture: number;
  quietness: number;
}

export interface Listing {
  id: string;
  title: string;
  area: string;
  price: number;
  type: ListingType;
  status: ListingStatus;
  distance: string;
  image: string;
  gallery: string[];
  rooms: number;
  baths: number;
  verified: boolean;
  previouslyRented: boolean;
  updatedDaysAgo: number;
  badge?: "أفضل قيمة" | "الأكثر طلباً";
  rating: number;
  ratingsCount: number;
  detailRating: Rating;
  description: string;
  landlordId?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function statusTone(s: ListingStatus) {
  if (s === "متاحة") return { dot: "bg-[oklch(0.65_0.17_150)]", text: "text-[oklch(0.45_0.15_150)]", bg: "bg-[oklch(0.95_0.05_150)]" };
  if (s === "محجوزة") return { dot: "bg-gold", text: "text-gold", bg: "bg-gold/15" };
  return { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-secondary" };
}

const FALLBACK = apt1;
const SIGN_TTL = 60 * 60; // 1h

export function isStoragePath(s: string | null | undefined): boolean {
  if (!s) return false;
  return !(s.startsWith("http") || s.startsWith("/") || s.startsWith("data:"));
}

export function resolveImage(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return FALLBACK;
  if (!isStoragePath(pathOrUrl)) return pathOrUrl;
  // Storage path — will be signed later by signListingImages.
  return pathOrUrl;
}

export async function signStoragePaths(paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter((p) => p && isStoragePath(p))));
  if (!unique.length) return {};
  const { data, error } = await supabase.storage.from("properties").createSignedUrls(unique, SIGN_TTL);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  data.forEach((d: any) => { if (d?.path && d?.signedUrl) map[d.path] = d.signedUrl; });
  return map;
}

export async function signListingImages<T extends { image: string; gallery: string[] }>(listing: T): Promise<T> {
  const paths = [listing.image, ...listing.gallery];
  const map = await signStoragePaths(paths);
  const sign = (p: string) => (isStoragePath(p) ? map[p] || FALLBACK : p);
  return { ...listing, image: sign(listing.image), gallery: listing.gallery.map(sign) };
}

export async function signListingsImages<T extends { image: string; gallery: string[] }>(listings: T[]): Promise<T[]> {
  const all = listings.flatMap((l) => [l.image, ...l.gallery]);
  const map = await signStoragePaths(all);
  const sign = (p: string) => (isStoragePath(p) ? map[p] || FALLBACK : p);
  return listings.map((l) => ({ ...l, image: sign(l.image), gallery: l.gallery.map(sign) }));
}

export interface PropertyRow {
  id: string;
  landlord_id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  area: string | null;
  distance: string | null;
  price: number;
  rooms: number;
  baths: number;
  verified: boolean;
  previously_rented: boolean;
  badge: string | null;
  cover_image: string | null;
  updated_at: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PropertyImageRow {
  id: string;
  property_id: string;
  url: string;
  sort_order: number;
}

export interface PropertyRatingRow {
  property_id: string;
  cleanliness: number | null;
  internet: number | null;
  furniture: number | null;
  quietness: number | null;
}

export function mapPropertyToListing(
  p: PropertyRow,
  images: PropertyImageRow[] = [],
  ratings: PropertyRatingRow[] = [],
): Listing {
  const gallery = images.length ? images.map((i) => resolveImage(i.url)) : [resolveImage(p.cover_image)];
  const avg = (key: keyof Rating) => {
    const vals = ratings.map((r) => Number(r[key as keyof PropertyRatingRow])).filter((n) => !isNaN(n) && n > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };
  const detailRating: Rating = {
    cleanliness: avg("cleanliness"),
    internet: avg("internet"),
    furniture: avg("furniture"),
    quietness: avg("quietness"),
  };
  const overall =
    (detailRating.cleanliness + detailRating.internet + detailRating.furniture + detailRating.quietness) / 4 || 0;
  const updatedDaysAgo = Math.max(
    0,
    Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
  );
  return {
    id: p.id,
    title: p.title,
    area: p.area ?? "",
    price: Number(p.price),
    type: (p.type as ListingType) || "شقة كاملة",
    status: (p.status as ListingStatus) || "متاحة",
    distance: p.distance ?? "",
    image: gallery[0],
    gallery,
    rooms: p.rooms,
    baths: p.baths,
    verified: p.verified,
    previouslyRented: p.previously_rented,
    updatedDaysAgo,
    badge: (p.badge as Listing["badge"]) || undefined,
    rating: overall,
    ratingsCount: ratings.length,
    detailRating,
    description: p.description ?? "",
    landlordId: p.landlord_id,
    latitude: p.latitude != null ? Number(p.latitude) : null,
    longitude: p.longitude != null ? Number(p.longitude) : null,
  };
}
