import type { SignOptions } from "jsonwebtoken";
interface TokenPayload {
    userId: string;
    email: string;
}
export declare const generateToken: (payload: TokenPayload, expiresIn: SignOptions["expiresIn"]) => string;
export declare const generateRefreshToken: (payload: TokenPayload, expiresIn: SignOptions["expiresIn"]) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload | null;
export declare const verifyRefreshToken: (token: string) => TokenPayload | null;
export {};
//# sourceMappingURL=jwt.d.ts.map