import { AppError } from "../../shared/error/AppError";
import { prisma } from "../../shared/lib/prisma";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.schema";
import { hashPassword, comparePasswords } from "../../shared/utils/hash";
import {
  generateToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../shared/utils/jwt";

export const registerUser = async (input: RegisterInput) => {
  console.log("registering user");
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser)
    throw new AppError("User with this email already exists", 400);

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      gender: input.gender,
    },
  });

  return user;
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) throw new AppError("Invalid email. Check your email first", 401);

  const isPasswordValid = await comparePasswords(input.password, user.password);

  if (!isPasswordValid) throw new AppError("Invalid  password", 401);

  const payload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateToken(payload, "15m");

  const refreshToken = generateRefreshToken(payload, "7d");

  return {
    accessToken,
    refreshToken,
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user) throw new AppError("User not found ", 404);

  const { password, ...withOutPassword } = user;

  return withOutPassword;
};

export const forgotPassword = async (input: ForgotPasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user)
    throw new AppError(`User with ${input.email} does not exists `, 404);

  return user;
};
