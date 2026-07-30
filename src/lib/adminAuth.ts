import { timingSafeEqual } from "crypto";

export function isAuthorizedAdmin(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false; // fail closed if not configured

  const url = new URL(req.url);
  const provided = req.headers.get("x-admin-token") ?? url.searchParams.get("token") ?? "";

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
