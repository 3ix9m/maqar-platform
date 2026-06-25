import { useEffect, useRef } from "react";
import type { Listing } from "@/lib/listings";
import { hasMapsKey, loadGoogleMaps } from "@/lib/google-maps";

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
          : { lat: 30.0444, lng: 31.2357 };
        mapRef.current ||= new g.Map(mapEl.current, {
          center,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
        });
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
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [points.map((p) => p.id).join(",")]);

  if (!hasMapsKey()) {
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

export function SingleLocationMap({ lat, lng, title }: { lat: number; lng: number; title?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    if (!el.current) return;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !el.current) return;
        const g = window.google.maps;
        const pos = { lat: Number(lat), lng: Number(lng) };
        const map = new g.Map(el.current, {
          center: pos,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        });
        new g.Marker({ position: pos, map, title });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [lat, lng, title]);

  if (!hasMapsKey()) {
    return (
      <div className="grid h-48 w-full place-items-center rounded-2xl bg-secondary text-xs text-muted-foreground">
        الخريطة غير متاحة
      </div>
    );
  }
  return <div ref={el} className="h-48 w-full overflow-hidden rounded-2xl border border-border" />;
}
