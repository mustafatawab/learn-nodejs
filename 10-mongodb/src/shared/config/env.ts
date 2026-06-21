import "dotenv/config";

import { z } from "zod";

export const envSchema = z.object({
  MONGODB_URI: z.string().min(2, "MongoDB URL is missing in .env file"),
  PORT: z.number().default(5000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed) {
  console.error("Invalid Environment Variables ", parsed);
  process.exit(1);
}

export const env = parsed.data;
