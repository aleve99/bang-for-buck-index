const ADMIN_COOKIE = "purehop_admin";

export { ADMIN_COOKIE };

function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function adminToken(secret = process.env.ADMIN_SECRET ?? ""): Promise<string> {
  const data = new TextEncoder().encode(`purehop-admin:${secret}`);
  return hex(await crypto.subtle.digest("SHA-256", data));
}

export async function isAdminToken(value: string | undefined | null): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !value) return false;
  const expected = await adminToken(secret);
  if (value.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < value.length; i++) {
    mismatch |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
