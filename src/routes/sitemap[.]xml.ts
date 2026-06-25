import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://maqar.lovable.app";

const STATIC_PATHS: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/search", changefreq: "daily", priority: "0.9" },
  { path: "/compare", changefreq: "weekly", priority: "0.6" },
  { path: "/help", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        let listings: { id: string; updated_at: string }[] = [];
        if (url && key) {
          try {
            const supabase = createClient(url, key, {
              auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
            });
            const { data } = await supabase
              .from("properties")
              .select("id, updated_at")
              .order("updated_at", { ascending: false })
              .limit(2000);
            listings = (data as any[]) ?? [];
          } catch {
            listings = [];
          }
        }

        const today = new Date().toISOString().slice(0, 10);
        const urlBlocks = [
          ...STATIC_PATHS.map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          ),
          ...listings.map((l) => {
            const lastmod = (l.updated_at ?? "").slice(0, 10) || today;
            return `  <url>\n    <loc>${BASE_URL}/listing/${l.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
          }),
        ];

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlBlocks.join("\n")}\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
