import { supabase } from "@/integrations/supabase/client";
import { mapPropertyToListing, type Listing, type PropertyImageRow, type PropertyRatingRow, type PropertyRow } from "@/lib/listings";

// ───────────── Properties ─────────────
export async function fetchListings(): Promise<Listing[]> {
  const [{ data: props, error: e1 }, { data: imgs }, { data: ratings }] = await Promise.all([
    supabase.from("properties").select("*").order("updated_at", { ascending: false }),
    supabase.from("property_images").select("*").order("sort_order", { ascending: true }),
    supabase.from("property_ratings").select("property_id, cleanliness, internet, furniture, quietness"),
  ]);
  if (e1) throw e1;
  const ig = new Map<string, PropertyImageRow[]>();
  (imgs ?? []).forEach((i: any) => {
    const arr = ig.get(i.property_id) ?? [];
    arr.push(i);
    ig.set(i.property_id, arr);
  });
  const rg = new Map<string, PropertyRatingRow[]>();
  (ratings ?? []).forEach((r: any) => {
    const arr = rg.get(r.property_id) ?? [];
    arr.push(r);
    rg.set(r.property_id, arr);
  });
  return (props ?? []).map((p: any) =>
    mapPropertyToListing(p as PropertyRow, ig.get(p.id) ?? [], rg.get(p.id) ?? []),
  );
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const [{ data: p }, { data: imgs }, { data: ratings }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase.from("property_images").select("*").eq("property_id", id).order("sort_order"),
    supabase.from("property_ratings").select("property_id, cleanliness, internet, furniture, quietness").eq("property_id", id),
  ]);
  if (!p) return null;
  return mapPropertyToListing(p as PropertyRow, (imgs as PropertyImageRow[]) ?? [], (ratings as PropertyRatingRow[]) ?? []);
}

export async function createProperty(input: Partial<PropertyRow> & { landlord_id: string; title: string; type: string; price: number }) {
  const { data, error } = await supabase.from("properties").insert(input as any).select().single();
  if (error) throw error;
  return data;
}

export async function updateProperty(id: string, patch: Partial<PropertyRow>) {
  const { error } = await supabase.from("properties").update(patch as any).eq("id", id);
  if (error) throw error;
}

export async function deleteProperty(id: string) {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}

// ───────────── Property Images / Storage ─────────────
export async function uploadPropertyImage(propertyId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${propertyId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("properties").upload(path, file, { upsert: false });
  if (upErr) throw upErr;
  const { data, error } = await supabase
    .from("property_images")
    .insert({ property_id: propertyId, url: path } as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadPropertyImages(propertyId: string, files: File[]) {
  const results = [];
  for (const f of files) results.push(await uploadPropertyImage(propertyId, f));
  return results;
}

export async function listPropertyImages(propertyId: string) {
  const { data, error } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function deletePropertyImage(id: string, path: string) {
  await supabase.storage.from("properties").remove([path]);
  const { error } = await supabase.from("property_images").delete().eq("id", id);
  if (error) throw error;
}


// ───────────── Favorites ─────────────
export async function listFavorites(userId: string) {
  const { data, error } = await supabase.from("favorites").select("property_id").eq("student_id", userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.property_id as string);
}

export async function toggleFavorite(userId: string, propertyId: string, on: boolean) {
  if (on) {
    const { error } = await supabase.from("favorites").insert({ student_id: userId, property_id: propertyId } as any);
    if (error && !String(error.message).includes("duplicate")) throw error;
  } else {
    const { error } = await supabase.from("favorites").delete().eq("student_id", userId).eq("property_id", propertyId);
    if (error) throw error;
  }
}

// ───────────── Viewing requests ─────────────
export async function createViewingRequest(input: {
  student_id: string;
  property_id: string;
  preferred_date?: string;
  preferred_time?: string;
  notes?: string;
}) {
  const { error } = await supabase.from("viewing_requests").insert(input as any);
  if (error) throw error;
}

export async function listMyViewingRequests(userId: string) {
  const { data, error } = await supabase
    .from("viewing_requests")
    .select("*, properties(id, title, area, cover_image)")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAllViewingRequests() {
  const { data, error } = await supabase
    .from("viewing_requests")
    .select("*, properties(title, area), students(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listLandlordViewingRequests(landlordId: string) {
  const { data: props } = await supabase.from("properties").select("id").eq("landlord_id", landlordId);
  const ids = (props ?? []).map((p: any) => p.id);
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("viewing_requests")
    .select("*, properties(title, area)")
    .in("property_id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateViewingStatus(id: string, status: string) {
  const { error } = await supabase.from("viewing_requests").update({ status } as any).eq("id", id);
  if (error) throw error;
}

// ───────────── Housing requests ─────────────
export async function createHousingRequest(input: {
  student_id: string;
  type: string;
  budget?: number | null;
  area?: string | null;
  notes?: string | null;
}) {
  const { error } = await supabase.from("housing_requests").insert(input as any);
  if (error) throw error;
}

export async function listMyHousingRequests(userId: string) {
  const { data, error } = await supabase
    .from("housing_requests")
    .select("*")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ───────────── Ratings ─────────────
export async function submitPropertyRating(input: {
  student_id: string;
  property_id: string;
  cleanliness: number;
  internet: number;
  furniture: number;
  quietness: number;
  comment?: string | null;
}) {
  const { error } = await supabase.from("property_ratings").upsert(input as any, { onConflict: "student_id,property_id" });
  if (error) throw error;
}

export async function submitLandlordRating(input: {
  student_id: string;
  landlord_id: string;
  rating: number;
  comment?: string | null;
}) {
  const { error } = await supabase.from("landlord_ratings").upsert(input as any, { onConflict: "student_id,landlord_id" });
  if (error) throw error;
}

export async function getMyPropertyRating(studentId: string, propertyId: string) {
  const { data } = await supabase
    .from("property_ratings")
    .select("*")
    .eq("student_id", studentId)
    .eq("property_id", propertyId)
    .maybeSingle();
  return data;
}

export async function listAllHousingRequests() {
  const { data, error } = await supabase
    .from("housing_requests")
    .select("*, students(full_name, phone)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateHousingRequestStatus(id: string, status: string) {
  const { error } = await supabase.from("housing_requests").update({ status } as any).eq("id", id);
  if (error) throw error;
}

export async function updateLandlordById(id: string, patch: Partial<{ full_name: string; phone: string; email: string; notes: string }>) {
  const { error } = await supabase.from("landlords").update(patch as any).eq("id", id);
  if (error) throw error;
}

// ───────────── Landlords (admin) ─────────────
export async function listLandlords() {
  const { data, error } = await supabase.from("landlords").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createLandlord(input: { full_name: string; phone: string; email?: string; notes?: string }) {
  const { data, error } = await supabase.from("landlords").insert(input as any).select().single();
  if (error) throw error;
  return data;
}

export async function updateLandlord(id: string, patch: Partial<{ full_name: string; phone: string; email: string; notes: string }>) {
  const { error } = await supabase.from("landlords").update(patch as any).eq("id", id);
  if (error) throw error;
}

export async function deleteLandlord(id: string) {
  const { error } = await supabase.from("landlords").delete().eq("id", id);
  if (error) throw error;
}

// ───────────── Stats ─────────────
export async function fetchAdminStats() {
  const [s, l, p, vr, hr] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("landlords").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("viewing_requests").select("id", { count: "exact", head: true }),
    supabase.from("housing_requests").select("id", { count: "exact", head: true }),
  ]);
  return {
    students: s.count ?? 0,
    landlords: l.count ?? 0,
    properties: p.count ?? 0,
    viewingRequests: vr.count ?? 0,
    housingRequests: hr.count ?? 0,
  };
}

// ───────────── Rentals (verified renters) ─────────────
// The `rentals` table is admin-managed; only verified rented students can
// submit a property/landlord rating. RLS in DB enforces this too.
export async function hasStudentRented(studentId: string, propertyId: string) {
  const { data, error } = await (supabase as any)
    .from("rentals")
    .select("id")
    .eq("student_id", studentId)
    .eq("property_id", propertyId)
    .limit(1)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function listRentals() {
  const { data, error } = await (supabase as any)
    .from("rentals")
    .select("*, properties(title, area), students(full_name), landlords(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createRental(input: {
  student_id: string;
  property_id: string;
  landlord_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
}) {
  const { error } = await (supabase as any).from("rentals").insert(input as any);
  if (error) throw error;
}

export async function deleteRental(id: string) {
  const { error } = await (supabase as any).from("rentals").delete().eq("id", id);
  if (error) throw error;
}

export async function listStudents() {
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name")
    .order("full_name");
  if (error) throw error;
  return data ?? [];
}

// Full student rows for admin user-management
export async function listStudentsFull() {
  const { data, error } = await (supabase as any)
    .from("students")
    .select("id, full_name, phone, university, verified_renter, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setStudentVerified(id: string, verified: boolean) {
  const { error } = await (supabase as any)
    .from("students")
    .update({ verified_renter: verified })
    .eq("id", id);
  if (error) throw error;
}

// Bulk update status for ALL properties (admin quick action)
export async function bulkUpdatePropertyStatus(status: "متاحة" | "محجوزة" | "مؤجرة") {
  const { error } = await supabase
    .from("properties")
    .update({ status } as any)
    .not("id", "is", null);
  if (error) throw error;
}

// Recent activity feed for admin overview
export async function listRecentActivity(limit = 8) {
  const [{ data: v }, { data: h }] = await Promise.all([
    supabase
      .from("viewing_requests")
      .select("id, status, created_at, students(full_name), properties(title)")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("housing_requests")
      .select("id, status, created_at, type, area, students(full_name)")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);
  const items = [
    ...((v ?? []) as any[]).map((r) => ({
      kind: "viewing" as const,
      id: r.id,
      created_at: r.created_at,
      status: r.status,
      title: r.properties?.title ?? "عقار",
      student: r.students?.full_name ?? "طالب",
    })),
    ...((h ?? []) as any[]).map((r) => ({
      kind: "housing" as const,
      id: r.id,
      created_at: r.created_at,
      status: r.status,
      title: `${r.type} • ${r.area || "أي منطقة"}`,
      student: r.students?.full_name ?? "طالب",
    })),
  ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return items.slice(0, limit);
}

