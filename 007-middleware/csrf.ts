import { Request, Response, NextFunction } from "express";
import crypto from "crypto";



const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
const SAFE_PATHS = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/setup-account"
];
export const csrf = (req: Request, res: Response, next: NextFunction) => {

    // Skip Safe Methods
    if (!SAFE_METHODS.includes(req.method)) {
        return next();
    }


    const fullpaths = req.originalUrl.split("?")[0];
    
    if (SAFE_PATHS.includes(fullpaths)){
        return next();
    }


    if (fullpaths.startsWith("/api-docs")){
        return next();
    }


    const headerToken = req.headers["x-csrf-token"] as string;
    const cookieToken = req.cookies["csrf-token"] as string;

    if (!headerToken || !cookieToken) {
        return res.status(403).json({ message: "CSRF token missing" });
    }


    if (!crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))) {
        return res.status(403).json({ message: "Invalid CSRF token" });
    }

    next();


}