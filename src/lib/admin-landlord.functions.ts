import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createLandlordAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    notes?: string;
  }) => {
    if (!data?.email || !data?.password || !data?.full_name || !data?.phone) {
      throw new Error("جميع الحقول مطلوبة");
    }
    if (data.password.length < 8) {
      throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    // Verify caller is admin
    const { data: roleRow, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr || !roleRow) {
      throw new Error("غير مصرح: هذه العملية للأدمن فقط");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Create auth user (email confirmed so they can sign in immediately)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, phone: data.phone, role: "landlord" },
    });
    if (createErr || !created?.user) {
      throw new Error(createErr?.message ?? "فشل إنشاء الحساب");
    }
    const newUserId = created.user.id;

    try {
      // The handle_new_user trigger inserts a 'student' row by default — remove it
      // and the auto-assigned student role so this user is purely a landlord.
      await supabaseAdmin.from("students").delete().eq("id", newUserId);
      await supabaseAdmin.from("user_roles").delete().eq("user_id", newUserId).eq("role", "student");

      // Assign landlord role
      const { error: roleInsErr } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: newUserId, role: "landlord" });
      if (roleInsErr) throw roleInsErr;

      // Create landlord profile row linked to the auth user
      const { data: landlord, error: lErr } = await supabaseAdmin
        .from("landlords")
        .insert({
          user_id: newUserId,
          full_name: data.full_name,
          phone: data.phone,
          email: data.email,
          notes: data.notes ?? null,
        })
        .select()
        .single();
      if (lErr) throw lErr;

      return { ok: true as const, landlord_id: landlord.id, user_id: newUserId };
    } catch (e: any) {
      // Rollback the auth user if anything below failed
      await supabaseAdmin.auth.admin.deleteUser(newUserId).catch(() => {});
      throw new Error(e?.message ?? "فشل إعداد حساب المالك");
    }
  });
