package com.taup.alimentos_mascotas.Controllers.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Management.PurchaseOrder;
import com.taup.alimentos_mascotas.Services.Admins.Management.PurchaseOrderService;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/ordenes-compra")
@AllArgsConstructor
public class PurchaseOrderController {

	private final PurchaseOrderService purchaseOrderService;

	@GetMapping("/pagina")
	public Mono<PagedResponse<PurchaseOrder>> listAllPaged(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(required = false) String keyword,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		return purchaseOrderService.listAllPaged(page, size, keyword, startDate, endDate);
	}

	@GetMapping("/obtener-todas")
	public Flux<PurchaseOrder> findAll() {
		return purchaseOrderService.findAll();
	}

	@PostMapping("/guardar")
	public Mono<PurchaseOrder> save(@RequestBody PurchaseOrder purchaseOrder) {
		String username = "ADMIN";

		return purchaseOrderService.save(purchaseOrder, username);
	}

	@PutMapping("/editar/{purchaseOrderId}")
	public Mono<PurchaseOrder> update(
			@PathVariable String purchaseOrderId,
			@RequestBody PurchaseOrder purchaseOrder) {
		String username = "ADMIN";

		return purchaseOrderService.update(purchaseOrder, purchaseOrderId, username);
	}

	@PostMapping("/{purchaseOrderId}/autorizar")
	public Mono<PurchaseOrder> authorizePurchaseOrder(
			@PathVariable String purchaseOrderId) {
		String username = "ADMIN";

		return purchaseOrderService.authorizePurchaseOrder(purchaseOrderId, username);
	}

	@DeleteMapping("/eliminar/{purchaseOrderId}")
	public Mono<Void> deletePurchaseOrder(@PathVariable String purchaseOrderId) {
		return purchaseOrderService.deletePurchaseOrder(purchaseOrderId);
	}
}
