// Centralized WhatsApp contact helper for مَقَر.
// All "Contact"/"Inquire" buttons across the app route through this so the
// destination number and message format stay consistent.

export const MAQAR_WHATSAPP_NUMBER = "201095346393";

/**
 * Build a wa.me URL pre-filled with an English inquiry line, exactly as
 * requested by the product owner. The Arabic property title is appended
 * inside the brackets so the team can identify the property immediately.
 */
export function buildWhatsAppUrl(propertyTitle: string, extra?: string) {
  const safeTitle = (propertyTitle || "مَقَر").trim();
  const lines = [`Hello, I am interested in property: [${safeTitle}]`];
  if (extra) lines.push(extra);
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${MAQAR_WHATSAPP_NUMBER}?text=${text}`;
}

export function openWhatsApp(propertyTitle: string, extra?: string) {
  const url = buildWhatsAppUrl(propertyTitle, extra);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
