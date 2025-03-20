package com.taup.alimentos_mascotas.Controllers.Admins.Finance;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.taup.alimentos_mascotas.DTO.CartRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mercadopago")
public class MercadoPagoController {

	@PostMapping
	public String mercadopagoPayment(@RequestBody CartRequestDTO cartRequestDTO) throws MPException, MPApiException {
		MercadoPagoConfig.setAccessToken("TEST-722495920164756-030515-fdf7ee0f93f17da1bdd65163d0b6ec09-264392580");

		// Construir las URLs de retorno
		PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
				.success("https://www.google.com")
				.pending("https://www.youtube.com")
				.failure("https://www.instagram.com")
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

	@PostMapping("/notificaciones")
	public ResponseEntity<String> handleNotification(@RequestBody Map<String, Object> payload) {
		// Extraer datos del payload
		String action = (String) payload.get("action");
		Map<String, Object> data = (Map<String, Object>) payload.get("data");

		if (action != null && data != null) {
			String paymentId = (String) data.get("id");
			String status = (String) data.get("status");
			String externalReference = (String) data.get("external_reference");

			// Solo procesar si el pago fue aprobado
			if ("payment.updated".equals(action) && "approved".equals(status)) {
				//TODO:
				// Recuperar el carrito de compra usando el externalReference
				// (Aquí deberías tener una lógica para recuperar el carrito asociado al externalReference)
				CartRequestDTO carrito = recuperarCarritoPorExternalReference(externalReference);

				if (carrito != null) {
					//TODO:
					// Guardar la compra en la base de datos

					return ResponseEntity.ok("Compra registrada exitosamente");
				}
			}
		}

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Notificación no procesada");
	}

	private CartRequestDTO recuperarCarritoPorExternalReference(String externalReference) {
		//TODO:
		// Lógica para recuperar el carrito de compra asociado al externalReference
		// (usar una base de datos en memoria, Redis, o cualquier otro almacenamiento temporal)
		return null;
	}
}
