import type { Request, Response, NextFunction } from "express";



export const authMiddleware = async (req : Request, res: Response, next: NextFunction) => {
    try {
        
    } catch (error) {
        next(error)
    }
}