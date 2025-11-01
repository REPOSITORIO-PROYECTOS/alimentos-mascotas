import { NextRequest, NextResponse } from "next/server";
import * as TokensHelper from "@/lib/auth-tokens";

// Definir las rutas protegidas para cada rol
const adminRoutes = ["/admin"];
const clientRoutes = ["/checkout"];
const authRoutes = ["/login", "/register"];

// Decodifica el payload de un JWT sin verificar la firma (solo para leer exp/roles)
// Ya tenemos esta función en auth-tokens.ts, la usamos de allí.
const decodeJWT = TokensHelper.parseJwt;

function normalizeRole(raw: any) {
    if (!raw) return "";
    // Accept arrays like ['ROLE_ADMIN']
    if (Array.isArray(raw) && raw.length > 0) raw = raw[0];
    const r = String(raw).toLowerCase();
    if (r.includes("admin") || r === "is_staff" || r === "is_superuser") return "ROLE_ADMIN";
    if (r.includes("client") || r.includes("user") || r.includes("customer")) return "ROLE_CLIENT";
    if (r.includes("public")) return "ROLE_PUBLIC"; // Añadido para ROLE_PUBLIC
    return String(raw).toUpperCase(); // Asegurarse de que si es otro, sea en mayúsculas
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Leer directamente las cookies
    const accessToken = request.cookies.get("token")?.value;
    const userRoleCookie = request.cookies.get("role")?.value;

    let isAuthenticated = false;
    let userRole = "";

    // Si hay un token de acceso, intentar validarlo
    if (accessToken) {
        const decoded = decodeJWT(accessToken);
        const now = Math.floor(Date.now() / 1000);

        if (decoded && (!decoded.exp || decoded.exp >= now)) { // Token válido y no expirado
            isAuthenticated = true;
            if (userRoleCookie) {
                userRole = normalizeRole(userRoleCookie);
            } else {
                // Si la cookie de rol no está, intentar extraerlo del token (fallback)
                const fromPayload = decoded.roles || decoded.role || decoded.group || decoded.groups || decoded.is_staff || decoded.is_superuser;
                if (fromPayload) userRole = normalizeRole(fromPayload);
            }
        } else if (decoded && decoded.exp && decoded.exp < now) {
            // Token expirado, intentar refrescar. Esto requiere una lógica diferente en el middleware
            // ya que no podemos hacer llamadas de red bloqueantes o modificar cookies de respuesta
            // directamente en el middleware de Next.js de esta manera.
            // Para simplificar, si el access token está expirado, lo tratamos como no autenticado
            // y la rehidratación del cliente o el fetch de una ruta protegida intentará refrescarlo.
            isAuthenticated = false;
            // Podríamos intentar redirigir a una ruta de refresh en el cliente si es crítico,
            // pero el flujo actual de Next.js espera que esto se maneje en el cliente.
        }
    }

    // --- Autorización y redirecciones ---

    // 1. Rutas de autenticación (login, register):
    // Si el usuario ya está autenticado, no debe acceder a login/register.
    if (authRoutes.some((r) => pathname.startsWith(r))) {
        if (isAuthenticated) {
            const redirectParam = request.nextUrl.searchParams.get("redirect");
            if (redirectParam) {
                return NextResponse.redirect(new URL(redirectParam, request.url));
            }
            if (userRole === "ROLE_ADMIN") {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return NextResponse.redirect(new URL("/", request.url));
        }
        // Si no está autenticado, permitir acceso a login/register
        return NextResponse.next();
    }

    // 2. Rutas protegidas (admin, checkout):
    // Si el usuario NO está autenticado y intenta acceder a una ruta protegida.
    const isProtected = adminRoutes.some((r) => pathname.startsWith(r)) || clientRoutes.some((r) => pathname.startsWith(r));
    if (isProtected && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Permisos basados en roles para rutas protegidas.
    // Rutas de administración (solo para ROLE_ADMIN)
    if (adminRoutes.some((r) => pathname.startsWith(r))) {
        if (userRole !== "ROLE_ADMIN") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // Rutas de cliente (para ROLE_CLIENT o ROLE_ADMIN)
    if (clientRoutes.some((r) => pathname.startsWith(r))) {
        // Permitir acceso a cualquier usuario autenticado (ROLE_PUBLIC, ROLE_CLIENT, ROLE_ADMIN)
        if (!isAuthenticated) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            loginUrl.searchParams.set("message", "Debes registrarte o iniciar sesión para continuar con la compra.");
            return NextResponse.redirect(loginUrl);
        }
    }

    // Si todo está bien, permitir la solicitud
    return NextResponse.next();
}

export const config = {
    // Coincidir con todas las rutas protegidas y de autenticación
    matcher: ["/admin/:path*", "/checkout/:path*", "/login", "/register", "/((?!api|_next/static|_next/image|favicon.ico).*)"], // Ajustar matcher si hay rutas específicas que no deben ser interceptadas
};