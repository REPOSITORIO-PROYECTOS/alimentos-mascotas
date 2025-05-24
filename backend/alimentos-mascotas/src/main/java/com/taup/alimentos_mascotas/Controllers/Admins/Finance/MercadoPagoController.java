package com.taup.alimentos_mascotas.Controllers.Admins.Finance;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.AddressRequest;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.common.PhoneRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.common.Address;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.taup.alimentos_mascotas.DTO.CartItemDTO;
import com.taup.alimentos_mascotas.DTO.CartRequestDTO;
import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.DTO.UserInfo;
import com.taup.alimentos_mascotas.Models.Admins.Finance.MP.PaymentRequest;
import com.taup.alimentos_mascotas.Models.Admins.Management.BuyOrder;
import com.taup.alimentos_mascotas.Models.Profiles.User;
import com.taup.alimentos_mascotas.Services.Admins.Finance.BuyOrderByMercadoPagoService;
import com.taup.alimentos_mascotas.Services.Admins.Management.BuyOrderService;
import com.taup.alimentos_mascotas.Utils.OrderStatus;

import lombok.AllArgsConstructor;
import reactor.core.publisher.Mono;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
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
    private final BuyOrderByMercadoPagoService buyOrderByMercadoPagoService;

    @GetMapping("/pagos/pagina")
    public Mono<PagedResponse<PaymentRequest>> listAllPaymentsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword) {
        return buyOrderByMercadoPagoService.listAllPaged(page, size, keyword);
    }

    @GetMapping("/pagos/{paymentId}")
    public Mono<PaymentRequest> getPaymentById(@PathVariable String paymentId) {
        return buyOrderByMercadoPagoService.getById(paymentId);
    }

    @PostMapping("/pago")
    public Mono<PaymentRequest> registrarPago(@RequestBody PaymentRequest paymentRequest){
        return buyOrderByMercadoPagoService.save(paymentRequest);
    }
    

//     @PostMapping("/pago")
//     //@RequestPart("user") UserInfo userInfo, 
//     public String mercadopagoPayment(@RequestBody CartRequestDTO cartRequestDTO) throws MPException, MPApiException {
//         //MercadoPagoConfig.setAccessToken("APP_USR-374735122131330-052119-d585bca1b9aaa36be20fa3d8cac23b65-2425968859");

//         // Construir las URLs de retorno
//         PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
//                 .success("https://8222-190-176-76-254.ngrok-free.app//checkout")
//                 .pending("https://8222-190-176-76-254.ngrok-free.app//checkout")
//                 .failure("https://8222-190-176-76-254.ngrok-free.app//checkout")
//                 .build();

//         PhoneRequest phone = PhoneRequest.builder()
//                 .areaCode("+56")
//                 .number("901234567")
//                 .build();

//         IdentificationRequest identification = IdentificationRequest.builder()
//                 .type("DNI")
//                 .number("12345678")
//                 .build();

//         AddressRequest address = AddressRequest.builder()
//                 .streetName("Calle de Barker")
//                 .streetNumber("123")
//                 .zipCode("56789")
//                 .build();

//         PreferencePayerRequest payer = PreferencePayerRequest.builder()
//                 .email("barker@sistemataup.com")
//                 .name("Barker")
//                 .surname("Barker")
//                 .identification(identification)
//                 .phone(phone)
//                 .address(address)
//                 .build();

//         // Convertir los ítems del DTO a PreferenceItemRequest
//         List<PreferenceItemRequest> items = cartRequestDTO.getItems().stream()
//                 .map(itemDTO -> PreferenceItemRequest.builder()
//                         .id(itemDTO.getId())
//                         .title(itemDTO.getTitle())
//                         .description(itemDTO.getDescription())
//                         .pictureUrl(itemDTO.getPictureUrl())
//                         .categoryId(itemDTO.getCategoryId())
//                         .quantity(itemDTO.getQuantity())
//                         .currencyId(itemDTO.getCurrencyId())
//                         .unitPrice(itemDTO.getUnitPrice())
//                         .build())
//                 .collect(Collectors.toList());

//         // Crear la solicitud de preferencia
//         PreferenceRequest preferenceRequest = PreferenceRequest.builder()
//                 .items(items)
//                 //.payer(payer)
//                 .backUrls(backUrls)
// 				.notificationUrl("https://barker.sistemataup.online/api/mercadopago/notificaciones")
//                 .build();

//         // Crear la preferencia en MercadoPago
//         PreferenceClient client = new PreferenceClient();
//         Preference preference = client.create(preferenceRequest);

//         // Devolver el enlace de pago (sandbox o producción)
//         return preference.getSandboxInitPoint();
//         // ! para produccion
//         // return preference.getInitPoint();
//     }

//     @GetMapping("/pago-exitoso")
//     public ResponseEntity<String> pagoExitoso(
//             @RequestParam("collection_id") String collectionId,
//             @RequestParam("collection_status") String collectionStatus,
//             @RequestParam("external_reference") String externalReference,
//             @RequestParam("payment_type") String paymentType,
//             @RequestParam("preference_id") String preferenceId,
//             @RequestParam("site_id") String siteId) {

//         //TODO:
//         // Guardar los datos en la base de datos
//         // Guardar en la base de datos (usando JPA, por ejemplo)

//         return ResponseEntity.ok("Pago registrado exitosamente");
//     }

//     @GetMapping("/pago-en-proceso")
//     public ResponseEntity<String> pagoEnProceso(
//             @RequestParam("collection_id") String collectionId,
//             @RequestParam("collection_status") String collectionStatus,
//             @RequestParam("external_reference") String externalReference,
//             @RequestParam("payment_type") String paymentType,
//             @RequestParam("preference_id") String preferenceId,
//             @RequestParam("site_id") String siteId) {

//         //TODO:
//         // Guardar en la base de datos el estado "En Proceso"
//         // Aquí podrías actualizar la base de datos con el estado "pendiente" o "en proceso" de la compra

//         return ResponseEntity.ok("Pago en proceso, esperando confirmación.");
//     }

//     @GetMapping("/pago-fallido")
//     public ResponseEntity<String> pagoFallido(
//             @RequestParam("collection_id") String collectionId,
//             @RequestParam("collection_status") String collectionStatus,
//             @RequestParam("external_reference") String externalReference,
//             @RequestParam("payment_type") String paymentType,
//             @RequestParam("preference_id") String preferenceId,
//             @RequestParam("site_id") String siteId) {

//         //TODO:
//         // Guardar en la base de datos el estado "Fallido"
//         // Aquí podrías actualizar la base de datos con el estado "fallido" de la compra

//         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Pago fallido, intente nuevamente.");
//     }
    
//     // @PostMapping("/notificaciones")
//     // public ResponseEntity<String> handleNotification(@RequestBody Map<String, Object> payload)  {
//     //     String action = (String) payload.get("action");
//     // Map<String, Object> data = (Map<String, Object>) payload.get("data");
//     // System.out.println("Primera impresion: " + payload);
//     // if (data == null) {
//     //     System.out.println("Payload sin campo 'data': " + payload);
//     //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación sin campo 'data'");
//     // }

//     // Object idObj = data.get("id");
//     // if (idObj == null) {
//     //     System.out.println("Campo 'data' sin 'id': " + data);
//     //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación sin campo 'id' en 'data'");
//     // }

//     // Long paymentId;
//     // try {
//     //     if (idObj instanceof Integer) {
//     //         paymentId = ((Integer) idObj).longValue();
//     //     } else if (idObj instanceof Long) {
//     //         paymentId = (Long) idObj;
//     //     } else if (idObj instanceof String) {
//     //         paymentId = Long.parseLong((String) idObj);
//     //     } else {
//     //         throw new IllegalArgumentException("Tipo de id desconocido: " + idObj.getClass());
//     //     }
//     // } catch (Exception e) {
//     //     System.out.println("Error convirtiendo 'id' a Long: " + idObj);
//     //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error en el formato de 'id'");
//     // }

//     // PaymentClient paymentClient = new PaymentClient();
//     // Payment payment = null;
//     // try {
//     //     System.out.println("");
//     //     //payment = paymentClient.get(paymentId);
//     // } catch (Exception e) {
//     //     e.printStackTrace();
//     //     return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener el pago de MercadoPago");
//     // }
//     //     System.out.println("PAYMENT: " + payment);
//     //     System.out.println(payment);
//     //     Map<String, Object> data1 = (Map<String, Object>) payload.get("data");
//     //     System.out.println(action);
//     //     if (action != null && data != null) {
//     //         String paymentId1 = (String) data.get("id");
//     //         String event = (String) payload.get("event");
//     //         String paymentReference = (String) data.get("external_reference");
//     //         System.out.println(payload);
//     //         System.out.println(event);
//     //         // Solo procesar si el pago fue aprobado
//     //         if ("payment.approved".equals(event)) {
//     //             System.out.println("------------------------------DENTRO DEL SEGUNDO IF-------------------------");
//     //             System.out.println(data.get("items"));
//     //             // Aquí obtenemos los detalles de los items directamente desde el payload
//     //             List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
//     //             if (items != null && !items.isEmpty()) {
//     //                 System.out.println("------------------------------DENTRO DEL TERCER IF-------------------------");
//     //                 // Convertir los items en CartItemDTO
//     //                 List<CartItemDTO> productos = new ArrayList<>();
//     //                 BigDecimal totalAmount = BigDecimal.ZERO;

//     //                 for (Map<String, Object> item : items) {
//     //                     // Extraer los detalles de cada ítem
//     //                     String itemId = (String) item.get("id");
//     //                     String itemTitle = (String) item.get("title");
//     //                     String itemDescription = (String) item.get("description");
//     //                     String itemPictureUrl = (String) item.get("picture_url");
//     //                     String itemCategoryId = (String) item.get("category_id");
//     //                     int itemQuantity = ((Double) item.get("quantity")).intValue();
//     //                     String itemCurrencyId = (String) item.get("currency_id");
//     //                     BigDecimal itemUnitPrice = new BigDecimal((Double) item.get("unit_price"));

//     //                     // Agregar el ítem a la lista
//     //                     CartItemDTO cartItem = new CartItemDTO();
//     //                     cartItem.setId(itemId);
//     //                     cartItem.setTitle(itemTitle);
//     //                     cartItem.setDescription(itemDescription);
//     //                     cartItem.setPictureUrl(itemPictureUrl);
//     //                     cartItem.setCategoryId(itemCategoryId);
//     //                     cartItem.setQuantity(itemQuantity);
//     //                     cartItem.setCurrencyId(itemCurrencyId);
//     //                     cartItem.setUnitPrice(itemUnitPrice);

//     //                     // Agregar al total
//     //                     totalAmount = totalAmount.add(itemUnitPrice.multiply(BigDecimal.valueOf(itemQuantity)));

//     //                     productos.add(cartItem);
//     //                 }

//     //                 // Crear un nuevo pedido (BuyOrder) con los detalles del pago y los ítems
//     //                 BuyOrder buyOrder = new BuyOrder();
//     //                 buyOrder.setId(paymentId1);  // ID del pago
//     //                 buyOrder.setTotalAmount(totalAmount);  // Monto total de la compra
//     //                 buyOrder.setIsPaid(true);  // El pago fue aprobado
//     //                 buyOrder.setProducts(this.mapItemsToProductsMap(productos));  // Mapa de productos
//     //                 buyOrder.setPaymentReference(paymentReference);  // Referencia de pago
//     //                 buyOrder.setOrderDate(LocalDateTime.now());  // Fecha de creación del pedido
//     //                 buyOrder.setStatus(OrderStatus.COMPLETED);  // Estado del pedido (PAGADO)
//     //                 buyOrder.setShippingMethod("Standard");  // Método de envío (esto puede cambiar)
//     //                 buyOrder.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(7));  // Fecha estimada de entrega (puedes ajustar esto)
//     //                 buyOrder.setDiscountAmount(BigDecimal.ZERO);  // Sin descuento (puedes ajustarlo)
//     //                 buyOrder.setCouponCode("");  // Código de cupón (puedes ajustarlo)
//     //                 buyOrder.setCustomerId("customerId_placeholder");  // ID del cliente (debes proporcionarlo)
//     //                 buyOrder.setCustomerNotes("No hay notas del cliente");  // Notas del cliente (puedes ajustarlo)

//     //                 // Guardar el pedido en la base de datos
//     //                 buyOrder.setCreatedAt(LocalDateTime.now());
//     //                 buyOrder.setCreatedBy("admin");  // Este es un ejemplo, ajusta según tu lógica
//     //                 buyOrder.setModifiedBy("admin");  // Este es un ejemplo, ajusta según tu lógica

//     //                 // Llamar al servicio de compras para guardar el pedido
//     //                 buyOrderService.save(buyOrder, "Cliente");

//     //                 return ResponseEntity.ok("Compra registrada exitosamente");
//     //             }
//     //         }
//     //     }

//     //     // Si la notificación no fue procesada correctamente
//     //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación no procesada");
//     // }

//     @PostMapping("/notificaciones")
// public ResponseEntity<String> handleNotification(@RequestBody Map<String, Object> payload)  {
//     System.out.println("Primera impresion: " + payload);

//     String topic = (String) payload.get("topic");
//     if (topic == null) {
//         Map<String, Object> data = (Map<String, Object>) payload.get("data");
//         if (data == null) {
//             System.out.println("Payload sin campo 'data': " + payload);
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación sin campo 'data'");
//         }
//         Object idObj = data.get("id");
//         if (idObj == null) {
//             System.out.println("Campo 'data' sin 'id': " + data);
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación sin campo 'id' en 'data'");
//         }
//         Long paymentId;
//         try {
//             paymentId = Long.valueOf(idObj.toString());
//         } catch (Exception e) {
//             System.out.println("Error convirtiendo 'id' a Long: " + idObj);
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error en el formato de 'id'");
//         }
//         PaymentClient paymentClient = new PaymentClient();
//         Payment payment = null;
//         try {
//             payment = paymentClient.get(paymentId);
//         } catch (Exception e) {
//             e.printStackTrace();
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener el pago de MercadoPago");
//         }
//         System.out.println("PAYMENT: " + payment);
//         // Aquí tu lógica para procesar el pago...
//         return ResponseEntity.ok("Pago procesado correctamente");
//     } else if ("merchant_order".equals(topic)) {
//         String resourceUrl = (String) payload.get("resource");
//         System.out.println("Notificación de merchant_order, debes consultar: " + resourceUrl);
//         // Aquí puedes hacer una petición HTTP a resourceUrl para obtener la orden y sus pagos
//         // Ejemplo: usar RestTemplate o WebClient para obtener la info
//         return ResponseEntity.ok("Notificación merchant_order recibida");
//     } else {
//         System.out.println("Topic desconocido: " + topic);
//         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Topic no soportado");
//     }
// }


//     // @PostMapping("/notificaciones")
//     // public ResponseEntity<String> handleNotification(@RequestBody Map<String, Object> payload) {
//     //     // Extraer datos del payload
//     //     String action = (String) payload.get("action");
//     //     Map<String, Object> data = (Map<String, Object>) payload.get("data");

//     //     if (action != null && data != null) {
//     //         String paymentId = (String) data.get("id");
//     //         String status = (String) data.get("status");
//     //         String externalReference = (String) data.get("external_reference");

//     //         // Solo procesar si el pago fue aprobado
//     //         if ("payment.updated".equals(action)) {
//     //             // Recuperar el carrito de compra usando el externalReference
//     //             // (Aquí deberías tener una lógica para recuperar el carrito asociado al externalReference)
//     //             CartRequestDTO carrito = recuperarCarritoPorExternalReference(externalReference);

//     //             if (carrito != null) {
//     //                 //TODO:
//     //                 // Guardar la compra en la base de datos

//     //                 return ResponseEntity.ok("Compra registrada exitosamente");
//     //             }
//     //         }
//     //     }

//     //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación no procesada");
//     // }

//     private CartRequestDTO recuperarCarritoPorExternalReference(String externalReference) {
//         //TODO:
//         // Lógica para recuperar el carrito de compra asociado al externalReference
//         // (usar una base de datos en memoria, Redis, o cualquier otro almacenamiento temporal)
//         return null;
//     }

//     // Método auxiliar para convertir los ítems de CartItemDTO a Map<String, Number>
//     private Map<String, Number> mapItemsToProductsMap(List<CartItemDTO> items) {
//         Map<String, Number> productsMap = new HashMap<>();
//         for (CartItemDTO item : items) {
//             productsMap.put(item.getId(), item.getQuantity());
//         }
//         return productsMap;
//     }

}
