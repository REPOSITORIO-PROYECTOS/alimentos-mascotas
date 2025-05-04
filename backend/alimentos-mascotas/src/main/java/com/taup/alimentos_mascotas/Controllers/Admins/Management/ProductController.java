package com.taup.alimentos_mascotas.Controllers.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Management.Product;
import com.taup.alimentos_mascotas.Services.Admins.Management.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/productos")
@AllArgsConstructor
public class ProductController {

	private final ProductService productService;

	@GetMapping("/pagina")
	public Mono<PagedResponse<Product>> listAllPaged(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(required = false) String keyword) {
		return productService.listAllPaged(page, size, keyword);
	}

	@GetMapping
	public Flux<Product> findAll() {
		return productService.findAll();
	}

	@PostMapping
	public Mono<Product> save(@RequestBody Product product) {
		String username = "ADMIN";

		return productService.save(product, username);
	}

	@PutMapping("/{id}")
	public Mono<Product> update(@PathVariable String productId, @RequestBody Product product) {
		String username = "ADMIN";

		return productService.update(product, productId, username);
	}

	@PostMapping("/{productId}/agregar-receta/{recipeId}")
	public Mono<Product> addRecipeToProduct(@PathVariable String productId, @PathVariable String recipeId) {
		return productService.addRecipeToProduct(productId, recipeId);
	}

	@PostMapping("/{productId}/quitar-receta/{recipeId}")
	public Mono<Product> removeRecipeToProduct(@PathVariable String productId, @PathVariable String recipeId) {
		return productService.removeRecipeToProduct(productId, recipeId);
	}

	@DeleteMapping("/{productId}")
	public Mono<Void> delete(@PathVariable String productId) {
		return productService.delete(productId);
	}
}