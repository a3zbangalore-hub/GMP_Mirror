import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __gmpPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error(
      "No Postgres connection string found (expected DATABASE_URL / POSTGRES_URL env var)."
    );
  }

  return new Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=") ? undefined : { rejectUnauthorized: false },
    max: 5,
  });
}

export function getPool(): Pool {
  if (!global.__gmpPgPool) {
    global.__gmpPgPool = createPool();
  }
  return global.__gmpPgPool;
}

export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  const pool = getPool();
  const res = await pool.query(text, params);
  return res.rows as T[];
}
