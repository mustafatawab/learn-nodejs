import * as userRepository from "./user.repository"
import type { IUser } from "./user.interface"


export const createUserService = async (payload: IUser) => {
    return userRepository.createUserRepository(payload)
}


export const getAllUserService = async () => {
    return userRepository.getAllUserRepository()
}

export const getUserByIdService = async (id: string) => {
    return userRepository.getUserByIdRepository(id)
}



export const updateUserService = async (id: string, payload : Partial<IUser>) => {
    return userRepository.updateUserRepository(id, payload)
}


export const deleteUserService = async ( id: string) => {
    return userRepository.deleteUserRepository(id)
}

