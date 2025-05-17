package com.taup.alimentos_mascotas.Controllers.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Management.BuyOrder;
import com.taup.alimentos_mascotas.Services.Admins.Management.BuyOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class BuyOrderController {

	private final BuyOrderService buyOrderService;

	@GetMapping("/pagina")
	public Mono<PagedResponse<BuyOrder>> listAllPaged(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String keyword,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		return buyOrderService.listAllPaged(page, size, keyword, startDate, endDate);
	}

	@GetMapping("/obtener-todas")
	public Flux<BuyOrder> findAll() {
		return buyOrderService.findAll();
	}

	@PostMapping("/guardar")
	public Mono<BuyOrder> save(@RequestBody BuyOrder buyOrder) {
		String username = "ADMIN";

		return buyOrderService.save(buyOrder, username);
	}

	@PutMapping("/editar/{buyOrderId}")
	public Mono<BuyOrder> update(@PathVariable String buyOrderId, @RequestBody BuyOrder buyOrder) {
		String username = "ADMIN";

		return buyOrderService.update(buyOrder, buyOrderId, username);
	}

	@DeleteMapping("/eliminar/{buyOrderId}")
	public Mono<Void> delete(@PathVariable String buyOrderId) {
		return buyOrderService.delete(buyOrderId);
	}
}