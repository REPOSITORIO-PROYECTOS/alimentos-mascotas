// src/context/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import TokensHelper from "@/lib/auth-tokens";

// Definición de tipos para la respuesta del API de Django
export interface AuthResponse {
    id: number; // Cambiado a number según tu JSON
    access?: string; // JWT access token
    refresh?: string; // JWT refresh token
    username: string;
    name: string;
    roles: string[]; // Aseguramos que sea un array de strings
}

// Tipo de usuario simplificado
export type User = {
    id: number; // Cambiado a number
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
    ) => Promise<string | false>; // Ahora devuelve el rol o false
    logout: () => void;
    clearError: () => void;
    setTokensFromRefresh: (accessToken: string, refreshToken: string, roles: string[]) => void;
}

// Creación del store con persistencia
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({ // Obtener 'get' para acceder al estado actual
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Función de login
            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
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
                                "Credenciales incorrectas o error en el servidor."
                        );
                    }

                    const userData: AuthResponse = await response.json();

                    const roles = Array.isArray(userData.roles) ? userData.roles : [];

                    const accessToken = userData.access || undefined;
                    const refreshToken = userData.refresh || undefined;

                    if (!accessToken) {
                        throw new Error("No se recibió un token de acceso.");
                    }

                    // 👉 Pasamos los roles a saveTokens para que los guarde en la cookie
                    TokensHelper.saveTokens({ access: accessToken, refresh: refreshToken }, roles);

                    set({
                        user: {
                            id: userData.id,
                            token: accessToken, // Guardamos el access_token aquí
                            username: userData.username,
                            name: userData.name,
                            roles,
                        },
                        isAuthenticated: true, // Siempre true si hay token de acceso
                        isLoading: false,
                    });

                    // Devolvemos el primer rol o una cadena vacía si no hay roles
                    return roles.length > 0 ? roles[0] : "";

                } catch (error) {
                    TokensHelper.clearTokens(); // Limpiar tokens si el login falla
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Error desconocido",
                        user: null,
                        isAuthenticated: false,
                    });
                    return false;
                }
            },

            // Función para actualizar el estado del store después de un refresh exitoso
            setTokensFromRefresh: (accessToken: string, refreshToken: string, roles: string[]) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: {
                            ...currentUser,
                            token: accessToken,
                            roles: roles, // Asegurarse de que los roles estén actualizados
                        },
                        isAuthenticated: true,
                    });
                    TokensHelper.saveTokens({ access: accessToken, refresh: refreshToken }, roles);
                }
            },

            // Función de logout
            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null,
                });
                TokensHelper.clearTokens();
                // No hay redirección aquí, el componente la manejará.
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
            skipHydration: typeof window === 'undefined',
            // Añadir un onRehydrateStorage para revalidar el token al cargar el store
            onRehydrateStorage: (state) => {
                return (state, error) => {
                    if (error) {
                        console.error("Error al rehidratar auth-storage:", error);
                        state?.logout(); // Limpiar el estado si hay un error de rehidratación
                    }
                    if (state && state.user && state.user.token) {
                        const payload = TokensHelper.parseJwt(state.user.token);
                        const now = Math.floor(Date.now() / 1000);
                        if (!payload || (payload.exp && payload.exp < now)) {
                            console.log("Token de acceso expirado al rehidratar, intentando refrescar...");
                            TokensHelper.refreshAccess().then(success => {
                                if (!success) {
                                    state.logout();
                                    // Considerar redireccionar aquí si es necesario, pero mejor manejarlo en un layout wrapper
                                } else {
                                    // Si el refresh fue exitoso, el saveTokens ya actualizó localStorage y cookies.
                                    // Pero el store de Zustand necesita ser actualizado para reflejar el nuevo token
                                    const { access, refresh } = TokensHelper.loadTokens();
                                    if (access && refresh) {
                                        // Aquí necesitaríamos los roles para el setTokensFromRefresh
                                        // Para simplificar, el middleware y los componentes que necesiten el rol
                                        // pueden leerlo de la cookie o decodificar el token.
                                        // Para el store, podríamos dejarlo como está o hacer una llamada extra
                                        // para obtener los detalles del usuario si el rol no está en el token
                                        const newPayload = TokensHelper.parseJwt(access);
                                        const roles = (newPayload?.roles && Array.isArray(newPayload.roles))
                                            ? newPayload.roles
                                            : state.user?.roles || []; // Mantener roles anteriores si no se actualizan
                                        state.setTokensFromRefresh(access, refresh, roles);
                                    }
                                }
                            }).catch(() => state.logout());
                        }
                    }
                };
            },
        }
    )
);