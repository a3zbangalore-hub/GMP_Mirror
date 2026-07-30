import { NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { getPool } from "@/lib/db/client";
import { SCHEMA_SQL } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/**
 * One-time/idempotent schema setup, gated by ADMIN_TOKEN. Lets the schema be
 * applied to the production database without anyone needing direct DB
 * credentials — the SQL is all `CREATE ... IF NOT EXISTS`, safe to re-run.
 */
export async function POST(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pool = getPool();
  await pool.query(SCHEMA_SQL);

  return NextResponse.json({ ok: true });
}
