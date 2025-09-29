// src/lib/auth-tokens.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://barker.sistemataup.online/api";

const LS_ACCESS = "access_token";
const LS_REFRESH = "refresh_token";
let refreshTimer: number | null = null;
let isRefreshing = false; // Bandera para evitar refrescos concurrentes

type Tokens = { access?: string; refresh?: string };

// Helper para obtener el nombre del rol a guardar en cookie
function getRoleForCookie(roles: string[], accessToken?: string | null): string {
    if (roles && roles.length > 0) return roles[0];
    if (isAdminFromToken(accessToken)) return "ROLE_ADMIN";
    return "ROLE_CLIENT"; // Rol por defecto si no se puede determinar
}

export function saveTokens(tokens: Tokens, userRoles: string[] = []) {
    try {
        if (tokens.access) localStorage.setItem(LS_ACCESS, tokens.access);
        if (tokens.refresh) localStorage.setItem(LS_REFRESH, tokens.refresh);
    } catch (e) {
        console.warn("No se pudo guardar tokens en localStorage:", e);
    }

    if (typeof document !== "undefined") {
        const d = new Date();
        // Aumentar la duración de la cookie a 1 día para que sea más robusta.
        // Si el refresh_token de Django tiene una duración similar, mejor.
        d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
        const expires = `expires=${d.toUTCString()}`;
        const commonCookieParams = `path=/; ${expires}; samesite=Lax;`;

        if (tokens.access) {
            document.cookie = `token=${tokens.access}; ${commonCookieParams}`;
        }
        // Asegurarse de que el rol se guarda siempre
        const roleToSave = getRoleForCookie(userRoles, tokens.access);
        document.cookie = `role=${roleToSave}; ${commonCookieParams}`;
    }
    // Siempre reprogramar el refresh después de guardar tokens
    scheduleRefresh();
}

export function loadTokens(): Tokens {
    try {
        const access = typeof localStorage !== "undefined" ? localStorage.getItem(LS_ACCESS) : null;
        const refresh = typeof localStorage !== "undefined" ? localStorage.getItem(LS_REFRESH) : null;
        return { access: access || undefined, refresh: refresh || undefined };
    } catch (e) {
        console.warn("Error al cargar tokens desde localStorage:", e);
        return {};
    }
}

export function clearTokens() {
    try {
        localStorage.removeItem(LS_ACCESS);
        localStorage.removeItem(LS_REFRESH);
    } catch (e) {
        console.warn("Error al limpiar localStorage:", e);
    }
    if (typeof document !== "undefined") {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=Lax";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=Lax";
    }
    if (refreshTimer) {
        window.clearTimeout(refreshTimer);
        refreshTimer = null;
    }
    isRefreshing = false; // Reiniciar la bandera
}

export function parseJwt(token?: string | null) {
    if (!token) return null;
    try {
        const payload = token.split(".")[1];
        if (!payload) return null; // Añadir chequeo por si no hay payload
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64) // `atob` puede fallar si no es base64 válido
                .split("")
                .map((c) => {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        );
        return JSON.parse(json);
    } catch (e) {
        console.error("Error al parsear JWT:", e);
        return null;
    }
}

export function isAdminFromToken(token?: string | null) {
    const payload = parseJwt(token);
    if (!payload) return false;
    if (payload.is_staff || payload.is_admin || payload.is_superuser) return true;
    if (payload.roles && Array.isArray(payload.roles)) return payload.roles.includes("ROLE_ADMIN") || payload.roles.includes("admin");
    // Asumir que si no tiene un rol explícito de admin, no lo es.
    return false;
}

export async function refreshAccess(): Promise<boolean> {
    if (isRefreshing) {
        console.log("Ya hay un proceso de refresco en curso.");
        return true; // Asumimos que el otro proceso tendrá éxito.
    }

    const refresh = typeof localStorage !== "undefined" ? localStorage.getItem(LS_REFRESH) : null;
    if (!refresh) {
        console.warn("No hay refresh token disponible.");
        clearTokens();
        return false;
    }

    isRefreshing = true;
    try {
        const res = await fetch(`${API_BASE.replace(/\/$/, "")}/auth/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (!res.ok) {
            console.error("Fallo al refrescar token:", res.status, await res.text());
            clearTokens();
            return false;
        }

        const data = await res.json();
        if (data.access) {
            // Es crucial que los roles se pasen de nuevo o se infieran del nuevo access token
            // Si el endpoint de refresh devuelve los roles, úsalos.
            // Si no, podemos intentar leerlos del nuevo access token.
            const newAccessTokenPayload = parseJwt(data.access);
            const roles = (newAccessTokenPayload?.roles && Array.isArray(newAccessTokenPayload.roles))
                ? newAccessTokenPayload.roles
                : []; // O podrías intentar usar los roles del store si el token no los tiene.

            saveTokens({ access: data.access, refresh: data.refresh || refresh }, roles);
            return true;
        }
        console.error("Respuesta de refresh no contiene access token.");
        clearTokens();
        return false;
    } catch (e) {
        console.error("Excepción al refrescar token:", e);
        clearTokens();
        return false;
    } finally {
        isRefreshing = false;
    }
}

export function scheduleRefresh() {
    if (refreshTimer) {
        window.clearTimeout(refreshTimer);
        refreshTimer = null;
    }
    const access = typeof localStorage !== "undefined" ? localStorage.getItem(LS_ACCESS) : null;
    if (!access) return;

    const payload = parseJwt(access);
    if (!payload || !payload.exp) {
        console.warn("Token de acceso sin payload o sin exp.");
        return;
    }

    const expiresAt = payload.exp * 1000; 
    const now = Date.now();
    const refreshThreshold = 60000; 
    const minRefreshInterval = 5000; 

    const msUntilRefresh = Math.max(minRefreshInterval, expiresAt - now - refreshThreshold);

    if (msUntilRefresh <= 0) {
        refreshAccess().catch(err => console.error("Error al refrescar acceso inmediatamente:", err));
        return;
    }

    refreshTimer = window.setTimeout(() => {
        refreshAccess().catch(err => console.error("Error en refresco programado:", err));
    }, msUntilRefresh);
}

// On module load, try to schedule if tokens are present
if (typeof window !== "undefined") {
    try {
        const existing = localStorage.getItem(LS_ACCESS);
        if (existing) scheduleRefresh();
    } catch (e) {
        console.error("Error al inicializar scheduleRefresh al cargar el módulo:", e);
    }
}

export default {
    saveTokens,
    loadTokens,
    clearTokens,
    refreshAccess,
    scheduleRefresh,
    isAdminFromToken,
    parseJwt
};