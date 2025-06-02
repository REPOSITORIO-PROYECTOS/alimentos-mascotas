"use server";

export async function toggleCajaEstado(activa: boolean, token: string) {
    try {
        const response = await fetch(
            `https://barker.sistemataup.online/api/caja/estado?operacion=${
                activa ? "abrir" : "cerrar"
            }`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    operacion: `${activa ? "abrir" : "cerrar"}`,
                }),
                // Importante: agregar esta opción si la API está en otro dominio
                //cache: "no-store",
            }
        );

        const data = await response.json();
        console.log("Respuesta de la API:", data);

        if (!response.ok) {
            throw new Error("Error al cambiar el estado de la caja");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error en server action:", error);
        return {
            success: false,
            error: "Error al cambiar el estado de la caja",
        };
    }
}
