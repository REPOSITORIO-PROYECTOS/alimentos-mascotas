import { NextResponse, NextRequest } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const accessToken = `${process.env.MERCADO_PAGO_ACCESS_TOKEN}`;

const client = new MercadoPagoConfig({ accessToken });
const payment = new Preference(client);

interface IProduct {
    id: string;
    title: string;
    description: string;
    pictureUrl: string;
    categoryId: string;
    quantity: number;
    currencyId: string;
    unitPrice: number;
}

interface IIdentification {
    type: string;
    number: string;
}

interface IPhone {
    areaCode: string;
    number: string;
}

interface IAddress {
    streetName: string;
    streetNumber: string;
    zipCode: string;
    city: string;
    state: string;
}

interface IUserInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: IPhone;
    identification: IIdentification;
    address: IAddress | null;
}

interface ICheckoutRequest {
    items: IProduct[];
    shippingCost: number;
    shippingMethod: string;
    userInfo: IUserInfo;
}

export async function POST(req: NextRequest) {
    const requestData: ICheckoutRequest = await req.json();
    const URL = "https://barkerpet.com.ar";

    try {
        // Preparar los datos base de la preferencia
        const preferenceData: any = {
            items: requestData.items.map((item) => ({
                id: String(item.id),
                title: item.title,
                description: item.description,
                picture_url: item.pictureUrl,
                category_id: item.categoryId,
                unit_price: item.unitPrice,
                quantity: item.quantity,
                currency_id: item.currencyId || "ARS",
            })),
            metadata: {
                order_id: new Date().getTime().toString(),
                user_id: requestData.userInfo.email,
                user_name: `${requestData.userInfo.firstName} ${requestData.userInfo.lastName}`,
                user_phone: `${requestData.userInfo.phone.areaCode}${requestData.userInfo.phone.number}`,
                shipping_method: requestData.shippingMethod,
            },
            auto_return: "approved",
            back_urls: {
                success: `${URL}/checkout`,
                failure: `${URL}/checkout`,
                pending: `${URL}/checkout`,
            },
            notification_url: "https://barker.sistemataup.online/api/mercadopago/notificaciones/",
            external_reference: new Date().getTime().toString(),
            payer: {
                name: requestData.userInfo.firstName,
                surname: requestData.userInfo.lastName,
                email: requestData.userInfo.email,
                phone: {
                    area_code: requestData.userInfo.phone.areaCode,
                    number: requestData.userInfo.phone.number,
                },
                identification: {
                    type: requestData.userInfo.identification.type,
                    number: requestData.userInfo.identification.number,
                },
            },
            statement_descriptor: "Barker Pet Food",
        };

        // Solo agregar información de envío y dirección si el método es "delivery"
        if (
            requestData.shippingMethod === "delivery" &&
            requestData.userInfo.address
        ) {
            preferenceData.shipments = {
                cost: requestData.shippingCost,
                mode: "not_specified",
                receiver_address: {
                    zip_code: requestData.userInfo.address.zipCode,
                    street_name: requestData.userInfo.address.streetName,
                    street_number: requestData.userInfo.address.streetNumber,
                },
            };

            preferenceData.payer.address = {
                zip_code: requestData.userInfo.address.zipCode,
                street_name: requestData.userInfo.address.streetName,
                street_number: requestData.userInfo.address.streetNumber,
            };
        } else {
            // Para métodos que no son delivery, el costo de envío es 0
            preferenceData.shipments = {
                cost: 0,
                mode: "not_specified",
            };
        }

        const response = await payment.create({
            body: preferenceData,
        });

        // console.log("MercadoPago preference created:", response);
        return NextResponse.json({
            inicioPago: response.init_point,
            preferenceId: response.id,
            status: 200,
        });
    } catch (error) {
        console.error("Error creating MercadoPago preference:", error);

        return NextResponse.json({
            error: "Ocurrió un error al procesar tu solicitud de pago.",
            status: 500,
        });
    }
}
