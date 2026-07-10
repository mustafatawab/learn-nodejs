import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js"

interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (
  payload: TokenPayload,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
  });
};



export const generateRefreshToken = (
  payload: TokenPayload,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn,
  });
};


export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as TokenPayload
    } catch (error) {
        return null
    }
}

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload
    } catch (error) {
        return null
    }
}

