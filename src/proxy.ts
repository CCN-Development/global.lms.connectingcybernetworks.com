import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

type UserRole = "Owner" | "Admin" | "RM" | "Trainer" | "Student" | "Accountant";

interface TokenPayload {
    user_id: string;
    role: UserRole;
    branch_id?: string;
    iat?: number;
    exp?: number;
}

const ROLE_PATH_MAP: Record<UserRole, string> = {
    Owner: "/dashboard/owner",
    Admin: "/dashboard/admin",
    RM: "/dashboard/rm",
    Trainer: "/dashboard/trainer",
    Student: "/dashboard/student",
    Accountant: "/dashboard/accountants",
};

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log("Middleware triggered for path:", pathname);
    const token = request.cookies.get("authToken")?.value;
    console.log("Auth token from cookies:", token);
    if (!token) {
        if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const secret = process.env.JWT_SECRET;
    console.log("JWT secret from environment:", secret);
    if (!secret) {
        if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret)
        );
        console.log("Decoded JWT payload:", payload);
        const decoded = payload as unknown as TokenPayload;
        console.log("Decoded user:", decoded);
        const rolePath = ROLE_PATH_MAP[decoded.role];

        if (!rolePath) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        if (pathname === "/") {
            return NextResponse.redirect(new URL(rolePath + "/overview", request.url));
        }
        if(pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
            return NextResponse.redirect(new URL(rolePath + "/overview", request.url));
        }
        
        // If user is already on their role's path, let them through
        if (pathname.startsWith(rolePath)) {
            return NextResponse.next();
        }

        // Redirect to their role's dashboard
        return NextResponse.redirect(new URL(rolePath + "/overview", request.url));
    } catch (error) {
        // Invalid token
        console.log("Invalid token or verification failed.", error);
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/login", "/auth/register", "/"],
};
