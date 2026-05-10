import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

// Use prepare: false for Supabase Transaction Mode (Port 6543)
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
