import "dotenv/config";
import { z } from "zod";
export const envSchema = z.object({
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string().default("default_jwt_secret"),
    REFRESH_TOKEN_SECRET: z.string().default("default_refresh_token_secret"),
    PORT: z.string().default("9000"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables", parsed.error.format());
    process.exit(1);
}
export const env = parsed.data;
//# sourceMappingURL=env.js.map