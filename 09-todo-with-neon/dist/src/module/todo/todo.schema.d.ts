import { z } from "zod";
export declare const todoCreateSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    completed: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const todoUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    completed: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type TodoCreateInput = z.infer<typeof todoCreateSchema>;
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>;
//# sourceMappingURL=todo.schema.d.ts.map