import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_PROVIDER: z.enum(['postgresql', 'sqlite']).default('postgresql'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

const { PORT, DATABASE_URL, DATABASE_PROVIDER, CORS_ORIGINS } = parsed.data;

export const env = {
  port: Number(PORT) || 4000,
  databaseUrl: DATABASE_URL,
  databaseProvider: DATABASE_PROVIDER,
  corsOrigins: CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
};
