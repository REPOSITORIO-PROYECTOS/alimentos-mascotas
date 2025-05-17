package com.taup.alimentos_mascotas.Controllers.Admins.Finance;

import com.taup.alimentos_mascotas.DTO.InvoiceWithProviderDTO;
import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Finance.Invoice;
import com.taup.alimentos_mascotas.Services.Admins.Finance.InvoiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/facturas")
@Tag(name = "Invoice Controller", description = "Endpoints para la gestión de facturas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InvoiceController {

	private final InvoiceService invoiceService;

	@Operation(summary = "Obtener facturas paginadas", description = "Retorna una lista paginada de facturas. Se pueden especificar el número de página y el tamaño de la página.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Facturas obtenidas exitosamente"),
			@ApiResponse(responseCode = "400", description = "Parámetros de paginación inválidos")
	})
	@GetMapping("/paged")
	public Mono<PagedResponse<Invoice>> getInvoicesPaged(
			@Parameter(description = "Número de página (por defecto 0)", example = "0") @RequestParam(defaultValue = "0") int page,
			@Parameter(description = "Tamaño de la página (por defecto 10)", example = "10") @RequestParam(defaultValue = "10") int size) {
		return invoiceService.getInvoicesPaged(page, size);
	}

	@Operation(summary = "Obtener una factura con detalles", description = "Retorna los detalles de una factura específica, incluyendo información del proveedor.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Factura con detalles obtenida exitosamente"),
			@ApiResponse(responseCode = "404", description = "Factura no encontrada")
	})
	@GetMapping("/detalles/{invoiceId}")
	public Mono<ResponseEntity<InvoiceWithProviderDTO>> getInvoiceWithDetails(
			@Parameter(description = "ID de la factura a buscar", required = true, example = "12345") @PathVariable String invoiceId) {
		return invoiceService.getInvoiceWithDetails(invoiceId)
				.map(ResponseEntity::ok)
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada")));
	}

	@Operation(summary = "Registrar una nueva factura", description = "Crea una nueva factura en el sistema. El usuario que realiza la operación se registra automáticamente.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Factura creada exitosamente"),
			@ApiResponse(responseCode = "400", description = "Datos de la factura inválidos")
	})
	@PostMapping("/guardar")
	public Mono<ResponseEntity<Invoice>> saveInvoice(
			@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos de la factura a crear", required = true) @RequestBody Invoice invoice) {

		String username = "admin";

		return invoiceService.saveInvoice(invoice, username)
				.map(savedInvoice -> ResponseEntity.status(HttpStatus.CREATED).body(savedInvoice));
	}

	@Operation(summary = "Actualizar una factura", description = "Actualiza los datos de una factura existente. El ID de la factura en la ruta debe coincidir con el ID en el cuerpo de la solicitud.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Factura actualizada exitosamente"),
			@ApiResponse(responseCode = "400", description = "IDs no coinciden o datos inválidos"),
			@ApiResponse(responseCode = "404", description = "Factura no encontrada")
	})
	@PutMapping("/editar/{invoiceId}")
	public Mono<ResponseEntity<Invoice>> updateInvoice(
			@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos actualizados de la factura", required = true) @RequestBody Invoice invoice,
			@Parameter(description = "ID de la factura a actualizar", required = true, example = "12345") @PathVariable String invoiceId) {

		String user = "admin";

		return invoiceService.updateInvoice(invoice, invoiceId, user)
				.map(ResponseEntity::ok)
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada")));
	}

	@Operation(summary = "Registrar un pago de factura", description = "Efectúa un pago sobre una factura existente. El pago se registra en la caja abierta actual.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Pago realizado exitosamente"),
			@ApiResponse(responseCode = "400", description = "Solicitud inválida o caja cerrada"),
			@ApiResponse(responseCode = "404", description = "Factura no encontrada")
	})
	@PutMapping("/pagar/{invoiceId}")
	public Mono<ResponseEntity<Invoice>> doInvoicePayment(
			@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del pago a registrar", required = true) @RequestBody Invoice invoice,
			@Parameter(description = "ID de la factura a pagar", required = true, example = "12345") @PathVariable String invoiceId) {

		String user = "admin";

		return invoiceService.doInvoicePayment(invoiceId, invoice, user)
				.map(ResponseEntity::ok)
				.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada")));
	}
}