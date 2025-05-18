package com.taup.alimentos_mascotas.Controllers.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Management.Recipe;
import com.taup.alimentos_mascotas.Services.Admins.Management.RecipeService;
import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/recetas")
@AllArgsConstructor
public class RecipeController {
	
	private final RecipeService recipeService;

	@GetMapping("/pagina")
	public Mono<PagedResponse<Recipe>> getPagedResponse(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(required = false) String keyword) {
		return recipeService.listAllPaged(page, size, keyword);
	}

	@GetMapping("/obtener-todas")
	public Flux<Recipe> findAllRecipes() {
		return recipeService.findAll();
	}

	@PostMapping("/guardar")
	public Mono<ResponseEntity<Recipe>> save(Authentication auth, @RequestBody Recipe recipe){
		String username = auth.getName();
		return recipeService.save(recipe, username)
				.map(savedRecipe -> ResponseEntity.status(HttpStatus.CREATED).body(savedRecipe))
				.onErrorResume(error -> {
					System.err.println("Error al guardar la receta: " + error.getMessage());
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
				});
	}

	@PutMapping("/editar/{recipeId}")
	public Mono<ResponseEntity<Recipe>> update(Authentication auth, @RequestBody Recipe recipe, @PathVariable String recipeId){
		String username = auth.getName();
		return recipeService.update(recipe, recipeId, username)
				.map(updatedRecipe -> ResponseEntity.status(HttpStatus.OK).body(updatedRecipe))
				.onErrorResume(error -> {
					System.err.println("Error al guardar la receta: " + error.getMessage());
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
				});
	}


	@PutMapping("/{recipeId}/agregar-proveedor/{productId}")
	public Mono<ResponseEntity<Recipe>> addProvider(Authentication auth, @PathVariable String productId, @PathVariable String recipeId) {
		String username = auth.getName();
		return recipeService.addProductToRecipe(recipeId, productId, username)
				.map(ingredient -> ResponseEntity.status(HttpStatus.OK).body(ingredient))
				.onErrorResume((error -> {
					System.err.println("Error al guardar el ingrediente: " + error.getMessage());
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
				}));
	}

	@PutMapping("/{recipeId}/quitar-proveedor/{productId}")
	public Mono<ResponseEntity<Recipe>> removeProvider(Authentication auth, @PathVariable String productId, @PathVariable String recipeId) {
		String username = auth.getName();
		return recipeService.removeProductFromRecipe(recipeId, productId, username)
				.map(ingredient -> ResponseEntity.status(HttpStatus.OK).body(ingredient))
				.onErrorResume((error -> {
					System.err.println("Error al guardar el ingrediente: " + error.getMessage());
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
				}));
	}

	@DeleteMapping("/eliminar/{recipeId}")
	public Mono<ResponseEntity<Void>> deleteRecipe (@PathVariable String recipeId) {
		return recipeService.delete(recipeId)
				.then(Mono.just(ResponseEntity.noContent().<Void>build()))
				.onErrorMap(e -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Error al eliminar la receta con ID: " + recipeId));
	}
}
