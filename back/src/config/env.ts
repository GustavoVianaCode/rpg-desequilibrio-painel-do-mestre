import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3333").transform((val) => parseInt(val, 10)),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  SUPABASE_URL: z.string().url("SUPABASE_URL is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

export const env = envSchema.parse(process.env);
