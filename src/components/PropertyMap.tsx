import { useEffect, useRef, useState } from "react";
import { MapPin, Maximize2, Navigation, Search, X, Loader2 } from "lucide-react";
import type { Listing } from "@/lib/listings";
import { hasMapsKey, loadGoogleMaps } from "@/lib/google-maps";

// Premium "Maqar" map style — soft navy water, muted land, hidden POIs,
// gold-tinted roads. Tuned to match the brand palette (#0D223D / #D4A017).
const MAQAR_MAP_STYLE: any[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f6fa" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5b6478" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#d9dce4" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#0D223D" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e3ecdf" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e6e8ee" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fff3d6" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e6c989" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#8a6a1f" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#bcd4e6" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#0D223D" }] },
];

function pinIcon(g: any, opts: { label?: string; highlighted?: boolean } = {}) {
  const fill = opts.highlighted ? "#D4A017" : "#0D223D";
  const stroke = "#ffffff";
  const svg = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
    <defs><filter id="s" x="-50%" y="-20%" width="200%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0D223D" flood-opacity="0.35"/></filter></defs>
    <path filter="url(#s)" d="M22 2c10.5 0 19 8.3 19 18.6 0 13.6-19 33.4-19 33.4S3 34.2 3 20.6C3 10.3 11.5 2 22 2z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
    <circle cx="22" cy="20" r="8" fill="${stroke}"/>
    ${opts.label ? `<text x="22" y="24" text-anchor="middle" font-family="Tajawal, sans-serif" font-size="11" font-weight="800" fill="${fill}">${opts.label}</text>` : ""}
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new g.Size(36, 46),
    anchor: new g.Point(18, 46),
  };
}

function MapShell({
  children,
  loading,
  lat,
  lng,
  height = "h-64",
}: {
  children: React.ReactNode;
  loading: boolean;
  lat?: number;
  lng?: number;
  height?: string;
}) {
  return (
    <div className={`group relative w-full overflow-hidden rounded-2xl shadow-card ring-1 ring-border ${height}`}>
      {children}
      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-secondary/60">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-[11px] font-bold text-primary shadow-soft">
            <MapPin size={12} className="animate-pulse text-gold" /> جاري تحميل الخريطة…
          </span>
        </div>
      )}
      {/* Subtle brand frame */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/5" />
      {/* Bottom gradient for label legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent" />
      {lat != null && lng != null && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[11px] font-bold text-primary shadow-soft backdrop-blur transition hover:bg-card hover:scale-105"
        >
          <Navigation size={12} className="text-gold" /> الاتجاهات
        </a>
      )}
    </div>
  );
}

function MapSearchBox({ mapRef, markerRef }: { mapRef: React.MutableRefObject<any>; markerRef: React.MutableRefObject<any> }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Array<{ id: string; main: string; secondary: string }>>([]);
  const tokenRef = useRef<any>(null);
  const tRef = useRef<any>(null);

  async function ensureToken() {
    if (tokenRef.current) return tokenRef.current;
    const places: any = await window.google.maps.importLibrary("places");
    tokenRef.current = new places.AutocompleteSessionToken();
    return tokenRef.current;
  }

  function onChange(v: string) {
    setQ(v);
    setOpen(true);
    if (tRef.current) clearTimeout(tRef.current);
    if (!v.trim()) { setItems([]); return; }
    tRef.current = setTimeout(async () => {
      try {
        setBusy(true);
        const places: any = await window.google.maps.importLibrary("places");
        const sessionToken = await ensureToken();
        const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: v,
          sessionToken,
          includedRegionCodes: ["eg"],
          language: "ar",
        });
        const mapped = (suggestions || [])
          .map((s: any) => s.placePrediction)
          .filter(Boolean)
          .slice(0, 6)
          .map((p: any) => ({
            id: p.placeId,
            main: p.mainText?.toString?.() || p.text?.toString?.() || "",
            secondary: p.secondaryText?.toString?.() || "",
          }));
        setItems(mapped);
      } catch {
        setItems([]);
      } finally {
        setBusy(false);
      }
    }, 220);
  }

  async function pick(it: { id: string; main: string; secondary: string }) {
    try {
      setBusy(true);
      const places: any = await window.google.maps.importLibrary("places");
      const place = new places.Place({ id: it.id });
      await place.fetchFields({ fields: ["location", "viewport", "displayName"] });
      const loc = place.location;
      if (!loc || !mapRef.current) return;
      const g = window.google.maps;
      if (place.viewport) mapRef.current.fitBounds(place.viewport);
      else { mapRef.current.setCenter(loc); mapRef.current.setZoom(15); }
      if (markerRef.current) markerRef.current.setMap(null);
      const svg = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56"><path d="M22 2c10.5 0 19 8.3 19 18.6 0 13.6-19 33.4-19 33.4S3 34.2 3 20.6C3 10.3 11.5 2 22 2z" fill="#D4A017" stroke="#fff" stroke-width="2.5"/><circle cx="22" cy="20" r="6" fill="#fff"/></svg>`;
      markerRef.current = new g.Marker({
        position: loc,
        map: mapRef.current,
        title: it.main,
        icon: { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, scaledSize: new g.Size(40, 50), anchor: new g.Point(20, 50) },
        animation: g.Animation.DROP,
      });
      setQ(it.main);
      setOpen(false);
      tokenRef.current = null; // end session
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setQ(""); setItems([]); setOpen(false);
    if (markerRef.current) { markerRef.current.setMap(null); markerRef.current = null; }
  }

  return (
    <div className="absolute inset-x-3 top-3 z-10" dir="rtl">
      <div className="flex items-center gap-2 rounded-full bg-card/95 px-3 py-2 shadow-card ring-1 ring-border backdrop-blur">
        {busy ? <Loader2 size={15} className="animate-spin text-gold" /> : <Search size={15} className="text-gold" />}
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => q && setOpen(true)}
          placeholder="ابحث عن عنوان أو منطقة أو جامعة…"
          className="flex-1 bg-transparent text-[12px] font-medium text-primary outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button type="button" onClick={clear} aria-label="مسح" className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary">
            <X size={13} />
          </button>
        )}
      </div>
      {open && items.length > 0 && (
        <ul className="mt-2 max-h-64 overflow-auto rounded-2xl bg-card shadow-card ring-1 ring-border">
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => pick(it)}
                className="flex w-full items-start gap-2 border-b border-border/60 px-3 py-2 text-right last:border-b-0 hover:bg-secondary/60"
              >
                <MapPin size={13} className="mt-0.5 shrink-0 text-gold" />
                <span className="flex-1">
                  <span className="block text-[12px] font-bold text-primary">{it.main}</span>
                  {it.secondary && <span className="block text-[10px] text-muted-foreground">{it.secondary}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PropertyMap({ listings }: { listings: Listing[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const searchMarkerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  const points = listings.filter((l) => l.latitude != null && l.longitude != null);

  useEffect(() => {
    let cancelled = false;
    if (!mapEl.current) return;
    setLoading(true);
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapEl.current) return;
        const g = window.google.maps;
        // Default view: الكوامل — سوهاج
        const AL_KAWAMEL = { lat: 26.6062, lng: 31.7461 };
        const center = points.length
          ? { lat: Number(points[0].latitude), lng: Number(points[0].longitude) }
          : AL_KAWAMEL;
        mapRef.current ||= new g.Map(mapEl.current, {
          center,
          zoom: points.length ? 13 : 14,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          backgroundColor: "#f5f6fa",
          styles: MAQAR_MAP_STYLE,
        });
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        const info = new g.InfoWindow();
        const bounds = new g.LatLngBounds();
        points.forEach((l) => {
          const pos = { lat: Number(l.latitude), lng: Number(l.longitude) };
          const marker = new g.Marker({
            position: pos,
            map: mapRef.current,
            title: l.title,
            icon: pinIcon(g),
            animation: g.Animation.DROP,
          });
          marker.addListener("mouseover", () => marker.setIcon(pinIcon(g, { highlighted: true })));
          marker.addListener("mouseout", () => marker.setIcon(pinIcon(g)));
          marker.addListener("click", () => {
            info.setContent(
              `<div dir="rtl" style="font-family:Tajawal,sans-serif;max-width:220px;padding:2px 4px">
                <div style="font-weight:800;color:#0D223D;margin-bottom:4px;font-size:13px;line-height:1.3">${l.title}</div>
                <div style="font-size:11px;color:#6b7280;margin-bottom:8px;display:flex;align-items:center;gap:4px">📍 ${l.area || ""}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
                  <span style="font-weight:800;color:#D4A017;font-size:14px">${l.price.toLocaleString("ar-EG")} <span style="font-size:10px;color:#6b7280;font-weight:500">ج/شهر</span></span>
                </div>
                <a href="/listing/${l.id}" style="display:inline-block;background:#0D223D;color:#fff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:999px;text-decoration:none">عرض التفاصيل ›</a>
              </div>`,
            );
            info.open({ map: mapRef.current, anchor: marker });
          });
          markersRef.current.push(marker);
          bounds.extend(pos);
        });
        if (points.length > 1) mapRef.current.fitBounds(bounds, 60);
        else if (points.length === 1) mapRef.current.setCenter(center);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [points.map((p) => p.id).join(",")]);

  if (!hasMapsKey()) {
    return (
      <div className="grid h-64 w-full place-items-center rounded-2xl bg-secondary text-xs text-muted-foreground">
        الخريطة غير متاحة حالياً
      </div>
    );
  }
  return (
    <MapShell loading={loading} height="h-80">
      <div ref={mapEl} className="h-full w-full" />
      <MapSearchBox mapRef={mapRef} markerRef={searchMarkerRef} />
      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold text-primary shadow-soft backdrop-blur">
        <MapPin size={11} className="text-gold" /> {points.length} عقار
      </span>
    </MapShell>
  );
}

export function SingleLocationMap({ lat, lng, title }: { lat: number; lng: number; title?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!el.current) return;
    setLoading(true);
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
          gestureHandling: "cooperative",
          backgroundColor: "#f5f6fa",
          styles: MAQAR_MAP_STYLE,
        });
        new g.Marker({
          position: pos,
          map,
          title,
          icon: pinIcon(g, { highlighted: true }),
          animation: g.Animation.DROP,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [lat, lng, title]);

  if (!hasMapsKey()) {
    return (
      <div className="grid h-56 w-full place-items-center rounded-2xl bg-secondary text-xs text-muted-foreground">
        الخريطة غير متاحة
      </div>
    );
  }
  return (
    <MapShell loading={loading} lat={lat} lng={lng} height="h-56">
      <div ref={el} className="h-full w-full" />
      <a
        href={`https://www.google.com/maps/@${lat},${lng},17z`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/95 text-primary shadow-soft backdrop-blur transition hover:bg-card hover:scale-105"
        aria-label="فتح في خرائط جوجل"
      >
        <Maximize2 size={14} />
      </a>
    </MapShell>
  );
}
