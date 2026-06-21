import { UserModel } from "./user.model";
import type { IUser } from "./user.interface";

export const createUserRepository = async (payload: IUser) => {
  return UserModel.create(payload);
};

export const getAllUserRepository = async () => {
  return UserModel.find();
};

export const getUserByIdRepository = async (id: string) => {
  return UserModel.findById(id);
};

export const updateUserRepository = async (
  id: string,
  payload: Partial<IUser>,
) => {
  return UserModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
};


export const deleteUserRepository = async (id: string) => {
    return UserModel.findByIdAndDelete(id)
} 


