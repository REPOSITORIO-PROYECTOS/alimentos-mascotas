// src/lib/auth-tokens.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://barker.sistemataup.online/api";

const LS_ACCESS = "access_token";
const LS_REFRESH = "refresh_token";
let refreshTimer: number | null = null;

type Tokens = { access?: string; refresh?: string };

export function saveTokens(tokens: Tokens, userRoles: string[] = []) { // Añadimos userRoles
    try {
        if (tokens.access) localStorage.setItem(LS_ACCESS, tokens.access);
        if (tokens.refresh) localStorage.setItem(LS_REFRESH, tokens.refresh);
    } catch (e) {
        console.warn("No se pudo guardar tokens en localStorage:", e);
    }

    // Keep a cookie copy for middleware/server side reads (not httpOnly)
    if (typeof document !== "undefined") {
        const d = new Date();
        d.setTime(d.getTime() + (8 * 60 * 60 * 1000)); // Expira en 8 horas (puedes ajustar)
        const expires = `expires=${d.toUTCString()}`;
        const commonCookieParams = `path=/; ${expires}; samesite=Lax;`;

        if (tokens.access) {
            document.cookie = `token=${tokens.access}; ${commonCookieParams}`;
        }

        // GUARDAR EL ROL EN UNA COOKIE
        // Si se proporciona userRoles, usamos el primer rol, de lo contrario intentamos inferir del token o un valor por defecto.
        const roleToSave = userRoles.length > 0 ? userRoles[0] : (isAdminFromToken(tokens.access) ? "ROLE_ADMIN" : "ROLE_CLIENT");
        document.cookie = `role=${roleToSave}; ${commonCookieParams}`;
    }

    scheduleRefresh();
}

export function loadTokens(): Tokens {
    try {
        const access = typeof localStorage !== "undefined" ? localStorage.getItem(LS_ACCESS) : null;
        const refresh = typeof localStorage !== "undefined" ? localStorage.getItem(LS_REFRESH) : null;
        return { access: access || undefined, refresh: refresh || undefined };
    } catch (e) {
        return {};
    }
}

export function clearTokens() {
    try {
        localStorage.removeItem(LS_ACCESS);
        localStorage.removeItem(LS_REFRESH);
    } catch (e) {
        // ignore
    }
    if (typeof document !== "undefined") {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=Lax";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=Lax";
    }
    if (refreshTimer) {
        window.clearTimeout(refreshTimer);
        refreshTimer = null;
    }
}

export function parseJwt(token?: string | null) {
    if (!token) return null;
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        );
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

export function isAdminFromToken(token?: string | null) {
    const payload = parseJwt(token);
    if (!payload) return false;
    // Comprueba si los roles están directamente en el payload
    if (payload.roles && Array.isArray(payload.roles)) {
        return payload.roles.includes("ROLE_ADMIN") || payload.roles.includes("admin");
    }
    // Comprueba si hay una propiedad 'is_staff' o 'is_superuser' que indique un admin
    if (payload.is_staff || payload.is_admin || payload.is_superuser) return true;
    return false;
}


export async function refreshAccess(): Promise<boolean> {
    const refresh = typeof localStorage !== "undefined" ? localStorage.getItem(LS_REFRESH) : null;
    if (!refresh) return false;
    try {
        const res = await fetch(`${API_BASE.replace(/\/$/, "")}/auth/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });
        if (!res.ok) {
            clearTokens();
            return false;
        }
        const data = await res.json();
        if (data.access) {
            // Cuando se refresca el token, si no nos devuelven los roles directamente,
            // podríamos intentar leerlos del nuevo token o mantener los viejos si están en el store.
            // Para simplificar, aquí solo guardamos los tokens. El middleware se encargará de leer el rol de la cookie.
            saveTokens({ access: data.access, refresh: data.refresh || refresh });
            return true;
        }
        clearTokens();
        return false;
    } catch (e) {
        clearTokens();
        return false;
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
    if (!payload || !payload.exp) return;
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    // programar refresh 60s antes de expirar, mínimo 5s
    const msUntilRefresh = Math.max(5000, expiresAt - now - 60000);
    if (msUntilRefresh <= 0) { // Si ya expiró o expira muy pronto, intenta refrescar de inmediato
        refreshAccess().catch(() => clearTokens());
        return;
    }
    refreshTimer = window.setTimeout(() => {
        refreshAccess().catch(() => clearTokens());
    }, msUntilRefresh);
}

// On module load, try to schedule if tokens are present
if (typeof window !== "undefined") {
    try {
        const existing = localStorage.getItem(LS_ACCESS);
        if (existing) scheduleRefresh();
    } catch (e) {
        // ignore
    }
}

export default {
    saveTokens,
    loadTokens,
    clearTokens,
    refreshAccess,
    scheduleRefresh,
    isAdminFromToken,
    parseJwt // Exportar parseJwt para posibles usos externos
};