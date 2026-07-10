import "dotenv/config";
import { z } from "zod";
export declare const envSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodDefault<z.ZodString>;
    REFRESH_TOKEN_SECRET: z.ZodDefault<z.ZodString>;
    PORT: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const env: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    PORT: string;
};
//# sourceMappingURL=env.d.ts.map