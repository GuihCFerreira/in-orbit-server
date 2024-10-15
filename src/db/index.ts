import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const client = postgres(
  "postgresql://neondb_owner:kPe4ZASo7DyH@ep-dark-bar-a50u44dy.us-east-2.aws.neon.tech/neondb?sslmode=require"
);
export const db = drizzle(client, { schema, logger: true });
