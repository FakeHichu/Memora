import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(path.dirname(new URL(import.meta.url).pathname), '../.env') });
export const env = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:8081',
};