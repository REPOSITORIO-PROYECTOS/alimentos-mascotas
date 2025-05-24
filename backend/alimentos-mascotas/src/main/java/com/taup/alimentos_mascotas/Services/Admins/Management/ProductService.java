package com.taup.alimentos_mascotas.Services.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.DTO.ProductDTO;
import com.taup.alimentos_mascotas.DTO.ProductWithImageDTO;
import com.taup.alimentos_mascotas.Exceptions.MonoEx;
import com.taup.alimentos_mascotas.Models.Admins.Management.Product;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.ProductRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.RecipeRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@AllArgsConstructor
public class ProductService {
	
	private final ProductRepository productRepo;
	private final RecipeRepository recipeRepo;
	private final ImageUploadService imageUploadService;

	@Transactional(readOnly = true)
	public Mono<PagedResponse<Product>> listAllPaged(int page, int size, String keyword) {
		PageRequest pageRequest = PageRequest.of(page, size);

		if(keyword != null && !keyword.isEmpty()){
			return getProductsByKeyword(pageRequest, keyword);
		}

		return getAllProductsPaged(pageRequest);
	}

	@Transactional(readOnly = true)
	public Flux<Product> findAll() {
		return productRepo.findAll();
	}

	// @Transactional
	// public Mono<Product> save(ProductDTO productDTO, String username) {

    // if (productDTO.getId() != null) {
    //     return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto ya tiene ID, no puede almacenarse como nuevo"));
    // }

	// Product product = new Product();
	// product.setId(productDTO.getId());
	// product.setProductName(productDTO.getProductName());
	// product.setProductDescription(productDTO.getProductDescription());
	// product.setProductDetails(productDTO.getProductDetails());
	// product.setProductCode(productDTO.getProductCode());
	// product.setRecipeId(productDTO.getRecipeId());
	// product.setStock(productDTO.getStock());
	// product.setCostPrice(productDTO.getCostPrice());
	// product.setDiscountPercent(productDTO.getDiscountPercent());
	// product.setReviewsIds(productDTO.getReviewsIds());
	// product.setCategories(productDTO.getCategories());
	// product.setSellingPrice(productDTO.getSellingPrice());
	// product.setUpdatedAt(LocalDateTime.now());
	// product.setModifiedBy(username);
	// product.setImageUrl("");  // Asignamos la URL de la imagen
	// product.setCreatedAt(LocalDateTime.now());  // Establecemos la fecha de creación
	// product.setCreatedBy(username);  // Establecemos el usuario creador

    // return productRepo.save(product);
        
	// }

	public Mono<Product> getById(String productId) {
		return productRepo.findById(productId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró el producto con ID: " + productId));
	}

	@Transactional
	public Mono<Product> save(ProductWithImageDTO dto, String username) {
		if (dto.getId() != null) {
			return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto ya tiene ID, no puede almacenarse como nuevo"));
		}

		FilePart imageFile = dto.getImage();
		Mono<String> imageUrlMono;
		if (imageFile != null) {
			imageUrlMono = imageUploadService.uploadImage(imageFile, username);
		} else {
			imageUrlMono = Mono.just(""); // O puedes manejarlo como Mono.empty() si prefieres
		}

		return imageUrlMono.flatMap(imageUrl -> {
			Product product = new Product();
			product.setProductName(dto.getProductName());
			product.setProductDescription(dto.getProductDescription());
			product.setProductDetails(dto.getProductDetails());
			product.setProductCode(dto.getProductCode());
			product.setRecipeId(dto.getRecipeId());
			product.setStock(dto.getStock());
			product.setCostPrice(dto.getCostPrice());
			product.setDiscountPercent(dto.getDiscountPercent());
			product.setReviewsIds(dto.getReviewsIds());
			product.setCategories(dto.getCategories());
			product.setSellingPrice(dto.getSellingPrice());
			product.setUpdatedAt(LocalDateTime.now());
			product.setModifiedBy(username);
			product.setImageUrl(imageUrl);
			product.setCreatedAt(LocalDateTime.now());
			product.setCreatedBy(username);
			return productRepo.save(product);
		});
	}


	@Transactional
	public Mono<Product> update(ProductWithImageDTO dto, String productId, String username) {
		if (!productId.equals(dto.getId())) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "Los IDs de los productos a actualizar no coinciden.");
		}

		return productRepo.findById(productId)
			.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró el producto con ID: " + productId))
			.flatMap(existingProduct -> {
				Mono<String> imageUrlMono;
				FilePart imageFile = dto.getImage();

				// Si se envía una nueva imagen, súbela; si no, conserva la actual
				if (imageFile != null) {
					imageUrlMono = imageUploadService.uploadImage(imageFile, username);
				} else {
					imageUrlMono = Mono.just(existingProduct.getImageUrl());
				}

				return imageUrlMono.flatMap(imageUrl -> {
					existingProduct.setProductName(dto.getProductName());
					existingProduct.setProductDescription(dto.getProductDescription());
					existingProduct.setProductDetails(dto.getProductDetails());
					existingProduct.setProductCode(dto.getProductCode());
					existingProduct.setRecipeId(dto.getRecipeId());
					existingProduct.setStock(dto.getStock());
					existingProduct.setCostPrice(dto.getCostPrice());
					existingProduct.setDiscountPercent(dto.getDiscountPercent());
					existingProduct.setReviewsIds(dto.getReviewsIds());
					existingProduct.setCategories(dto.getCategories());
					existingProduct.setSellingPrice(dto.getSellingPrice());
					existingProduct.setModifiedBy(username);
					existingProduct.setUpdatedAt(LocalDateTime.now());
					existingProduct.setImageUrl(imageUrl);
					// No actualices createdAt ni createdBy en una edición

					return productRepo.save(existingProduct);
				});
			});
	}

	@Transactional
	public Mono<Product> addRecipeToProduct(String productId, String recipeId) {
		return recipeRepo.findById(recipeId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encotró la receta con el ID: " + recipeId))
				.flatMap( foundRecipe -> productRepo.findById(productId)
						.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encotró el producto con ID: " + productId))
						.flatMap( foundProduct -> {
							Set<String> productIds = foundRecipe.getCreatedProducts();

							if(productIds == null) {
								productIds = new HashSet<>();
							}

							productIds.add(foundProduct.getId());
							foundProduct.setRecipeId(foundRecipe.getId());

							return recipeRepo.save(foundRecipe)
									.then(productRepo.save(foundProduct));
						}));
	}

	@Transactional
	public Mono<Product> removeRecipeToProduct(String productId, String recipeId) {
		return recipeRepo.findById(recipeId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encotró la receta con el ID: " + recipeId))
				.flatMap( foundRecipe -> productRepo.findById(productId)
						.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encotró el producto con ID: " + productId))
						.flatMap( foundProduct -> {

							Set<String> productIds = foundRecipe.getCreatedProducts();

							if(productIds == null) {
								return MonoEx.monoError(HttpStatus.BAD_REQUEST, "No hay productos en la lista");
							}

							productIds.remove(foundProduct.getId());
							foundProduct.setRecipeId(null);

							return recipeRepo.save(foundRecipe)
									.then(productRepo.save(foundProduct));
						}));
	}

	@Transactional
	public Mono<Void> delete (String productId){
		return recipeRepo.findByProductId(productId)
				.flatMap(recipe -> {

					Set<String> productsIds = recipe.getCreatedProducts();

					productsIds.remove(productId);

					recipe.setCreatedProducts(productsIds);

					return recipeRepo.save(recipe);
				})
				.then(productRepo.deleteById(productId));
	}

	// ? Metodos locales

	private Product mappingProductToUpdate(Product existingProduct, Product product, String username) {
		existingProduct.setProductCode(product.getProductCode());
		existingProduct.setProductName(product.getProductName());
		existingProduct.setRecipeId(product.getRecipeId());
		existingProduct.setProductDescription(product.getProductDescription());
		existingProduct.setStock(product.getStock());
		existingProduct.setModifiedBy(username);
		existingProduct.setUpdatedAt(LocalDateTime.now());

		return existingProduct;
	}


	private Mono<PagedResponse<Product>> getAllProductsPaged(PageRequest pageRequest) {
		Mono<Long> totalElements = productRepo.count();
		Flux<Product> productsFlux = productRepo.findProductsPaged(pageRequest);

		return Mono.zip(totalElements, productsFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

	private Mono<PagedResponse<Product>> getProductsByKeyword(PageRequest pageRequest, String keyword) {
		Mono<Long> totalElements = productRepo.countByKeyword(keyword);
		Flux<Product> productsFlux= productRepo.findByKeyword(keyword, pageRequest);
		return Mono.zip(totalElements, productsFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

}
