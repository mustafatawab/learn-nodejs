import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const generateToken = (payload, expiresIn) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn,
    });
};
export const generateRefreshToken = (payload, expiresIn) => {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
        expiresIn,
    });
};
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
//# sourceMappingURL=jwt.js.map