package com.taup.alimentos_mascotas.Controllers.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.DTO.ProductDTO;
import com.taup.alimentos_mascotas.DTO.ProductWithImageDTO;
import com.taup.alimentos_mascotas.Models.Admins.Management.Product;
import com.taup.alimentos_mascotas.Services.Admins.Management.ProductService;
import lombok.AllArgsConstructor;

import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.core.Authentication;
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

	@GetMapping("/obtener-todos")
	public Flux<Product> findAll() {
		return productService.findAll();
	}

	@GetMapping("/obtener/{productId}")
	public Mono<Product> getProduct(@PathVariable String productId) {
		return productService.getById(productId);
	}
	

	// @PostMapping("/guardar")
	// public Mono<Product> save(Authentication auth, 
	// 						  @RequestPart("product") Mono<ProductDTO> productDTO,
    //                           @RequestPart("image") Mono<FilePart> image) {
	// 	String username = auth.getName();
		
	// 	return productService.save(productDTO, username, image);
	// }

	@PostMapping(value = "/guardar", consumes = "multipart/form-data")
	public Mono<Product> save(
		Authentication auth,
		@ModelAttribute ProductDTO productDTO, // todos los campos del producto, sin imagen
		@RequestPart(value = "image", required = false) Mono<FilePart> image // solo la imagen
	) {
		String username = auth.getName();
		return image
			.switchIfEmpty(Mono.empty())
			.flatMap(img -> {
				ProductWithImageDTO dtoWithImage = new ProductWithImageDTO(
					productDTO.getId(),
					productDTO.getProductName(),
					productDTO.getProductDescription(),
					productDTO.getProductDetails(),
					productDTO.getSellingPrice(),
					productDTO.getDiscountPercent(),
					productDTO.getReviewsIds(),
					productDTO.getCategories(),
					productDTO.getCostPrice(),
					productDTO.getProductCode(),
					productDTO.getRecipeId(),
					productDTO.getStock(),
					productDTO.getCreatedAt(),
					productDTO.getUpdatedAt(),
					productDTO.getModifiedBy(),
					productDTO.getCreatedBy(),
					img // FilePart image
				);
				return productService.save(dtoWithImage, username);
			});
	}

	@PutMapping(value = "/editar/{productId}", consumes = "multipart/form-data")
	public Mono<Product> update(
		Authentication auth,
		@PathVariable String productId,
		@ModelAttribute ProductDTO productDTO,
		@RequestPart(value = "image", required = false) Mono<FilePart> image
	) {
		String username = auth.getName();
		return image
			.switchIfEmpty(Mono.empty())
			.flatMap(img -> {
				ProductWithImageDTO dtoWithImage = new ProductWithImageDTO(
					productId, // Usar el id de la ruta para asegurar la actualización correcta
					productDTO.getProductName(),
					productDTO.getProductDescription(),
					productDTO.getProductDetails(),
					productDTO.getSellingPrice(),
					productDTO.getDiscountPercent(),
					productDTO.getReviewsIds(),
					productDTO.getCategories(),
					productDTO.getCostPrice(),
					productDTO.getProductCode(),
					productDTO.getRecipeId(),
					productDTO.getStock(),
					productDTO.getCreatedAt(),
					productDTO.getUpdatedAt(),
					productDTO.getModifiedBy(),
					productDTO.getCreatedBy(),
					img // FilePart image
				);
				return productService.update(dtoWithImage, productId, username);
			});
	}

	@PostMapping("/{productId}/agregar-receta/{recipeId}")
	public Mono<Product> addRecipeToProduct(@PathVariable String productId, @PathVariable String recipeId) {
		return productService.addRecipeToProduct(productId, recipeId);
	}

	@PostMapping("/{productId}/quitar-receta/{recipeId}")
	public Mono<Product> removeRecipeToProduct(@PathVariable String productId, @PathVariable String recipeId) {
		return productService.removeRecipeToProduct(productId, recipeId);
	}

	@DeleteMapping("/eliminar/{productId}")
	public Mono<Void> delete(@PathVariable String productId) {
		return productService.delete(productId);
	}
}