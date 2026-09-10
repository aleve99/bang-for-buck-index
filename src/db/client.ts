import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/purehop";

const globalForDb = globalThis as unknown as {
  __purehopSql?: ReturnType<typeof postgres>;
};

// Reuse the connection across hot reloads / serverless invocations.
const client = globalForDb.__purehopSql ?? postgres(connectionString, { max: 5 });
if (process.env.NODE_ENV !== "production") {
  globalForDb.__purehopSql = client;
}

export const db = drizzle(client, { schema });
export { schema };
