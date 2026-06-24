import apt1 from "@/assets/apt-1.jpg";
import apt2 from "@/assets/apt-2.jpg";
import apt3 from "@/assets/apt-3.jpg";
import apt4 from "@/assets/apt-4.jpg";

export type ListingType = "شقة كاملة" | "أوضة مفروشة" | "سرير";

export interface Listing {
  id: string;
  title: string;
  area: string;
  price: number;
  type: ListingType;
  distance: string;
  image: string;
  rooms: number;
  baths: number;
  badge?: string;
  description: string;
}

export const listings: Listing[] = [
  {
    id: "1",
    title: "شقة مفروشة بالكامل",
    area: "شارع ميريت الرئيسي - الكوامل",
    price: 4500,
    type: "شقة كاملة",
    distance: "5 دقائق من الجامعة",
    image: apt4,
    rooms: 3,
    baths: 2,
    badge: "شقة كاملة",
    description: "شقة مفروشة بالكامل قريبة من الجامعة وجميع الخدمات. مناسبة جداً للطلاب، تحتوي على واي فاي، تكييف، مطبخ مجهز ومياه ساخنة.",
  },
  {
    id: "2",
    title: "أوضة مفروشة فاخرة",
    area: "الحي الثاني - الكوامل",
    price: 2200,
    type: "أوضة مفروشة",
    distance: "7 دقائق من الجامعة",
    image: apt2,
    rooms: 1,
    baths: 1,
    badge: "أوضة قريبة",
    description: "أوضة مفروشة بإطلالة جميلة، تشمل سرير مزدوج ومكتب دراسة وخزانة كبيرة.",
  },
  {
    id: "3",
    title: "سرير في غرفة مشتركة",
    area: "الحي الأول - الكوامل",
    price: 1200,
    type: "سرير",
    distance: "10 دقائق من الجامعة",
    image: apt3,
    rooms: 1,
    baths: 1,
    badge: "سرير شاغر",
    description: "سرير في غرفة مشتركة هادئة مع طالب آخر. تكييف وواي فاي مجاني.",
  },
  {
    id: "4",
    title: "أوضة مفروشة",
    area: "ميريت - بجوار الجامعة",
    price: 1600,
    type: "أوضة مفروشة",
    distance: "3 دقائق - ميريت",
    image: apt1,
    rooms: 1,
    baths: 1,
    description: "أوضة هادئة بإضاءة طبيعية ممتازة.",
  },
];

export const featureChips = [
  { label: "شقق موثقة", icon: "shield" },
  { label: "قريبة من الجامعة", icon: "pin" },
  { label: "تواصل مباشر", icon: "chat" },
  { label: "بدون عمولات", icon: "percent" },
] as const;
