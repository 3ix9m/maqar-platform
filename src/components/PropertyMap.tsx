import { useEffect, useRef } from "react";
import type { Listing } from "@/lib/listings";

declare global {
  interface Window {
    google?: any;
    __maqarMapInit?: () => void;
  }
}

const MAPS_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const MAPS_CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

let loaderPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.google?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  if (!MAPS_KEY) return Promise.reject(new Error("missing google maps key"));
  loaderPromise = new Promise<void>((resolve, reject) => {
    window.__maqarMapInit = () => resolve();
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&loading=async&callback=__maqarMapInit${MAPS_CHANNEL ? `&channel=${MAPS_CHANNEL}` : ""}`;
    s.onerror = () => reject(new Error("failed to load google maps"));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

export function PropertyMap({ listings }: { listings: Listing[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const points = listings.filter((l) => l.latitude != null && l.longitude != null);

  useEffect(() => {
    let cancelled = false;
    if (!mapEl.current) return;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapEl.current) return;
        const g = window.google.maps;
        const center = points.length
          ? { lat: Number(points[0].latitude), lng: Number(points[0].longitude) }
          : { lat: 30.0444, lng: 31.2357 }; // Cairo fallback
        mapRef.current ||= new g.Map(mapEl.current, {
          center,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
        });
        // clear old markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        const info = new g.InfoWindow();
        const bounds = new g.LatLngBounds();
        points.forEach((l) => {
          const pos = { lat: Number(l.latitude), lng: Number(l.longitude) };
          const marker = new g.Marker({ position: pos, map: mapRef.current, title: l.title });
          marker.addListener("click", () => {
            info.setContent(
              `<div dir="rtl" style="font-family:Tajawal,sans-serif;max-width:200px">
                <div style="font-weight:700;color:#0D223D;margin-bottom:4px">${l.title}</div>
                <div style="font-size:12px;color:#6b7280;margin-bottom:6px">${l.area || ""}</div>
                <div style="font-weight:800;color:#D4A017;margin-bottom:6px">${l.price.toLocaleString("ar-EG")} ج/شهر</div>
                <a href="/listing/${l.id}" style="font-size:12px;color:#0D223D;font-weight:700;text-decoration:underline">عرض التفاصيل</a>
              </div>`,
            );
            info.open({ map: mapRef.current, anchor: marker });
          });
          markersRef.current.push(marker);
          bounds.extend(pos);
        });
        if (points.length > 1) mapRef.current.fitBounds(bounds, 60);
        else if (points.length === 1) mapRef.current.setCenter(center);
      })
      .catch(() => {
        /* surfaced as fallback UI below */
      });
    return () => {
      cancelled = true;
    };
  }, [points.map((p) => p.id).join(",")]);

  if (!MAPS_KEY) {
    return (
      <div className="grid h-56 w-full place-items-center rounded-2xl bg-secondary text-xs text-muted-foreground">
        الخريطة غير متاحة حالياً
      </div>
    );
  }
  if (points.length === 0) {
    return (
      <div className="grid h-56 w-full place-items-center rounded-2xl bg-secondary text-xs text-muted-foreground">
        لا توجد عقارات بإحداثيات على الخريطة
      </div>
    );
  }
  return <div ref={mapEl} className="h-64 w-full overflow-hidden rounded-2xl shadow-soft" />;
}
