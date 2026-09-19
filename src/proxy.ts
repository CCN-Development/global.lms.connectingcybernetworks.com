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

/** Next.js flight/RSC data request: `RSC: 1` header, or the `_rsc` cache-busting query param. */
function isRscRequest(request: NextRequest) {
    return (
        request.headers.get("rsc") === "1" ||
        request.nextUrl.searchParams.has("_rsc")
    );
}

function isPrefetchRequest(request: NextRequest) {
    return (
        request.headers.get("next-router-prefetch") === "1" ||
        request.headers.get("purpose") === "prefetch"
    );
}

/**
 * Redirects without leaking `_rsc` into the destination. Prefetches are answered with
 * an empty 204 instead, so the router never caches a redirect for the link.
 */
function redirectTo(path: string, request: NextRequest) {
    if (isRscRequest(request) && isPrefetchRequest(request)) {
        return new NextResponse(null, { status: 204 });
    }

    const url = new URL(path, request.nextUrl);
    url.search = "";
    return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Never touch Next internals / static assets, even if a matcher change lets them through.
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get("authToken")?.value;
    if (!token) {
        if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
            return NextResponse.next();
        }
        return redirectTo("/auth/login", request);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
            return NextResponse.next();
        }
        return redirectTo("/auth/login", request);
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret)
        );
        const decoded = payload as unknown as TokenPayload;
        const rolePath = ROLE_PATH_MAP[decoded.role];

        if (!rolePath) {
            return redirectTo("/auth/login", request);
        }
        if (pathname === "/") {
            return redirectTo(rolePath + "/overview", request);
        }
        if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
            return redirectTo(rolePath + "/overview", request);
        }

        // If user is already on their role's path, let them through
        if (pathname.startsWith(rolePath)) {
            return NextResponse.next();
        }
        if (pathname.startsWith("/dashboard/chats")) {
            return NextResponse.next();
        }
        if (pathname.startsWith("/dashboard/meet")) {
            return NextResponse.next();
        }

        // Redirect to their role's dashboard
        return redirectTo(rolePath + "/overview", request);
    } catch (error) {
        console.log("Invalid token or verification failed.", error);
        return redirectTo("/auth/login", request);
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/login", "/auth/register", "/"],
};
