import { create } from "zustand";
import { persist } from "zustand/middleware";

// Definición de tipos para la respuesta del API
export interface AuthResponse {
    id: string;
    access?: string; // JWT access token
    refresh?: string; // JWT refresh token
    token?: string; // legacy
    username: string;
    name: string;
    roles: string[];
}

// Tipo de usuario simplificado para mantener compatibilidad
export type User = {
    id: string;
    token: string;
    username: string;
    name: string;
    roles: string[];    // Sacado: "ROLE_ADMIN" | "ROLE_CLIENT" y se convirtio en array de roles
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

                    // Prefer access token, fall back to token
                    const accessToken = userData.access || userData.token || undefined;
                    const refreshToken = userData.refresh || undefined;

                    // Update state
                    set({
                        user: {
                            id: userData.id,
                            token: accessToken || "",
                            username: userData.username,
                            name: userData.name,
                            roles,
                        },
                        isAuthenticated: !!accessToken,
                        isLoading: false,
                    });

                    const userRole = roles.length > 0 ? roles[0] : "";

                    // Persist tokens in localStorage for public area quick access
                    try {
                        if (accessToken) localStorage.setItem("access_token", accessToken);
                        if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
                    } catch (e) {
                        // ignore storage errors
                    }

                    // Set cookies for server-side (if needed)
                    if (userRole) {
                        document.cookie = `role=${userRole}; path=/; max-age=28800; samesite=strict`;
                    }
                    if (accessToken) {
                        document.cookie = `token=${accessToken}; path=/; max-age=28800; samesite=strict`;
                    }

                    // Redirect quick to checkout (same behavior as before)
                    window.location.href = "/checkout";
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

                // Limpiar cookies y localStorage
                document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                try {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                } catch (e) {
                    // ignore
                }

                // Limpiar sessionStorage para mantener compatibilidad
                sessionStorage.removeItem("user");
                window.location.href = "/"; // Redirigir al inicio
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
        }
    )
);