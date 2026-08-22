"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import axiosHandler from "../lib/enhanced-axios";

type UserRole = "Owner" | "Admin" | "RM" | "Trainer" | "Student" | "Accountant";

export interface TokenPayload {
    user_id: string;
    role: UserRole;
    branch_id?: string;
    iat?: number;
    exp?: number;
}

export interface StandardResponse<T = unknown> {
    success: boolean;
    message: string | null;
    data: T | null;
}

export interface LoginResponseData {
    token: string;
    role: UserRole;
    userId: string;
    branchId?: string;
}

export interface PasswordLoginPayload {
    password: string;
    email?: string;
    callingCode?: string;
    phoneNumber?: string;
}

export interface PhoneOtpPayload {
    callingCode: string;
    phoneNumber: string;
}

export interface PhoneOtpLoginPayload extends PhoneOtpPayload {
    otp: string;
}

export interface EmailOtpPayload {
    email: string;
}

export interface EmailOtpLoginPayload extends EmailOtpPayload {
    otp: string;
}

interface AuthContextType {
    token: string | null;
    user: TokenPayload | null;
    isAuthenticated: boolean;
    passwordLogin: (
        data: PasswordLoginPayload
    ) => Promise<StandardResponse<LoginResponseData>>;
    sendPhoneOtp: (
        data: PhoneOtpPayload
    ) => Promise<StandardResponse<null>>;
    loginWithPhoneOtp: (
        data: PhoneOtpLoginPayload
    ) => Promise<StandardResponse<LoginResponseData>>;
    sendEmailOtp: (
        data: EmailOtpPayload
    ) => Promise<StandardResponse<null>>;
    loginWithEmailOtp: (
        data: EmailOtpLoginPayload
    ) => Promise<StandardResponse<LoginResponseData>>;
    logout: () => void;
}

const AUTH_COOKIE = "authToken";
// 60 days, aligned with the API-issued JWT expiry (1440h ≈ 60d).
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 60;

const AuthContext = createContext<AuthContextType | null>(null);

function decodeToken(token: string): TokenPayload | null {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(atob(normalized));
        return decoded as TokenPayload;
    } catch {
        return null;
    }
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
}

function setAuthCookie(token: string) {
    if (typeof document === "undefined") return;
    const secure =
        typeof window !== "undefined" && window.location.protocol === "https:"
            ? "; secure"
            : "";
    document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(
        token
    )}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

function clearAuthCookie() {
    if (typeof document === "undefined") return;
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

// Pub/sub so useSyncExternalStore re-renders when the cookie changes in this tab.
const authListeners = new Set<() => void>();

function subscribeToAuthToken(listener: () => void) {
    authListeners.add(listener);
    const onStorage = () => listener();
    if (typeof window !== "undefined") {
        window.addEventListener("storage", onStorage);
    }
    return () => {
        authListeners.delete(listener);
        if (typeof window !== "undefined") {
            window.removeEventListener("storage", onStorage);
        }
    };
}

function notifyAuthChange() {
    authListeners.forEach((l) => l());
}

function getAuthToken() {
    return getCookie(AUTH_COOKIE);
}

async function request<T>(
    path: string,
    body: unknown,
    token?: string | null
): Promise<StandardResponse<T>> {
    try {
        const data = (await axiosHandler({
            path,
            method: "POST",
            body: body as object,
            token: token ?? undefined,
        })) as T;
        return { success: true, message: null, data };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Request failed";
        return { success: false, message, data: null };
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const token = useSyncExternalStore(
        subscribeToAuthToken,
        getAuthToken,
        () => null
    );
    const user = useMemo(() => (token ? decodeToken(token) : null), [token]);

    const applyLoginResponse = useCallback(
        (response: StandardResponse<LoginResponseData>) => {
            if (response.success && response.data?.token) {
                setAuthCookie(response.data.token);
                notifyAuthChange();
            }
            return response;
        },
        []
    );

    const passwordLogin = useCallback(
        async (data: PasswordLoginPayload) => {
            const response = await request<LoginResponseData>(
                "/api/v1/auth/password-login",
                data
            );
            return applyLoginResponse(response);
        },
        [applyLoginResponse]
    );

    const sendPhoneOtp = useCallback(
        (data: PhoneOtpPayload) =>
            request<null>("/api/v1/auth/send-phone-otp", data),
        []
    );

    const loginWithPhoneOtp = useCallback(
        async (data: PhoneOtpLoginPayload) => {
            const response = await request<LoginResponseData>(
                "/api/v1/auth/login-with-otp",
                data
            );
            return applyLoginResponse(response);
        },
        [applyLoginResponse]
    );

    const sendEmailOtp = useCallback(
        (data: EmailOtpPayload) =>
            request<null>("/api/v1/auth/send-email-otp", data),
        []
    );

    const loginWithEmailOtp = useCallback(
        async (data: EmailOtpLoginPayload) => {
            const response = await request<LoginResponseData>(
                "/api/v1/auth/login-with-email-otp",
                data
            );
            return applyLoginResponse(response);
        },
        [applyLoginResponse]
    );

    const logout = useCallback(() => {
        clearAuthCookie();
        notifyAuthChange();
        router.push("/auth/login");
    }, [router]);

    const value = useMemo<AuthContextType>(
        () => ({
            token,
            user,
            isAuthenticated: Boolean(token && user),
            passwordLogin,
            sendPhoneOtp,
            loginWithPhoneOtp,
            sendEmailOtp,
            loginWithEmailOtp,
            logout,
        }),
        [
            token,
            user,
            passwordLogin,
            sendPhoneOtp,
            loginWithPhoneOtp,
            sendEmailOtp,
            loginWithEmailOtp,
            logout,
        ]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
