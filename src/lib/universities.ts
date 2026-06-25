// Major Egyptian universities with approximate coordinates.
// Used to compute distance from each property to the student's chosen university.

export interface University {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const UNIVERSITIES: University[] = [
  { id: "merit", name: "جامعة ميريت", lat: 30.1925, lng: 31.4180 },
  { id: "kawamel", name: "جامعة الكوامل", lat: 30.1855, lng: 31.4225 },
  { id: "cairo", name: "جامعة القاهرة", lat: 30.0265, lng: 31.2086 },
  { id: "ainshams", name: "جامعة عين شمس", lat: 30.0772, lng: 31.2849 },
  { id: "auc", name: "الجامعة الأمريكية بالقاهرة", lat: 29.9999, lng: 31.4998 },
  { id: "guc", name: "الجامعة الألمانية", lat: 29.9871, lng: 31.4499 },
  { id: "alex", name: "جامعة الإسكندرية", lat: 31.2089, lng: 29.9214 },
  { id: "mansoura", name: "جامعة المنصورة", lat: 31.0438, lng: 31.3534 },
  { id: "asyut", name: "جامعة أسيوط", lat: 27.1980, lng: 31.1727 },
];

const STORAGE_KEY = "maqar.university";

export function getSavedUniversityId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function saveUniversityId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(STORAGE_KEY, id);
  else window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("maqar:university"));
}

export function getUniversityById(id: string | null | undefined): University | null {
  if (!id) return null;
  return UNIVERSITIES.find((u) => u.id === id) ?? null;
}

// Haversine distance in kilometers
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} م`;
  if (km < 10) return `${km.toFixed(1)} كم`;
  return `${Math.round(km)} كم`;
}
