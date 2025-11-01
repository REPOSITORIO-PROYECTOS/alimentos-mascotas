// Webhook desactivado: la lógica de notificación de Mercado Pago ahora es responsabilidad exclusiva del backend.
// Todo el contenido anterior ha sido comentado para evitar que procese notificaciones.

/*
import { MercadoPagoConfig, MerchantOrder, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

const accessToken = `${process.env.MERCADO_PAGO_ACCESS_TOKEN}`;
const mercadopago = new MercadoPagoConfig({ accessToken });

export async function POST(req: NextRequest) {
    // ...código original comentado...
}
*/

// Handler anulado:
export async function POST() {
  return new Response(
    JSON.stringify({
      success: false,
      message: "Webhook desactivado. Utiliza el backend para notificaciones de Mercado Pago."
    }),
    { status: 410, headers: { 'Content-Type': 'application/json' } }
  );
}
