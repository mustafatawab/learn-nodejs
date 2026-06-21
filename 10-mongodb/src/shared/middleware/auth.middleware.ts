import type { Request, Response, NextFunction } from "express";



export const authMiddleware = async (req : Request, res: Response, next: NextFunction) => {
    try {
       const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("You are not logged in. Please provide a token.", 401);
    }

    // 2. Extract the actual token from the string ("Bearer <TOKEN>")
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Authentication token is missing.", 401);
    }

    // 3. Verify the token token using your environment secret
    const jwtSecret = process.env.JWT_SECRET || "your_fallback_super_secret_key";
    
    const decoded = jwt.verify(token, jwtSecret) as Express.Request["user"];

    // 4. Attach the decoded user payload to the request object
    // This allows downstream Controllers to read `req.user.id` or `req.user.role`
    req.user = decoded;

    // 5. Let the request move forward to the next middleware or Controller
    next(); 
    } catch (error) {
        next(error)
    }
}
