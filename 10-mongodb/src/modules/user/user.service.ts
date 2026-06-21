import * as userRepository from "./user.repository";
import type { IUser } from "./user.interface";
import { hashPassword } from "../../shared/utils/hash";

export const createUserService = async (payload: IUser) => {
  const { name, email, password, age } = payload;


  return userRepository.createUserRepository({
    name,
    email,
    password: await hashPassword(password),
    age,
  });
};


export const loginUserService = async (payload: {email: string, password : string}) => {
    const {email, password} = payload

    return userRepository.loginUserRepository(email, password)
}

export const getAllUserService = async () => {
  return userRepository.getAllUserRepository();
};

export const getUserByIdService = async (id: string) => {
  return userRepository.getUserByIdRepository(id);
};

export const updateUserService = async (
  id: string,
  payload: Partial<IUser>,
) => {
  return userRepository.updateUserRepository(id, payload);
};

export const deleteUserService = async (id: string) => {
  return userRepository.deleteUserRepository(id);
};
