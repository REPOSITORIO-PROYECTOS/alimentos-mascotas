package com.taup.alimentos_mascotas.Controllers.Admins.Finance;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Finance.Provider;
import com.taup.alimentos_mascotas.Services.Admins.Finance.ProviderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/proveedores")
@Tag(name = "Provider Controller", description = "Controlador para la gestión de proveedores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProviderController {
	private final ProviderService providerService;

	@GetMapping("/paged")
	public Mono<PagedResponse<Provider>> getInvoicesPaged(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		return providerService.getProvidersPaged(page, size);
	}

	@Operation(summary = "Obtener proveedor por ID", description = "Retorna la información de un proveedor específico por su ID")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Proveedor obtenido exitosamente"),
			@ApiResponse(responseCode = "404", description = "Proveedor no encontrado")
	})
	@GetMapping("/{providerId}")
	public Mono<ResponseEntity<Provider>> getProviderById(
			@Parameter(description = "ID del proveedor a buscar", required = true) @PathVariable String providerId) {
		return providerService.getProviderById(providerId)
				.map(ResponseEntity::ok);
	}

	@Operation(summary = "Registrar un nuevo proveedor", description = "Crea un nuevo proveedor en el sistema")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Proveedor creado exitosamente"),
			@ApiResponse(responseCode = "400", description = "Solicitud inválida")
	})
	@PostMapping
	public Mono<ResponseEntity<Provider>> saveProvider(
			@RequestBody Provider provider) {

		String user = "admin";

		return providerService.saveProvider(provider, user)
				.map(savedProvider -> ResponseEntity.status(HttpStatus.CREATED).body(savedProvider));
	}

	@Operation(summary = "Actualizar proveedor por ID", description = "Actualiza los datos de un proveedor existente")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Proveedor actualizado exitosamente"),
			@ApiResponse(responseCode = "400", description = "IDs no coinciden o solicitud inválida"),
			@ApiResponse(responseCode = "404", description = "Proveedor no encontrado")
	})
	@PutMapping("/{providerId}")
	public Mono<ResponseEntity<Provider>> updateProvider(
			@RequestBody Provider provider,
			@PathVariable String providerId) {

		String user = "admin";

		return providerService.updateProvider(provider, providerId, user)
				.map(updatedProvider -> ResponseEntity.ok(updatedProvider));
	}

	@Operation(summary = "Eliminar proveedor por ID", description = "Elimina un proveedor del sistema")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Proveedor eliminado exitosamente"),
			@ApiResponse(responseCode = "404", description = "Proveedor no encontrado")
	})
	@DeleteMapping("/{providerId}")
	public Mono<ResponseEntity<Void>> deleteProvider(
			@Parameter(description = "ID del proveedor a eliminar", required = true) @PathVariable String providerId) {
		return providerService.deleteProvider(providerId)
				.then(Mono.just(ResponseEntity.noContent().build()));
	}
}