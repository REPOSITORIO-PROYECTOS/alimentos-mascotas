package com.taup.alimentos_mascotas.Controllers.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Management.WorkOrder;
import com.taup.alimentos_mascotas.Services.Admins.Management.WorkOrderService;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/ordenes-trabajo")
@AllArgsConstructor
public class WorkOrderController {

	private final WorkOrderService workOrderService;

	@GetMapping("/pagina")
	public Mono<PagedResponse<WorkOrder>> listAllPaged(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(required = false) String keyword) {
		return workOrderService.listAllPaged(page, size, keyword);
	}

	@GetMapping
	public Flux<WorkOrder> findAll() {
		return workOrderService.findAll();
	}

	@PostMapping
	public Mono<WorkOrder> save(@RequestBody WorkOrder workOrder) {
		String username = "ADMIN";

		return workOrderService.save(workOrder, username);
	}

	@PutMapping("/{id}")
	public Mono<WorkOrder> update(@PathVariable String workOrderId, @RequestBody WorkOrder workOrder) {
		String username = "ADMIN";

		return workOrderService.update(workOrder, workOrderId, username);
	}

	@PostMapping("/{workOrderId}/completar-orden")
	public Mono<WorkOrder> completeWorkOrder(@PathVariable String workOrderId, @RequestBody WorkOrder completedWorkOrder,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime finishingDate) {
		return workOrderService.completeWorkOrder(completedWorkOrder, finishingDate, workOrderId);
	}

	@DeleteMapping("/{workOrderId}")
	public Mono<Void> deleteWorkOrder(@PathVariable String workOrderId) {
		return workOrderService.delete(workOrderId);
	}
}