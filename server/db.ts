import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use Supabase database connection
const SUPABASE_DB_URL = "postgresql://postgres:TfrG7xMSKPQU84hJUOwvLDFJOXLjMjdj@db.qdjscrevewcuqotkzcrm.supabase.co:5432/postgres";

export const pool = new Pool({ connectionString: SUPABASE_DB_URL });
export const db = drizzle({ client: pool, schema });
