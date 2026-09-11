"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { beers, priceEntries } from "@/db/schema";
import { ADMIN_COOKIE, adminToken, isAdminToken } from "@/lib/admin-auth";

export interface AdminAuthState {
  ok: boolean;
  message: string;
}

async function requireAdmin() {
  const jar = await cookies();
  if (!(await isAdminToken(jar.get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}

function revalidateBoards(countryCode?: string, style?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/submit");
  if (countryCode) revalidatePath(`/country/${countryCode}`);
  if (style) revalidatePath(`/styles/${encodeURIComponent(style)}`);
}

export async function loginAdmin(
  _prev: AdminAuthState | null,
  formData: FormData,
): Promise<AdminAuthState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin") || "/admin";
  const expected = process.env.ADMIN_SECRET;

  if (!expected || password !== expected) {
    return { ok: false, message: "Invalid admin password." };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await adminToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next.startsWith("/") ? next : "/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function verifyPrice(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const [row] = await db
    .select({
      id: priceEntries.id,
      countryCode: priceEntries.countryCode,
      style: beers.style,
    })
    .from(priceEntries)
    .innerJoin(beers, eq(priceEntries.beerId, beers.id))
    .where(eq(priceEntries.id, id))
    .limit(1);

  if (!row) return;

  await db.update(priceEntries).set({ verified: true }).where(eq(priceEntries.id, id));
  revalidateBoards(row.countryCode, row.style);
}

export async function rejectPrice(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const [row] = await db
    .select({
      id: priceEntries.id,
      countryCode: priceEntries.countryCode,
      style: beers.style,
      verified: priceEntries.verified,
    })
    .from(priceEntries)
    .innerJoin(beers, eq(priceEntries.beerId, beers.id))
    .where(eq(priceEntries.id, id))
    .limit(1);

  if (!row || row.verified) return;

  await db.delete(priceEntries).where(eq(priceEntries.id, id));
  revalidateBoards(row.countryCode, row.style);
}
