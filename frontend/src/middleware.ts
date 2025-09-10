import { NextRequest, NextResponse } from "next/server";

// Definir las rutas protegidas para cada rol
const adminRoutes = ["/admin"];
const clientRoutes = ["/checkout"];
const authRoutes = ["/login", "/register"];

// Función para decodificar JWT (sin verificar firma en el middleware)
// SOLO para leer el payload y la fecha de expiración.
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
        console.error("Error al decodificar JWT en middleware:", error);
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Obtener el estado de autenticación de las cookies
    const authStorageValue = request.cookies.get("auth-storage")?.value;
    // Obtener el JWT directo de la cookie 'token'
    const directJwtToken = request.cookies.get("token")?.value;
    // Obtener el rol directo de la cookie 'role' (útil si el JWT no incluye roles)
    const directUserRoleCookie = request.cookies.get("role")?.value;

    let user = null;
    let isAuthenticated = false;
    let userRole = "";

    // 1. Intentar autenticar y obtener el rol desde 'auth-storage' (Zustand)
    if (authStorageValue) {
        try {
            const authData = JSON.parse(decodeURIComponent(authStorageValue));
            user = authData.state.user;
            isAuthenticated = authData.state.isAuthenticated;

            // Asegurarse de que el rol se obtenga correctamente del estado de Zustand
            if (user && user.roles && user.roles.length > 0) {
                userRole = user.roles[0];
            }

            // Validar la expiración del JWT si está presente en el objeto user de Zustand
            if (user && user.token) {
                const decodedJWT = decodeJWT(user.token);
                if (decodedJWT) {
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (decodedJWT.exp && decodedJWT.exp < currentTime) {
                        console.log("Token de auth-storage expirado. Forzando no autenticado.");
                        isAuthenticated = false;
                        user = null;
                        userRole = "";
                        // Opcional: Podrías eliminar las cookies aquí o redirigir
                        // para forzar la re-autenticación si el token en Zustand expiró
                        // return NextResponse.redirect(new URL("/login", request.url));
                    }
                }
            }
        } catch (error) {
            console.error("Error al parsear 'auth-storage' en middleware:", error);
            isAuthenticated = false;
            user = null;
            userRole = "";
        }
    }

    // 2. Si no se autenticó con 'auth-storage', intentar con el 'token' directo de la cookie
    // Esto es útil para la primera carga de página o si Zustand no se ha hidratado aún.
    if (!isAuthenticated && directJwtToken) {
        const decodedJWT = decodeJWT(directJwtToken);
        if (decodedJWT) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedJWT.exp && decodedJWT.exp >= currentTime) {
                isAuthenticated = true;
                // Intentar obtener el rol de la cookie 'role' o del payload del JWT si existe
                userRole = directUserRoleCookie || (decodedJWT.roles && Array.isArray(decodedJWT.roles) ? decodedJWT.roles[0] : "");
                console.log("Autenticado con 'token' directo. Rol:", userRole);
            } else {
                console.log("Direct JWT Token expirado.");
                // Opcional: Eliminar la cookie 'token' si ha expirado
                // const response = NextResponse.next();
                // response.cookies.set("token", "", { path: "/", expires: new Date(0), samesite: "Lax" });
                // response.cookies.set("role", "", { path: "/", expires: new Date(0), samesite: "Lax" });
                // return response;
            }
        }
    }

    // --- Lógica de Redirección y Autorización ---

    // Caso 1: Usuario NO autenticado
    if (!isAuthenticated) {
        // Si intenta acceder a rutas protegidas (admin o cliente), redirigir a login
        if (
            adminRoutes.some((route) => pathname.startsWith(route)) ||
            clientRoutes.some((route) => pathname.startsWith(route))
        ) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname); // Guardar la ruta original
            console.log(`Usuario no autenticado, redirigiendo a login con redirect: ${pathname}`);
            return NextResponse.redirect(loginUrl);
        }
    }
    // Caso 2: Usuario SÍ autenticado
    else {
        // Si intenta acceder a páginas de autenticación (/login, /register)
        if (authRoutes.some((route) => pathname.startsWith(route))) {
            const redirectParam = request.nextUrl.searchParams.get("redirect");
            if (redirectParam) {
                console.log(`Usuario autenticado en ${pathname}, redirigiendo a la ruta guardada: ${redirectParam}`);
                return NextResponse.redirect(new URL(redirectParam, request.url));
            }
            // Si no hay parámetro de redirección, redirigir según el rol
            if (userRole === "ROLE_ADMIN") {
                console.log(`Usuario autenticado (${userRole}) en ${pathname}, redirigiendo a /admin.`);
                return NextResponse.redirect(new URL("/admin", request.url));
            } else {
                console.log(`Usuario autenticado (${userRole}) en ${pathname}, redirigiendo a /.`);
                return NextResponse.redirect(new URL("/", request.url));
            }
        }

        // Verificar permisos para rutas de administrador
        if (
            adminRoutes.some((route) => pathname.startsWith(route)) &&
            userRole !== "ROLE_ADMIN"
        ) {
            console.warn(`Acceso denegado a ${pathname} para rol ${userRole}. Redirigiendo a /.`);
            return NextResponse.redirect(new URL("/", request.url));
        }

        // Verificar permisos para rutas de cliente (ej. checkout)
        // Permite a ROLE_ADMIN también acceder a rutas de cliente si es necesario
        if (
            clientRoutes.some((route) => pathname.startsWith(route)) &&
            userRole !== "ROLE_CLIENT" && userRole !== "ROLE_ADMIN"
        ) {
            console.warn(`Acceso denegado a ${pathname} para rol ${userRole}. Redirigiendo a /.`);
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // Si todo lo anterior pasa, permitir el acceso a la ruta solicitada
    return NextResponse.next();
}

// Configurar las rutas donde se aplicará el middleware
export const config = {
    matcher: [
        // Rutas protegidas que requieren autenticación y/o roles específicos
        "/admin/:path*",      // Todas las rutas bajo /admin
        "/checkout/:path*",   // Todas las rutas bajo /checkout
        // Rutas de autenticación que deben redirigir si el usuario ya está logueado
        "/login",
        "/register",
        // Puedes añadir más rutas aquí según tus necesidades
    ],
};