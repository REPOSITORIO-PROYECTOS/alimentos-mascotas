package com.taup.alimentos_mascotas.Services.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Exceptions.MonoEx;
import com.taup.alimentos_mascotas.Models.Admins.Management.PurchaseOrder;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.PurchaseOrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class PurchaseOrderService {

	private final PurchaseOrderRepository purchaseOrderRepo;

	@Transactional(readOnly = true)
	public Mono<PagedResponse<PurchaseOrder>> listAllPaged(int page, int size, String keyword,
	                                                       LocalDate startDate, LocalDate endDate) {

		PageRequest pageRequest = PageRequest.of(page, size);

		if (endDate.isBefore(startDate)) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "La fecha de finalizacion debe ser despues de la fecha de inicio");
		}

		if (keyword != null && !keyword.isEmpty()) {
			return getPurchaseOrdersByKeyword(pageRequest, keyword, startDate, endDate);
		}

		return getAllPurchaseOrdersPaged(pageRequest);
	}

	@Transactional(readOnly = true)
	public Flux<PurchaseOrder> findAll() {
		return purchaseOrderRepo.findAll();
	}

	@Transactional
	public Mono<PurchaseOrder> save(PurchaseOrder purchaseOrder, String username) {
		if (purchaseOrder.getId() != null) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "La orden de compra ya tiene ID, no puede almacenarse como nuevo");
		}

		purchaseOrder.setCreatedAt(LocalDateTime.now());
		purchaseOrder.setCreatedBy(username);
		purchaseOrder.setIsAuthorized(false);
		purchaseOrder.setAuthorizedBy("No autorizada.");

		return purchaseOrderRepo.save(purchaseOrder);
	}

	@Transactional
	public Mono<PurchaseOrder> update(PurchaseOrder purchaseOrder, String purchaseOrderId, String username) {
		if (!purchaseOrder.getId().equals(purchaseOrderId)) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST,
					"Los IDs de las ordenes a actualizar no coinciden.");
		}

		return purchaseOrderRepo.findById(purchaseOrderId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró la orden con ID: " + purchaseOrderId))
				.flatMap(existingPurchaseOrder -> {
					PurchaseOrder updatedPurchaseOrder = mappingPurchaseOrderToUpdate(existingPurchaseOrder, purchaseOrder, username);
					return purchaseOrderRepo.save(updatedPurchaseOrder);
				});
	}

	@Transactional
	public Mono<PurchaseOrder> authorizePurchaseOrder(String purchaseOrderId, String username) {
		return purchaseOrderRepo.findById(purchaseOrderId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró la Orden con ID: " + purchaseOrderId))
				.flatMap(existingPurchaseOrder -> {
					existingPurchaseOrder.setAuthorizedBy(username);
					existingPurchaseOrder.setIsAuthorized(true);
					return purchaseOrderRepo.save(existingPurchaseOrder);
				});
	}

	@Transactional
	public Mono<Void> deletePurchaseOrder(String ingredientId) {
		return purchaseOrderRepo.deleteById(ingredientId);
	}


	// ? Metodos locales


	private PurchaseOrder mappingPurchaseOrderToUpdate(PurchaseOrder existingPurchaseOrder, PurchaseOrder purchaseOrder, String username) {
		existingPurchaseOrder.setSupplierId(purchaseOrder.getSupplierId());
		existingPurchaseOrder.setSupplierName(purchaseOrder.getSupplierName());
		existingPurchaseOrder.setIngredients(purchaseOrder.getIngredients());
		existingPurchaseOrder.setTotalAmount(purchaseOrder.getTotalAmount());
		existingPurchaseOrder.setUpdatedAt(LocalDateTime.now());
		existingPurchaseOrder.setModifiedBy(username);
		existingPurchaseOrder.setOrderDate(purchaseOrder.getOrderDate());
		existingPurchaseOrder.setNotes(purchaseOrder.getNotes());
		existingPurchaseOrder.setPriority(purchaseOrder.getPriority());
		existingPurchaseOrder.setIsAuthorized(purchaseOrder.getIsAuthorized());
		existingPurchaseOrder.setAuthorizedBy(purchaseOrder.getAuthorizedBy());


		return existingPurchaseOrder;
	}

	private Mono<PagedResponse<PurchaseOrder>> getAllPurchaseOrdersPaged(PageRequest pageRequest) {
		Mono<Long> totalElements = purchaseOrderRepo.count();
		Flux<PurchaseOrder> PurchaseOrdersFlux = purchaseOrderRepo.findPurchaseOrdersPaged(pageRequest);

		return Mono.zip(totalElements, PurchaseOrdersFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

	private Mono<PagedResponse<PurchaseOrder>> getPurchaseOrdersByKeyword(PageRequest pageRequest, String keyword, LocalDate startDate, LocalDate endDate) {
		Mono<Long> totalElements = purchaseOrderRepo.countByKeywordAndDateRange(keyword, startDate, endDate);
		Flux<PurchaseOrder> purchaseOrdersFlux = purchaseOrderRepo.findByKeywordAndDateRange(keyword, startDate, endDate, pageRequest);

		return Mono.zip(totalElements, purchaseOrdersFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}
}
