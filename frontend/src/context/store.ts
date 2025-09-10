import { create } from "zustand";
import { persist } from "zustand/middleware";
import TokensHelper from "@/lib/auth-tokens";

// Definición de tipos para la respuesta del API
export interface AuthResponse {
    id: string;
    access?: string; // JWT access token
    refresh?: string; // JWT refresh token
    token?: string; // legacy (si tu backend aún envía un campo 'token' separado)
    username: string;
    name: string;
    roles: string[];
}

// Tipo de usuario simplificado
export type User = {
    id: string;
    token: string; // Almacenará el access_token
    username: string;
    name: string;
    roles: string[];
} | null;

// Definición del estado de autenticación
interface AuthState {
    user: User;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (
        email: string,
        password: string,
    ) => Promise<string | false>;
    logout: () => void;
    clearError: () => void;
}

// Creación del store con persistencia
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Función de login
            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    // Llamada al endpoint de autenticación (nota: slash final)
                    const response = await fetch(
                        "https://barker.sistemataup.online/api/auth/login/",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password }),
                        }
                    );

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(
                            (errorData && (errorData.message || errorData.detail || errorData.error)) ||
                                "Error en la autenticación"
                        );
                    }

                    const userData: AuthResponse = await response.json();

                    // Normalize roles
                    const roles = Array.isArray(userData.roles)
                        ? userData.roles
                        : userData.roles
                        ? [userData.roles]
                        : [];

                    // Prefer access token, fall back to token (legacy)
                    const accessToken = userData.access || userData.token || undefined;
                    const refreshToken = userData.refresh || undefined;

                    // Persist tokens using helper
                    TokensHelper.saveTokens({ access: accessToken, refresh: refreshToken });

                    // Schedule automatic refresh
                    TokensHelper.scheduleRefresh();

                    // Update state
                    set({
                        user: {
                            id: userData.id,
                            token: accessToken || "", // Guardamos el access_token aquí
                            username: userData.username,
                            name: userData.name,
                            roles,
                        },
                        isAuthenticated: !!accessToken,
                        isLoading: false,
                    });

                    const userRole = roles.length > 0 ? roles[0] : "";

                    // (tokens and cookies handled by TokensHelper)

                    // 👉 Redirección dinámica basada en el rol del usuario
                    const redirectParam = new URLSearchParams(window.location.search).get("redirect");
                    if (redirectParam) {
                        window.location.href = redirectParam;
                    } else if (userRole === "ROLE_ADMIN") {
                        window.location.href = "/admin";
                    } else if (userRole === "ROLE_CLIENT") {
                        window.location.href = "/checkout"; // O tu ruta por defecto para clientes
                    } else {
                        window.location.href = "/"; // Por defecto, si el rol no coincide
                    }
                    
                    return userRole;

                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Error desconocido",
                    });
                    return false;
                }
            },

            // Función de logout
            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null,
                });
                // Clear tokens via helper
                TokensHelper.clearTokens();

                // Limpiar sessionStorage (si aún se usa por compatibilidad)
                try { sessionStorage.removeItem("user"); } catch(e) {}
                
                // Redirigir al inicio después de cerrar sesión
                window.location.href = "/";
            },

            // Limpiar errores
            clearError: () => set({ error: null }),
        }),
        {
            name: "auth-storage", // Nombre para localStorage
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            // Desactiva la rehidratación en el servidor para evitar errores de referencia a 'window'
            // O puedes envolver el código que usa 'window' con 'typeof window !== 'undefined''
            skipHydration: typeof window === 'undefined',
        }
    )
);