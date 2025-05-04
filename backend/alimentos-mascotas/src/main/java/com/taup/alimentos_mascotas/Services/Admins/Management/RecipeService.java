package com.taup.alimentos_mascotas.Services.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Exceptions.MonoEx;
import com.taup.alimentos_mascotas.Models.Admins.Management.Recipe;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.ProductRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.RecipeRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@AllArgsConstructor
public class RecipeService {

	private final RecipeRepository recipeRepo;
	private final ProductRepository productRepo;

	@Transactional(readOnly = true)
	public Mono<PagedResponse<Recipe>> listAllPaged(int page, int size, String keyword) {
		PageRequest pageRequest = PageRequest.of(page, size);

		if(keyword != null && !keyword.isEmpty()){
			return getRecipesByKeyword(pageRequest, keyword);
		}

		return getAllRecipesPaged(pageRequest);
	}

	@Transactional(readOnly = true)
	public Flux<Recipe> findAll (){
		return recipeRepo.findAll();
	}

	@Transactional
	public Mono<Recipe> save (Recipe recipe, String username){
		if(recipe.getId()!=null){
			return MonoEx.monoError(HttpStatus.BAD_REQUEST, "La Receta ya tiene ID, no puede almacenarse como nueva");
		}

		recipe.setCreatedAt(LocalDateTime.now());
		recipe.setCreatedBy(username);

		return recipeRepo.save(recipe);
	}

	@Transactional
	public Mono<Recipe> update (Recipe recipe, String recipeId, String username) {
		if (!recipe.getId().equals(recipeId)) {
			return MonoEx.monoError(HttpStatus.BAD_REQUEST,
					"Los IDs de la receta a actualizar no coinciden.");
		}

		return recipeRepo.findById(recipeId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontró la receta con ID: " + recipeId))
				.flatMap(existingRecipe -> {
							Recipe updatedRecipe = mappingRecipeToUpdate(existingRecipe, recipe, username);
							return recipeRepo.save(updatedRecipe);
						});
	}

	@Transactional
	public Mono<Recipe> addProductToRecipe (String recipeId, String productId) {
		return recipeRepo.findById(recipeId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontro la receta con ID: " + recipeId))
				.flatMap(foundRecipe -> productRepo.findById(productId)
								.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontro el producto con ID: " + productId))
								.flatMap(foundProduct -> {
									Set<String> productsList = foundRecipe.getCreatedProducts();
									if(productsList == null) {
										productsList = new HashSet<>();
									}
									productsList.add(productId);
									foundProduct.setRecipeId(recipeId);

									foundRecipe.setCreatedProducts(productsList);

									return productRepo.save(foundProduct)
											.then(recipeRepo.save(foundRecipe));
								})
						);
	}

	@Transactional
	public Mono<Recipe> removeProductFromRecipe (String recipeId, String productId) {
		return recipeRepo.findById(recipeId)
				.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontro la receta con ID: " + recipeId))
				.flatMap(foundRecipe -> productRepo.findById(productId)
						.switchIfEmpty(MonoEx.monoError(HttpStatus.NOT_FOUND, "No se encontro el producto con ID: " + productId))
						.flatMap(foundProduct -> {

							Set<String> productsList = foundRecipe.getCreatedProducts();

							if(productsList == null) {
								return MonoEx.monoError(HttpStatus.BAD_REQUEST, "No hay productos en la lista");
							}
							productsList.remove(productId);
							foundProduct.setRecipeId(null);

							return productRepo.save(foundProduct)
									.then(recipeRepo.save(foundRecipe));
						})
				);
	}

	@Transactional
	public Mono<Void> delete(String recipeId) {
		return productRepo.findByRecipeId(recipeId)
				.flatMap(product -> {
					product.setRecipeId(null);
					return productRepo.save(product);
				})
				.then(recipeRepo.deleteById(recipeId));
	}


	// ? Métodos locales

	private Recipe mappingRecipeToUpdate(Recipe existingRecipe, Recipe recipe, String username) {
		existingRecipe.setModifiedBy(username);
		existingRecipe.setUpdatedAt(LocalDateTime.now());
		existingRecipe.setRecipeDescription(recipe.getRecipeDescription());
		existingRecipe.setRecipeName(recipe.getRecipeName());
		existingRecipe.setInstructions(recipe.getInstructions());
		existingRecipe.setIngredientsWithQuantity(recipe.getIngredientsWithQuantity());
		existingRecipe.setEstimatedPrepTime(recipe.getEstimatedPrepTime());
		existingRecipe.setEstimatedServings(recipe.getEstimatedServings());

		return existingRecipe;
	}


	private Mono<PagedResponse<Recipe>> getAllRecipesPaged(PageRequest pageRequest) {
		Mono<Long> totalElements = recipeRepo.count();
		Flux<Recipe> recipesFlux = recipeRepo.findRecipesPaged(pageRequest);

		return Mono.zip(totalElements, recipesFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

	private Mono<PagedResponse<Recipe>> getRecipesByKeyword(PageRequest pageRequest, String keyword) {
		Mono<Long> totalElements = recipeRepo.countByKeyword(keyword);
		Flux<Recipe> recipesFlux = recipeRepo.findByKeyword(keyword, pageRequest);

		return Mono.zip(totalElements, recipesFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

}

