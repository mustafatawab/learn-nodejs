import type { Request, Response, NextFunction } from "express";
export declare const generateCsrfToken: () => string;
export declare const csrfMiddleware: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=csrf.middleware.d.ts.map