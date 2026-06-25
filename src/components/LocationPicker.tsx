import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { hasMapsKey, loadGoogleMaps } from "@/lib/google-maps";

interface Props {
  value: { lat: number | null; lng: number | null };
  onChange: (v: { lat: number; lng: number }) => void;
}

const CAIRO = { lat: 30.0444, lng: 31.2357 };

export function LocationPicker({ value, onChange }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!el.current) return;
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !el.current) return;
        const g = window.google.maps;
        const init = value.lat != null && value.lng != null
          ? { lat: Number(value.lat), lng: Number(value.lng) }
          : CAIRO;
        const map = new g.Map(el.current, {
          center: init,
          zoom: value.lat != null ? 15 : 12,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        });
        const marker = new g.Marker({
          position: init,
          map,
          draggable: true,
        });
        if (value.lat == null) marker.setMap(null);
        map.addListener("click", (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          marker.setPosition({ lat, lng });
          marker.setMap(map);
          onChange({ lat, lng });
        });
        marker.addListener("dragend", () => {
          const p = marker.getPosition();
          onChange({ lat: p.lat(), lng: p.lng() });
        });
        mapRef.current = map;
        markerRef.current = marker;
        setReady(true);
      })
      .catch((e) => setError(e.message || "تعذّر تحميل الخريطة"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep marker in sync if value changes from outside (e.g. typed inputs)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (value.lat == null || value.lng == null) return;
    const pos = { lat: Number(value.lat), lng: Number(value.lng) };
    markerRef.current.setPosition(pos);
    markerRef.current.setMap(mapRef.current);
    mapRef.current.panTo(pos);
  }, [value.lat, value.lng]);

  if (!hasMapsKey()) {
    return (
      <div className="grid h-48 w-full place-items-center rounded-xl bg-secondary text-xs text-muted-foreground">
        الخريطة غير متاحة حالياً
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin size={11} className="text-gold" /> اضغط على الخريطة لتحديد الموقع</span>
        {value.lat != null && value.lng != null && (
          <span className="font-mono">{Number(value.lat).toFixed(4)}, {Number(value.lng).toFixed(4)}</span>
        )}
      </div>
      <div className="relative">
        <div ref={el} className="h-56 w-full overflow-hidden rounded-xl border border-border" />
        {!ready && !error && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-secondary/70 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-secondary text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
