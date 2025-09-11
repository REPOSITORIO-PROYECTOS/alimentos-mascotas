import { NextRequest, NextResponse } from "next/server";

// Definir las rutas protegidas para cada rol
const adminRoutes = ["/admin"];
const clientRoutes = ["/checkout"];
const authRoutes = ["/login", "/register"];

// Decodifica el payload de un JWT sin verificar la firma (solo para leer exp/roles)
function decodeJWT(token: string) {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function normalizeRole(raw: any) {
    if (!raw) return "";
    // Accept arrays like ['ROLE_ADMIN']
    if (Array.isArray(raw) && raw.length > 0) raw = raw[0];
    const r = String(raw).toLowerCase();
    if (r.includes("admin") || r === "is_staff" || r === "is_superuser") return "ROLE_ADMIN";
    if (r.includes("client") || r.includes("user") || r.includes("customer")) return "ROLE_CLIENT";
    return String(raw).toUpperCase();
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const authStorageValue = request.cookies.get("auth-storage")?.value;
    const directJwtToken = request.cookies.get("token")?.value;
    const directUserRoleCookie = request.cookies.get("role")?.value;

    let user: any = null;
    let isAuthenticated = false;
    let userRole = "";

    // Try auth-storage first (rehydrated Zustand)
    if (authStorageValue) {
        try {
            const authData = JSON.parse(decodeURIComponent(authStorageValue));
            user = authData?.state?.user ?? null;
            isAuthenticated = !!authData?.state?.isAuthenticated;
            if (user?.roles && Array.isArray(user.roles) && user.roles.length > 0) {
                userRole = normalizeRole(user.roles[0]);
            }
            if (user?.token) {
                const decoded = decodeJWT(user.token);
                const now = Math.floor(Date.now() / 1000);
                if (!decoded || (decoded.exp && decoded.exp < now)) {
                    // expired
                    isAuthenticated = false;
                    user = null;
                    userRole = "";
                } else {
                    // try extract role from token if not present
                    if (!userRole) {
                        const fromPayload = decoded.roles || decoded.role || decoded.role_name || decoded.groups || decoded.group || decoded.is_staff || decoded.is_superuser;
                        if (fromPayload) userRole = normalizeRole(fromPayload);
                    }
                }
            }
        } catch (e) {
            isAuthenticated = false;
            user = null;
            userRole = "";
        }
    }

    // Fallback: try direct token cookie
    if (!isAuthenticated && directJwtToken) {
        const decoded = decodeJWT(directJwtToken);
        const now = Math.floor(Date.now() / 1000);
        if (decoded && (!decoded.exp || decoded.exp >= now)) {
            isAuthenticated = true;
            if (directUserRoleCookie) {
                userRole = normalizeRole(directUserRoleCookie);
            } else {
                const fromPayload = decoded.roles || decoded.role || decoded.role_name || decoded.groups || decoded.group || decoded.is_staff || decoded.is_superuser;
                if (fromPayload) userRole = normalizeRole(fromPayload);
            }
        }
    }

    // --- Authorization and redirects ---
    // Not authenticated: protect admin and checkout
    if (!isAuthenticated) {
        if (adminRoutes.some((r) => pathname.startsWith(r)) || clientRoutes.some((r) => pathname.startsWith(r))) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    // Authenticated: prevent access to /login /register
    if (authRoutes.some((r) => pathname.startsWith(r))) {
        const redirectParam = request.nextUrl.searchParams.get("redirect");
        if (redirectParam) return NextResponse.redirect(new URL(redirectParam, request.url));
        if (userRole === "ROLE_ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Admin routes require ROLE_ADMIN
    if (adminRoutes.some((r) => pathname.startsWith(r)) && userRole !== "ROLE_ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Checkout requires ROLE_CLIENT or ROLE_ADMIN
    if (clientRoutes.some((r) => pathname.startsWith(r)) && userRole !== "ROLE_CLIENT" && userRole !== "ROLE_ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/checkout/:path*", "/login", "/register"],
};