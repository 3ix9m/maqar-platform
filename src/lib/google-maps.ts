// Shared Google Maps JS loader for the app (single script tag, single promise)

declare global {
  interface Window {
    google?: any;
    __maqarMapInit?: () => void;
  }
}

const MAPS_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const MAPS_CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

let loaderPromise: Promise<void> | null = null;

export function hasMapsKey() {
  return !!MAPS_KEY;
}

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
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
