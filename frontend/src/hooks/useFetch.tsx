import axios, { AxiosRequestConfig, Method } from "axios";
import { useRouter } from "next/navigation";
// import useStore from "@/context/store";
import { toast } from "sonner";
import { useAuthStore } from "@/context/store";
import { useCallback } from "react";

interface AuthFetchProps {
    endpoint: string;
    redirectRoute?: string;
    formData?: any;
    options?: AxiosRequestConfig<any>;
    method?: Method;
    headers?: any;
}

export function useFetch() {
    const { user } = useAuthStore();
    const router = useRouter();
    // const { setUser } = useStore((state) => ({
    //     setUser: state.setUser,
    // }));

    const authRouter = useCallback(
        async ({
            endpoint,
            formData,
            redirectRoute,
            headers,
            options,
            method = "post", // default method is post
        }: AuthFetchProps) => {
            try {
                const isFormData = formData instanceof FormData;

                const requestConfig = {
                    url: `https://barker.sistemataup.online/api${endpoint}`,
                    method,
                    data: formData,
                    headers,
                    ...options,
                };

                // Si es FormData, aseguramos que no se establece Content-Type
                // para que el navegador configure automáticamente el boundary
                if (isFormData) {
                    requestConfig.headers = {
                        ...requestConfig.headers,
                        "Content-Type": "multipart/form-data",
                    };
                }

                const { data } = await axios(requestConfig);
                console.log("data", data);

                if (data.message) {
                    toast.success(data.message, {
                        richColors: true,
                    });
                }
                // if (data.userLogged) {
                //     setUser(data.userLogged)
                // }
                if (redirectRoute) {
                    router.push(redirectRoute);
                    router.refresh();
                }
                return data;
            } catch (error: any) {
                console.log(error.response?.data?.message || error.message);
                throw error; // Re-lanzar el error para que sea manejado por el código que llama
            }
        },
        [router]
    );

    return authRouter;
}
