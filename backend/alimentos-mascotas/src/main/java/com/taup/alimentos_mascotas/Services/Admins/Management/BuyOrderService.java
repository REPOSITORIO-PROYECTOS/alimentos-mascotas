package com.taup.alimentos_mascotas.Services.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Exceptions.MonoEx;
import com.taup.alimentos_mascotas.Models.Admins.Management.BuyOrder;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.BuyOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BuyOrderService {

	private final BuyOrderRepository buyOrderRepo;
	private final  WorkOrderService workOrderService;

	@Transactional(readOnly = true)
	public Mono<PagedResponse<BuyOrder>> listAllPaged(int page, int size, String keyword, LocalDate startDate, LocalDate endDate) {
		PageRequest pageRequest = PageRequest.of(page, size);

		if (endDate.isBefore(startDate)) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "La fecha de finalizacion debe ser despues de la fecha de inicio");
		}

		if (keyword != null && !keyword.isEmpty()) {
			return getBuyOrdersByKeyword(pageRequest, keyword, startDate, endDate);
		}

		return getAllBuyOrdersPaged(pageRequest);
	}


	@Transactional(readOnly = true)
	public Flux<BuyOrder> findAll() {
		return buyOrderRepo.findAll();
	}


	@Transactional
	public Mono<BuyOrder> save(BuyOrder buyOrder, String username) {
		if (buyOrder.getId() != null) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "La orden de compra ya tiene ID, no puede almacenarse como nueva");
		}

		buyOrder.setCreatedAt(LocalDateTime.now());
		buyOrder.setCreatedBy(username);

		return buyOrderRepo.save(buyOrder)
				.onErrorResume(error -> {
					return MonoEx.monoError(HttpStatus.BAD_REQUEST, error.getMessage());
				});
	}


	@Transactional
	public Mono<BuyOrder> update(BuyOrder buyOrder, String buyOrderId, String username) {
		if (!buyOrder.getId().equals(buyOrderId)) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST,
					"Los IDs de las ordenes de compra actualizar no coinciden.");
		}

		return buyOrderRepo.findById(buyOrderId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró ña orden de compra con ID: " + buyOrderId))
				.flatMap(existingBuyOrder -> {
					BuyOrder updatedBuyOrder = mappingBuyOrderToUpdate(existingBuyOrder, buyOrder, username);
					
					return buyOrderRepo.save(updatedBuyOrder);
				});
	}

	@Transactional
	public Mono<Void> delete (String workOrderId){
		return buyOrderRepo.deleteById(workOrderId);
	}

	// @Transactional
	// public Mono<BuyOrder> saveWithWorkOrder(BuyOrder buyOrder, String username) {
	// 	if (buyOrder.getId() != null) {
	// 		return MonoEx.monoError(HttpStatus.BAD_REQUEST, "La orden de compra ya tiene ID, no puede almacenarse como nueva");
	// 	}

	// 	buyOrder.setCreatedAt(LocalDateTime.now());
	// 	buyOrder.setCreatedBy(username);

	// 	return workOrderService.createWorkOrderFromBuyOrder(buyOrder)
	// 			.then(buyOrderRepo.save(buyOrder))
	// 			.onErrorResume(error -> {
	// 				return MonoEx.monoError(HttpStatus.BAD_REQUEST, error.getMessage());
	// 			});
	// }

	// ? Metodos locales

	private BuyOrder mappingBuyOrderToUpdate(BuyOrder existingBuyOrder, BuyOrder buyOrder, String username) {
		existingBuyOrder.setAddress(buyOrder.getAddress());
		existingBuyOrder.setTotalAmount(buyOrder.getTotalAmount());
		existingBuyOrder.setProducts(buyOrder.getProducts());
		existingBuyOrder.setPaymentMethod(buyOrder.getPaymentMethod());
		existingBuyOrder.setOrderDate(buyOrder.getOrderDate());
		existingBuyOrder.setStatus(buyOrder.getStatus());
		existingBuyOrder.setShippingMethod(buyOrder.getShippingMethod());
		existingBuyOrder.setEstimatedDeliveryDate(buyOrder.getEstimatedDeliveryDate());
		existingBuyOrder.setDiscountAmount(buyOrder.getDiscountAmount());
		existingBuyOrder.setCouponCode(buyOrder.getCouponCode());
		existingBuyOrder.setCustomerId(buyOrder.getCustomerId());
		existingBuyOrder.setPaymentReference(buyOrder.getPaymentReference());
		existingBuyOrder.setCustomerNotes(buyOrder.getCustomerNotes());
		existingBuyOrder.setUpdatedAt(LocalDateTime.now());
		existingBuyOrder.setModifiedBy(username);

		return existingBuyOrder;
	}


	private Mono<PagedResponse<BuyOrder>> getAllBuyOrdersPaged(PageRequest pageRequest) {
		Mono<Long> totalElements = buyOrderRepo.count();
		Flux<BuyOrder> buyOrderFlux = buyOrderRepo.findBuyOrdersPaged(pageRequest);

		return Mono.zip(totalElements, buyOrderFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

	private Mono<PagedResponse<BuyOrder>> getBuyOrdersByKeyword(PageRequest pageRequest, String keyword, LocalDate startDate, LocalDate endDate) {
		Mono<Long> totalElements = buyOrderRepo.countByKeywordAndDate(keyword, startDate, endDate);
		Flux<BuyOrder> buyOrderFlux = buyOrderRepo.findByKeywordAndDate(keyword, startDate, endDate, pageRequest);

		return Mono.zip(totalElements, buyOrderFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

}
