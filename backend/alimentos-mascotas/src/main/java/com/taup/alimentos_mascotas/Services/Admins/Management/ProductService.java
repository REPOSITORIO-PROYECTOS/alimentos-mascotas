package com.taup.alimentos_mascotas.Services.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.DTO.ProductDTO;
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

import java.io.File;
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

	@Transactional
	// public Mono<Product> save(ProductDTO productDTO, String username, Mono<FilePart> image) {

    // if (productDTO.getId() != null) {
    //     return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto ya tiene ID, no puede almacenarse como nuevo"));
    // }

    // return imageUploadService.uploadImage(image, username)
    //     .flatMap(imageUrl -> {
	// 		Product product = new Product();
	// 		product.setId(productDTO.getId());
    //         product.setProductName(productDTO.getProductName());
    //         product.setProductDescription(productDTO.getProductDescription());
    //         product.setProductDetails(productDTO.getProductDetails());
    //         product.setProductCode(productDTO.getProductCode());
    //         product.setRecipeId(productDTO.getRecipeId());
    //         product.setStock(productDTO.getStock());
    //         product.setCostPrice(productDTO.getCostPrice());
    //         product.setDiscountPercent(productDTO.getDiscountPercent());
	// 		product.setReviewsIds(productDTO.getReviewsIds());
	// 		product.setCategories(productDTO.getCategories());
	// 		product.setSellingPrice(productDTO.getSellingPrice());
	// 		product.setUpdatedAt(LocalDateTime.now());
    //         product.setModifiedBy(username);
    //         product.setImageUrl(imageUrl);  // Asignamos la URL de la imagen
    //         product.setCreatedAt(LocalDateTime.now());  // Establecemos la fecha de creación
    //         product.setCreatedBy(username);  // Establecemos el usuario creador


    //         return productRepo.save(product);
    //     });
	// }

	public Mono<Product> save(ProductDTO productDTO, String username, Mono<FilePart> image) {
    if (productDTO.getId() != null) {
        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto ya tiene ID, no puede almacenarse como nuevo"));
    }

    return image
        .doOnNext(filePart -> {
            // Verifica si el archivo está presente
            if (filePart != null) {
                System.out.println("Archivo recibido: " + filePart.filename());
            } else {
                System.out.println("No se ha recibido ningún archivo.");
            }
        })
        .flatMap(filePart -> imageUploadService.uploadImage(filePart, username)) // Suponiendo que tu servicio espera un Mono<FilePart>
        .flatMap(imageUrl -> {
            Product product = new Product();
            // Asignación de propiedades del producto
            product.setProductName(productDTO.getProductName());
            product.setProductDescription(productDTO.getProductDescription());
            product.setProductDetails(productDTO.getProductDetails());
            product.setProductCode(productDTO.getProductCode());
            product.setRecipeId(productDTO.getRecipeId());
            product.setStock(productDTO.getStock());
            product.setCostPrice(productDTO.getCostPrice());
            product.setDiscountPercent(productDTO.getDiscountPercent());
            product.setReviewsIds(productDTO.getReviewsIds());
            product.setCategories(productDTO.getCategories());
            product.setSellingPrice(productDTO.getSellingPrice());
            product.setUpdatedAt(LocalDateTime.now());
            product.setModifiedBy(username);
            product.setImageUrl(imageUrl);  // Asignamos la URL de la imagen
            product.setCreatedAt(LocalDateTime.now());  // Establecemos la fecha de creación
            product.setCreatedBy(username);  // Establecemos el usuario creador

            return productRepo.save(product);
        });
}


	@Transactional
	public Mono<Product> update(Product product, String productId, String username) {
		if (!product.getId().equals(productId)) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "Los IDs de los productos a actualizar no coinciden.");
		}

		return productRepo.findById(productId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró el producto con ID: " + productId))
				.flatMap(existingProduct -> {
					Product updatedProduct = mappingProductToUpdate(existingProduct, product, username);
					return productRepo.save(updatedProduct);
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
