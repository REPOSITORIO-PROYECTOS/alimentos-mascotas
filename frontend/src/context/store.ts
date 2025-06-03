import { create } from "zustand";
import { persist } from "zustand/middleware";

// Definición de tipos para la respuesta del API
export interface AuthResponse {
    id: string;
    token: string;
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
    roles: "ROLE_ADMIN" | "ROLE_CLIENT" | string[];
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
        role?: "ROLE_ADMIN" | "ROLE_CLIENT"
    ) => Promise<boolean>;
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
                    // Llamada al endpoint de autenticación
                    const response = await fetch(
                        "https://barker.sistemataup.online/api/auth/login",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, password }),
                        }
                    );

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(
                            errorData.message || "Error en la autenticación"
                        );
                    }

                    const userData: AuthResponse = await response.json(); // Actualizar el estado con los datos del usuario
                    set({
                        user: {
                            ...userData,
                            // Asegurar que role sea compatible con el tipo esperado
                            roles: Array.isArray(userData.roles)
                                ? (userData.roles as [
                                      "ROLE_ADMIN" | "ROLE_CLIENT"
                                  ])
                                : userData.roles,
                        },
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Guardar el rol y token en cookies para el middleware
                    const userRole = Array.isArray(userData.roles)
                        ? userData.roles[0]
                        : userData.roles;
                    document.cookie = `role=${userRole}; path=/; max-age=28800; secure; samesite=strict`;
                    document.cookie = `token=${userData.token}; path=/; max-age=28800; secure; samesite=strict`;

                    return true;
                } catch (error) {
                    set({
                        isLoading: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Error desconocido",
                    });
                    return false;
                }
            }, // Función de logout
            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null,
                });

                // Limpiar todas las cookies relacionadas con la autenticación
                document.cookie =
                    "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie =
                    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

                // Limpiar sessionStorage para mantener compatibilidad
                sessionStorage.removeItem("user");
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
