import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

export const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_L8eUX5DKxHny@ep-long-bonus-abfda16r-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
export const db = drizzle({ client: pool, schema });