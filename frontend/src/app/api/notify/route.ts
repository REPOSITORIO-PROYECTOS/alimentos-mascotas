import { MercadoPagoConfig, MerchantOrder, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

const accessToken = `${process.env.MERCADO_PAGO_ACCESS_TOKEN}`;
const mercadopago = new MercadoPagoConfig({ accessToken });

export async function POST(req: NextRequest) {
    try {
        // Obtener los datos de la notificación
        const body = await req.json();
        console.log("Body de la petición 1:", body);

        // Obtener los parámetros de la URL
        const url = new URL(req.url);
        const params = url.searchParams;
        console.log("Params de la petición 2:", Object.fromEntries(params));

        // Verificar qué tipo de notificación es y manejarla adecuadamente
        if (body.type === "payment" && body.data && body.data.id) {
            // Notificación de tipo payment
            try {
                const paymentId = body.data.id;
                console.log(
                    "ID de la notificación de pago con tipo payment 3:",
                    paymentId
                );

                const payment = await new Payment(mercadopago).get({
                    id: paymentId,
                });
                console.log("Payment detalle 4:", payment);

                const newCommand = {
                    id: payment.id,
                    status: payment.status,
                    status_detail: payment.status_detail,
                    name: payment.additional_info?.payer?.first_name,
                    email: payment.payer?.email,
                    phone: {
                        area_code:
                            payment.additional_info?.payer?.phone?.area_code,
                        number: payment.additional_info?.payer?.phone?.number,
                    },
                    address: {
                        zip_code:
                            payment.additional_info?.payer?.address?.zip_code,
                        street_name:
                            payment.additional_info?.payer?.address
                                ?.street_name,
                    },
                    items: payment.additional_info?.items?.map((item) => ({
                        id: item.id,
                        name: item.title,
                        description: item.description,
                        image: item.picture_url,
                        price: item.unit_price,
                        quantity: item.quantity,
                    })),
                };

                console.log(
                    "----------------Menú guardado-------------------:",
                    newCommand
                );
                // hacer un try catch para guardar el nuevo comando
                try {
                    const response = await fetch(
                        "https://barker.sistemataup.online/api/mercadopago/pago",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(newCommand),
                        }
                    );
                    console.log("Nuevo comando guardado con éxito:", response);
                } catch (error) {
                    console.error("Error al guardar el nuevo comando:", error);
                }

                return NextResponse.json({ success: true });
            } catch (error) {
                console.error(error);
                return NextResponse.json(
                    {
                        success: false,
                        error: "Payment no encontrado o error procesando el pago",
                    },
                    { status: 200 }
                );
            }
        } else if (body.topic === "merchant_order" && body.resource) {
            // Notificación de tipo merchant_order
            try {
                // Extraer el ID del merchant_order de la URL del recurso
                const merchantOrderIdMatch = body.resource.match(/(\d+)$/);
                if (merchantOrderIdMatch && merchantOrderIdMatch[1]) {
                    const merchantOrderId = merchantOrderIdMatch[1];
                    console.log(
                        "ID de la notificación de merchant_order 5:",
                        merchantOrderId
                    );

                    const merchantOrder = await new Payment(mercadopago).get({
                        id: merchantOrderId,
                    });
                    console.log("Merchant order detalle 6:", merchantOrder);

                    const newCommand = {
                        id: merchantOrder.id,
                        status: merchantOrder.status,
                        status_detail: merchantOrder.status_detail,
                        name: merchantOrder.additional_info?.payer?.first_name,
                        email: merchantOrder.payer?.email,
                        phone: {
                            area_code:
                                merchantOrder.additional_info?.payer?.phone
                                    ?.area_code,
                            number: merchantOrder.additional_info?.payer?.phone
                                ?.number,
                        },
                        address: {
                            zip_code:
                                merchantOrder.additional_info?.payer?.address
                                    ?.zip_code,
                            street_name:
                                merchantOrder.additional_info?.payer?.address
                                    ?.street_name,
                        },
                        items: merchantOrder.additional_info?.items?.map(
                            (item) => ({
                                id: item.id,
                                name: item.title,
                                description: item.description,
                                image: item.picture_url,
                                price: item.unit_price,
                                quantity: item.quantity,
                            })
                        ),
                    };

                    console.log(
                        "----------------Menú guardado con merchant_order-------------------:",
                        newCommand
                    );

                    return NextResponse.json({ success: true });
                } else {
                    console.error(
                        "No se pudo extraer el ID del merchant_order de la URL"
                    );
                    return NextResponse.json(
                        {
                            success: false,
                            error: "No se pudo extraer el ID del merchant_order de la URL",
                        },
                        { status: 200 }
                    );
                }
            } catch (error) {
                console.error(error);
                return NextResponse.json(
                    {
                        success: false,
                        error: "Merchant order no encontrado o error procesando la orden",
                    },
                    { status: 200 }
                );
            }
        } else {
            // Otro tipo de notificación o formato no esperado
            console.log(
                "Notificación de tipo desconocido o formato inesperado"
            );
            return NextResponse.json({
                success: true,
                message: "Notification acknowledged but not processed",
            });
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        // Siempre devolver status 200 para que Mercado Pago no reintente la notificación
        return NextResponse.json(
            { success: false, error: "Error processing webhook" },
            { status: 200 }
        );
    }

    // // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
    // const body: { data: { id: string } } = await req.json();
    // console.log("Webhook body:", body);

    // // const secret = req.headers.get("x-request-id_header");
    // // if (secret !== process.env.MERCADO_PAGO_SECRET) {
    // //   return NextResponse.json({ success: false });
    // // }
    // const payment = await new Payment(mercadopago).get({ id: body.data.id });

    // console.log("Payment:", payment);

    // // const newCommand = {
    // //     id: payment.id,
    // //     name: payment.additional_info?.payer?.first_name,
    // //     email: payment.payer?.email,
    // //     phone: {
    // //         area_code: payment.additional_info?.payer?.phone?.area_code,
    // //         number: payment.additional_info?.payer?.phone?.number,
    // //     },
    // //     address: {
    // //         zip_code: payment.additional_info?.payer?.address?.zip_code,
    // //         street_name: payment.additional_info?.payer?.address?.street_name,
    // //     },
    // //     items: payment.additional_info?.items?.map((item) => ({
    // //         id: item.id,
    // //         name: item.title,
    // //         description: item.description,
    // //         image: item.picture_url,
    // //         price: item.unit_price,
    // //         quantity: item.quantity,
    // //     })),
    // // };

    // // console.log("Menú guardado:", newCommand);

    // return NextResponse.json(null, { status: 200 });
}
