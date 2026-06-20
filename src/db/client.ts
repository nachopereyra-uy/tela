import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool(
  process.env.DB_HOST
    ? {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 5432),
        user: process.env.DB_USER ?? "postgres",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME ?? "postgres",
        max: 1,
        ssl: { rejectUnauthorized: false },
      }
    : {
        connectionString: process.env.DATABASE_URL,
        max: 1,
      },
);

export const db = drizzle(pool, { schema });
