import { UserModel } from "./user.model";
import type { IUser } from "./user.interface";
import { AppError } from "../../shared/error/AppError";
import { hashPassword, comparePasswords } from "../../shared/utils/hash";

export const createUserRepository = async (payload: IUser) => {
  const { email } = payload;

  const existingUser = await UserModel.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError("User Email already exists. Try different one", 409);
  }

  return UserModel.create(payload);
};

export const loginUserRepository = async (email: string, password: string) => {
  const existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    throw new AppError("User Email doesn not found", 404);
  }

  const isPasswordMatch = await comparePasswords(
    password,
    existingUser.password,
  );

  if (!isPasswordMatch) {
    throw new AppError("Invalide Password ", 409);
  }

  return existingUser;
};

export const getAllUserRepository = async () => {
  return UserModel.find();
};

export const getUserByIdRepository = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const updateUserRepository = async (
  id: string,
  payload: Partial<IUser>,
) => {
  const user = await UserModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const deleteUserRepository = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return UserModel.findByIdAndDelete(id);
};
