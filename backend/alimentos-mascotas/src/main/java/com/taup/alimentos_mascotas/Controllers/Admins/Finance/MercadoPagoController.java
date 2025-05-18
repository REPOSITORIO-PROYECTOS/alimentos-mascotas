package com.taup.alimentos_mascotas.Controllers.Admins.Finance;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.taup.alimentos_mascotas.DTO.CartItemDTO;
import com.taup.alimentos_mascotas.DTO.CartRequestDTO;
import com.taup.alimentos_mascotas.Models.Admins.Management.BuyOrder;
import com.taup.alimentos_mascotas.Services.Admins.Management.BuyOrderService;
import com.taup.alimentos_mascotas.Utils.OrderStatus;

import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mercadopago")
@AllArgsConstructor
public class MercadoPagoController {

    private final BuyOrderService buyOrderService;

    @PostMapping("/pago")
    public String mercadopagoPayment(@RequestBody CartRequestDTO cartRequestDTO) throws MPException, MPApiException {
        MercadoPagoConfig.setAccessToken("TEST-4758573037271180-050618-e42effc56e9b69d5b0b07a46803ddd15-716971446");

        // Construir las URLs de retorno
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success("https://barker.sistemataup.com/api/mercadopago/pago-exitoso")
                .pending("https://barker.sistemataup.com/api/mercadopago/pago-en-proceso")
                .failure("https://barker.sistemataup.com/api/mercadopago/pago-fallido")
                .build();

        // Convertir los ítems del DTO a PreferenceItemRequest
        List<PreferenceItemRequest> items = cartRequestDTO.getItems().stream()
                .map(itemDTO -> PreferenceItemRequest.builder()
                        .id(itemDTO.getId())
                        .title(itemDTO.getTitle())
                        .description(itemDTO.getDescription())
                        .pictureUrl(itemDTO.getPictureUrl())
                        .categoryId(itemDTO.getCategoryId())
                        .quantity(itemDTO.getQuantity())
                        .currencyId(itemDTO.getCurrencyId())
                        .unitPrice(itemDTO.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        // Crear la solicitud de preferencia
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
				.notificationUrl("https://barker.sistemataup.online/api/mercadopago/notificaciones")
                .build();

        // Crear la preferencia en MercadoPago
        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        // Devolver el enlace de pago (sandbox o producción)
        return preference.getSandboxInitPoint();
        // ! para produccion
        // return preference.getInitPoint();
    }

    @GetMapping("/pago-exitoso")
    public ResponseEntity<String> pagoExitoso(
            @RequestParam("collection_id") String collectionId,
            @RequestParam("collection_status") String collectionStatus,
            @RequestParam("external_reference") String externalReference,
            @RequestParam("payment_type") String paymentType,
            @RequestParam("preference_id") String preferenceId,
            @RequestParam("site_id") String siteId) {

        //TODO:
        // Guardar los datos en la base de datos
        // Guardar en la base de datos (usando JPA, por ejemplo)

        return ResponseEntity.ok("Pago registrado exitosamente");
    }

    @GetMapping("/pago-en-proceso")
    public ResponseEntity<String> pagoEnProceso(
            @RequestParam("collection_id") String collectionId,
            @RequestParam("collection_status") String collectionStatus,
            @RequestParam("external_reference") String externalReference,
            @RequestParam("payment_type") String paymentType,
            @RequestParam("preference_id") String preferenceId,
            @RequestParam("site_id") String siteId) {

        //TODO:
        // Guardar en la base de datos el estado "En Proceso"
        // Aquí podrías actualizar la base de datos con el estado "pendiente" o "en proceso" de la compra

        return ResponseEntity.ok("Pago en proceso, esperando confirmación.");
    }

    @GetMapping("/pago-fallido")
    public ResponseEntity<String> pagoFallido(
            @RequestParam("collection_id") String collectionId,
            @RequestParam("collection_status") String collectionStatus,
            @RequestParam("external_reference") String externalReference,
            @RequestParam("payment_type") String paymentType,
            @RequestParam("preference_id") String preferenceId,
            @RequestParam("site_id") String siteId) {

        //TODO:
        // Guardar en la base de datos el estado "Fallido"
        // Aquí podrías actualizar la base de datos con el estado "fallido" de la compra

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Pago fallido, intente nuevamente.");
    }
    
    @PostMapping("/notificaciones")
    public ResponseEntity<String> handleNotification(@RequestBody Map<String, Object> payload) {
        // Extraer datos del payload
        String action = (String) payload.get("action");
        Map<String, Object> data = (Map<String, Object>) payload.get("data");
    System.out.println(action);
        if (action != null && data != null) {
            String paymentId = (String) data.get("id");
            String status = (String) data.get("status");
            String paymentReference = (String) data.get("external_reference");
            // Solo procesar si el pago fue aprobado
            if ("payment.updated".equals(action)) {
                System.out.println("------------------------------DENTRO DEL SEGUNDO IF-------------------------");
                // Aquí obtenemos los detalles de los items directamente desde el payload
                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                if (items != null && !items.isEmpty()) {
                    System.out.println("------------------------------DENTRO DEL TERCER IF-------------------------");
                    // Convertir los items en CartItemDTO
                    List<CartItemDTO> productos = new ArrayList<>();
                    BigDecimal totalAmount = BigDecimal.ZERO;

                    for (Map<String, Object> item : items) {
                        // Extraer los detalles de cada ítem
                        String itemId = (String) item.get("id");
                        String itemTitle = (String) item.get("title");
                        String itemDescription = (String) item.get("description");
                        String itemPictureUrl = (String) item.get("picture_url");
                        String itemCategoryId = (String) item.get("category_id");
                        int itemQuantity = ((Double) item.get("quantity")).intValue();
                        String itemCurrencyId = (String) item.get("currency_id");
                        BigDecimal itemUnitPrice = new BigDecimal((Double) item.get("unit_price"));

                        // Agregar el ítem a la lista
                        CartItemDTO cartItem = new CartItemDTO();
                        cartItem.setId(itemId);
                        cartItem.setTitle(itemTitle);
                        cartItem.setDescription(itemDescription);
                        cartItem.setPictureUrl(itemPictureUrl);
                        cartItem.setCategoryId(itemCategoryId);
                        cartItem.setQuantity(itemQuantity);
                        cartItem.setCurrencyId(itemCurrencyId);
                        cartItem.setUnitPrice(itemUnitPrice);

                        // Agregar al total
                        totalAmount = totalAmount.add(itemUnitPrice.multiply(BigDecimal.valueOf(itemQuantity)));

                        productos.add(cartItem);
                    }

                    // Crear un nuevo pedido (BuyOrder) con los detalles del pago y los ítems
                    BuyOrder buyOrder = new BuyOrder();
                    buyOrder.setId(paymentId);  // ID del pago
                    buyOrder.setTotalAmount(totalAmount);  // Monto total de la compra
                    buyOrder.setIsPaid(true);  // El pago fue aprobado
                    buyOrder.setProducts(this.mapItemsToProductsMap(productos));  // Mapa de productos
                    buyOrder.setPaymentReference(paymentReference);  // Referencia de pago
                    buyOrder.setOrderDate(LocalDateTime.now());  // Fecha de creación del pedido
                    buyOrder.setStatus(OrderStatus.COMPLETED);  // Estado del pedido (PAGADO)
                    buyOrder.setShippingMethod("Standard");  // Método de envío (esto puede cambiar)
                    buyOrder.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(7));  // Fecha estimada de entrega (puedes ajustar esto)
                    buyOrder.setDiscountAmount(BigDecimal.ZERO);  // Sin descuento (puedes ajustarlo)
                    buyOrder.setCouponCode("");  // Código de cupón (puedes ajustarlo)
                    buyOrder.setCustomerId("customerId_placeholder");  // ID del cliente (debes proporcionarlo)
                    buyOrder.setCustomerNotes("No hay notas del cliente");  // Notas del cliente (puedes ajustarlo)

                    // Guardar el pedido en la base de datos
                    buyOrder.setCreatedAt(LocalDateTime.now());
                    buyOrder.setCreatedBy("admin");  // Este es un ejemplo, ajusta según tu lógica
                    buyOrder.setModifiedBy("admin");  // Este es un ejemplo, ajusta según tu lógica

                    // Llamar al servicio de compras para guardar el pedido
                    buyOrderService.save(buyOrder, "Cliente");

                    return ResponseEntity.ok("Compra registrada exitosamente");
                }
            }
        }

        // Si la notificación no fue procesada correctamente
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación no procesada");
    }


    // @PostMapping("/notificaciones")
    // public ResponseEntity<String> handleNotification(@RequestBody Map<String, Object> payload) {
    //     // Extraer datos del payload
    //     String action = (String) payload.get("action");
    //     Map<String, Object> data = (Map<String, Object>) payload.get("data");

    //     if (action != null && data != null) {
    //         String paymentId = (String) data.get("id");
    //         String status = (String) data.get("status");
    //         String externalReference = (String) data.get("external_reference");

    //         // Solo procesar si el pago fue aprobado
    //         if ("payment.updated".equals(action)) {
    //             // Recuperar el carrito de compra usando el externalReference
    //             // (Aquí deberías tener una lógica para recuperar el carrito asociado al externalReference)
    //             CartRequestDTO carrito = recuperarCarritoPorExternalReference(externalReference);

    //             if (carrito != null) {
    //                 //TODO:
    //                 // Guardar la compra en la base de datos

    //                 return ResponseEntity.ok("Compra registrada exitosamente");
    //             }
    //         }
    //     }

    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación no procesada");
    // }

    private CartRequestDTO recuperarCarritoPorExternalReference(String externalReference) {
        //TODO:
        // Lógica para recuperar el carrito de compra asociado al externalReference
        // (usar una base de datos en memoria, Redis, o cualquier otro almacenamiento temporal)
        return null;
    }

    // Método auxiliar para convertir los ítems de CartItemDTO a Map<String, Number>
    private Map<String, Number> mapItemsToProductsMap(List<CartItemDTO> items) {
        Map<String, Number> productsMap = new HashMap<>();
        for (CartItemDTO item : items) {
            productsMap.put(item.getId(), item.getQuantity());
        }
        return productsMap;
    }

}
