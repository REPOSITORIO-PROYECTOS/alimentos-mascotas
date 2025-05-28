import { NextRequest, NextResponse } from "next/server";

// Definir las rutas protegidas para cada rol
const adminRoutes = ["/admin"];
const clientRoutes = ["/checkout"];
const authRoutes = ["/login", "/register"];

// Función para decodificar JWT (sin verificar firma en el middleware)
function decodeJWT(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(
                    (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Obtener el token de las cookies (auth-storage de Zustand)
    const authStorageToken = request.cookies.get("auth-storage")?.value;
    // También verificar si hay un token JWT directo en las cookies
    const jwtToken = request.cookies.get("token")?.value;

    let user = null;
    let isAuthenticated = false;
    let userRole = "";

    // Verificar si el usuario está autenticado
    if (authStorageToken) {
        try {
            // Extraer la información del usuario del token almacenado por Zustand
            const authData = JSON.parse(decodeURIComponent(authStorageToken));
            user = authData.state.user;
            isAuthenticated = authData.state.isAuthenticated;

            // Determinar el rol del usuario
            if (user && user.roles) {
                userRole = Array.isArray(user.roles)
                    ? user.roles[0]
                    : user.roles;
            }

            // Validar también el JWT si existe
            if (user && user.token) {
                const decodedJWT = decodeJWT(user.token);
                if (decodedJWT) {
                    // Verificar si el token ha expirado
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (decodedJWT.exp && decodedJWT.exp < currentTime) {
                        // Token expirado
                        isAuthenticated = false;
                        user = null;
                        userRole = "";
                    } else {
                        // Validar roles del JWT
                        if (
                            decodedJWT.roles &&
                            Array.isArray(decodedJWT.roles)
                        ) {
                            userRole = decodedJWT.roles[0] || userRole;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error al parsear el token:", error);
            isAuthenticated = false;
            user = null;
            userRole = "";
        }
    } else if (jwtToken) {
        // Si no hay auth-storage pero sí hay JWT directo
        const decodedJWT = decodeJWT(jwtToken);
        if (decodedJWT) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedJWT.exp && decodedJWT.exp >= currentTime) {
                isAuthenticated = true;
                userRole =
                    decodedJWT.roles && Array.isArray(decodedJWT.roles)
                        ? decodedJWT.roles[0]
                        : "";
            }
        }
    }
    // Redirigir usuarios no autenticados a login si intentan acceder a rutas protegidas
    if (!isAuthenticated) {
        // Si intenta acceder a rutas protegidas, redirigir a login
        if (
            adminRoutes.some((route) => pathname.startsWith(route)) ||
            clientRoutes.some((route) => pathname.startsWith(route))
        ) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    } else {
        // Usuario autenticado
        // Si intenta acceder a páginas de autenticación, redirigir según el rol
        if (authRoutes.some((route) => pathname.startsWith(route))) {
            if (userRole === "ROLE_ADMIN") {
                return NextResponse.redirect(new URL("/admin", request.url));
            } else {
                return NextResponse.redirect(new URL("/", request.url));
            }
        }
        // Verificar permisos para rutas de administrador
        if (
            adminRoutes.some((route) => pathname.startsWith(route)) &&
            userRole !== "ROLE_ADMIN"
        ) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }
    return NextResponse.next();
}

// Configurar las rutas donde se aplicará el middleware
export const config = {
    matcher: [
        // Rutas protegidas
        "/admin/:path*",
        "/checkout/:path*",
        // Rutas de autenticación
        "/login",
        "/register",
    ],
};
