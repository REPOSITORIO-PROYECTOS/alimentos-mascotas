package com.taup.alimentos_mascotas.Services.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Management.Ingredient;
import com.taup.alimentos_mascotas.Repositories.Admins.Finance.ProviderRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.IngredientRepository;
import com.taup.alimentos_mascotas.Repositories.Admins.Management.RecipeRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
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
public class IngredientService {
	
	private final IngredientRepository ingredientRepo;
	private final ProviderRepository providerRepo;
	private final RecipeRepository recipeRepo;

	@Transactional(readOnly = true)
	public Mono<PagedResponse<Ingredient>> listAllPaged(int page, int size, String keyword) {
		PageRequest pageRequest = PageRequest.of(page, size);

		if(keyword != null && !keyword.isEmpty()){
			return getIngredientsByKeyword(pageRequest, keyword);
		}

		return getAllIngredientsPaged(pageRequest);
	}

	@Transactional(readOnly = true)
	public Flux<Ingredient> findAll() {
		return ingredientRepo.findAll();
	}

	@Transactional
	public Mono<Ingredient> save (Ingredient Ingredient, String username){
		if(Ingredient.getId()!=null){
			return monoError(HttpStatus.BAD_REQUEST, "El ingrediente ya tiene ID, no puede almacenarse como nuevo");
		}

		Ingredient.setCreatedAt(LocalDateTime.now());
		Ingredient.setCreatedBy(username);

		return ingredientRepo.save(Ingredient);
	}

	@Transactional
	public Mono<Ingredient> update (Ingredient Ingredient, String IngredientId, String username) {
		if (!Ingredient.getId().equals(IngredientId)) {
			return monoError(HttpStatus.BAD_REQUEST,
					"Los IDs del ingrediente a actualizar no coinciden.");
		}

		return ingredientRepo.findById(IngredientId)
				.switchIfEmpty(monoError(HttpStatus.NOT_FOUND, "No se encontró la receta con ID: " + IngredientId))
				.flatMap(existingIngredient -> {
					Ingredient updatedIngredient = mappingIngredientToUpdate(existingIngredient, Ingredient, username);
					return ingredientRepo.save(updatedIngredient);
				});
	}

	@Transactional
	public Mono<Ingredient> addProviderToIngredient(String ingredientId, String providerId) {
		return providerRepo.findById(providerId)
				.switchIfEmpty(monoError(HttpStatus.NOT_FOUND, "No se encontró el proveedor con ID: " + providerId))
				.flatMap( foundProvider -> ingredientRepo.findById(ingredientId)
						.switchIfEmpty(monoError(HttpStatus.NOT_FOUND, "No se encontro ingrediente con el ID: " + ingredientId))
						.flatMap( foundIngredient -> {
							Set<String> providersList = foundIngredient.getProviderId();

							if (providersList == null) {
								providersList = new HashSet<>();
							}
							providersList.add(foundProvider.getId());
							foundIngredient.setProviderId(providersList);

							return ingredientRepo.save(foundIngredient);
						})
				);
	}

	@Transactional
	public Mono<Ingredient> removeProviderToIngredient(String ingredientId, String providerId) {
		return providerRepo.findById(providerId)
				.switchIfEmpty(monoError(HttpStatus.NOT_FOUND, "No se encontró el proveedor con ID: " + providerId))
				.flatMap( foundProvider -> ingredientRepo.findById(ingredientId)
						.switchIfEmpty(monoError(HttpStatus.NOT_FOUND, "No se encontro ingrediente con el ID: " + ingredientId))
						.flatMap( foundIngredient -> {
							Set<String> providersList = foundIngredient.getProviderId();

							if (providersList == null) {
								return monoError(HttpStatus.BAD_REQUEST, "No hay proveedores en la lista");
							}
							providersList.remove(foundProvider.getId());
							foundIngredient.setProviderId(providersList);

							return ingredientRepo.save(foundIngredient);
						})
				);
	}

	@Transactional
	public Mono<Void> deleteIngredient(String ingredientId) {
		return recipeRepo.findByIngredientId(ingredientId)
				.flatMap(recipe -> {
					recipe.getIngredientsWithQuantity().remove(ingredientId);
					return recipeRepo.save(recipe);
				})
				.then(ingredientRepo.deleteById(ingredientId)); // Elimina el ingrediente de la base de datos
	}


	// ? Metodos locales


	private Ingredient mappingIngredientToUpdate(Ingredient existingIngredient, Ingredient ingredient, String username) {
		existingIngredient.setIngredientName(ingredient.getIngredientName());
		existingIngredient.setProviderId(ingredient.getProviderId());
		existingIngredient.setIngredientDescription(ingredient.getIngredientDescription());
		existingIngredient.setUpdatedAt(LocalDateTime.now());
		existingIngredient.setModifiedBy(username);
		existingIngredient.setMeasurementUnit(ingredient.getMeasurementUnit());

		return existingIngredient;
	}

	private Mono<PagedResponse<Ingredient>> getAllIngredientsPaged(PageRequest pageRequest) {
		Mono<Long> totalElements = ingredientRepo.count();
		Flux<Ingredient> IngredientsFlux = ingredientRepo.findIngredientsPaged(pageRequest);

		return Mono.zip(totalElements, IngredientsFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}
	
	private Mono<PagedResponse<Ingredient>> getIngredientsByKeyword(PageRequest pageRequest, String keyword) {
		Mono<Long> totalElements = ingredientRepo.countByKeyword(keyword);
		Flux<Ingredient> IngredientsFlux = ingredientRepo.findByKeyword(keyword, pageRequest);

		return Mono.zip(totalElements, IngredientsFlux.collectList())
				.map(tuple -> new PagedResponse<>(
						tuple.getT2(),
						tuple.getT1(),
						pageRequest.getPageNumber(),
						pageRequest.getPageSize()
				));
	}

	private <T> Mono<T> monoError(HttpStatus status, String message) {
		return Mono.error(new ResponseStatusException(status, message));
	}
}
