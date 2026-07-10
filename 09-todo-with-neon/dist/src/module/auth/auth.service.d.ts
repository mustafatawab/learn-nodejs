import type { RegisterInput, LoginInput, ForgotPasswordInput } from "./auth.schema.js";
export declare const registerUser: (input: RegisterInput) => Promise<any>;
export declare const loginUser: (input: LoginInput) => Promise<{
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
}>;
export declare const getMe: (userId: string) => Promise<any>;
export declare const refreshToken: (token: string) => Promise<{
    newAccessToken: string;
    newRefreshToken: string;
    csrfToken: string;
}>;
export declare const logoutUser: (userId: string) => Promise<void>;
export declare const forgotPassword: (input: ForgotPasswordInput) => Promise<any>;
//# sourceMappingURL=auth.service.d.ts.map