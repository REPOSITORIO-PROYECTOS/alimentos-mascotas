package com.taup.alimentos_mascotas.Controllers.Admins.FrontSide;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.DTO.ProductFrontDTO;
import com.taup.alimentos_mascotas.Services.Admins.FrontSide.ProductFrontService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductFrontController {

	private final ProductFrontService productFrontService;

	@GetMapping("/pagina")
	public Mono<PagedResponse<ProductFrontDTO>> listAllPaged(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(required = false) String keyword) {
		return productFrontService.listAllPaged(page, size, keyword);
	}

	@GetMapping("/{productId}")
	public Mono<ProductFrontDTO> getProduct(@PathVariable String productId) {
		return productFrontService.getProduct(productId);
	}
}