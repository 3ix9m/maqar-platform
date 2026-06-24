import apt1 from "@/assets/apt-1.jpg";
import apt2 from "@/assets/apt-2.jpg";
import apt3 from "@/assets/apt-3.jpg";
import apt4 from "@/assets/apt-4.jpg";

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
}

const gallery = [apt1, apt2, apt3, apt4];

export const listings: Listing[] = [
  {
    id: "1",
    title: "شقة مفروشة بالكامل",
    area: "شارع ميريت الرئيسي - الكوامل",
    price: 4500,
    type: "شقة كاملة",
    status: "متاحة",
    distance: "5 دقائق من الجامعة",
    image: apt4,
    gallery,
    rooms: 3,
    baths: 2,
    verified: true,
    previouslyRented: true,
    updatedDaysAgo: 2,
    badge: "الأكثر طلباً",
    rating: 4.8,
    ratingsCount: 24,
    detailRating: { cleanliness: 4.9, internet: 4.6, furniture: 4.8, quietness: 4.7 },
    description: "شقة مفروشة بالكامل قريبة من الجامعة وجميع الخدمات. مناسبة جداً للطلاب، تحتوي على واي فاي، تكييف، مطبخ مجهز ومياه ساخنة.",
  },
  {
    id: "2",
    title: "أوضة مفروشة فاخرة",
    area: "الحي الثاني - الكوامل",
    price: 2200,
    type: "أوضة مفروشة",
    status: "متاحة",
    distance: "7 دقائق من الجامعة",
    image: apt2,
    gallery,
    rooms: 1,
    baths: 1,
    verified: true,
    previouslyRented: false,
    updatedDaysAgo: 5,
    badge: "أفضل قيمة",
    rating: 4.6,
    ratingsCount: 12,
    detailRating: { cleanliness: 4.7, internet: 4.5, furniture: 4.6, quietness: 4.8 },
    description: "أوضة مفروشة بإطلالة جميلة، تشمل سرير مزدوج ومكتب دراسة وخزانة كبيرة.",
  },
  {
    id: "3",
    title: "سرير في غرفة مشتركة",
    area: "الحي الأول - الكوامل",
    price: 1200,
    type: "سرير",
    status: "محجوزة",
    distance: "10 دقائق من الجامعة",
    image: apt3,
    gallery,
    rooms: 1,
    baths: 1,
    verified: true,
    previouslyRented: true,
    updatedDaysAgo: 1,
    rating: 4.4,
    ratingsCount: 8,
    detailRating: { cleanliness: 4.3, internet: 4.5, furniture: 4.2, quietness: 4.6 },
    description: "سرير في غرفة مشتركة هادئة مع طالب آخر. تكييف وواي فاي مجاني.",
  },
  {
    id: "4",
    title: "أوضة مفروشة",
    area: "ميريت - بجوار الجامعة",
    price: 1600,
    type: "أوضة مفروشة",
    status: "مؤجرة",
    distance: "3 دقائق - ميريت",
    image: apt1,
    gallery,
    rooms: 1,
    baths: 1,
    verified: true,
    previouslyRented: true,
    updatedDaysAgo: 14,
    rating: 4.7,
    ratingsCount: 19,
    detailRating: { cleanliness: 4.8, internet: 4.6, furniture: 4.7, quietness: 4.9 },
    description: "أوضة هادئة بإضاءة طبيعية ممتازة.",
  },
];

export function statusTone(s: ListingStatus) {
  if (s === "متاحة") return { dot: "bg-[oklch(0.65_0.17_150)]", text: "text-[oklch(0.45_0.15_150)]", bg: "bg-[oklch(0.95_0.05_150)]" };
  if (s === "محجوزة") return { dot: "bg-gold", text: "text-gold", bg: "bg-gold/15" };
  return { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-secondary" };
}
