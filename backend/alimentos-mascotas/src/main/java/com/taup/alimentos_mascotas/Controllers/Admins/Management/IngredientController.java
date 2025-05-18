package com.taup.alimentos_mascotas.Controllers.Admins.Management;

import com.taup.alimentos_mascotas.DTO.PagedResponse;
import com.taup.alimentos_mascotas.Models.Admins.Management.Ingredient;
import com.taup.alimentos_mascotas.Services.Admins.Management.IngredientService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ingredientes")
@AllArgsConstructor
public class IngredientController {

	private final IngredientService ingredientService;

	@GetMapping("/pagina")
	public Mono<PagedResponse<Ingredient>> getPagedResponse(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(required = false) String keyword) {
		return ingredientService.listAllPaged(page, size, keyword);
	}

	@GetMapping("/obtener-ingredientes")
	public Flux<Ingredient> findAllIngredients() {
		return ingredientService.findAll();
	}

	@PostMapping("/guardar")
	public Mono<ResponseEntity<Ingredient>> save(Authentication auth, @RequestBody Ingredient ingredient){
		String username = auth.getName();
		return ingredientService.save(ingredient, username)
				.map(savedIngredient -> ResponseEntity.status(HttpStatus.CREATED).body(savedIngredient))
				.onErrorResume(error -> {
					System.err.println("Error al guardar el ingrediente: " + error.getMessage());
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
				});
	}

	@PutMapping("/editar/{ingredientId}")
	public Mono<ResponseEntity<Ingredient>> update(Authentication auth, @RequestBody Ingredient ingredient, @PathVariable String ingredientId){
		String username = auth.getName();
		return ingredientService.update(ingredient, ingredientId,username)
				.map(updatedIngredient -> ResponseEntity.status(HttpStatus.OK).body(updatedIngredient))
				.onErrorResume(error -> {
					System.err.println("Error al guardar el ingrediente: " + error.getMessage());
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
				});
	}

	@PutMapping("/{ingredientId}/agregar-proveedor/{providerId}")
	public Mono<ResponseEntity<Ingredient>> addProvider(Authentication auth, @PathVariable String providerId, @PathVariable String ingredientId) {
		String username = auth.getName();
		return ingredientService.addProviderToIngredient(ingredientId, providerId)
				.map(ingredient -> ResponseEntity.status(HttpStatus.OK).body(ingredient))
				.onErrorResume((error -> {
					System.err.println("Error al guardar el ingrediente: " + error.getMessage());
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
				}));
	}

	@PutMapping("/{ingredientId}/quitar-proveedor/{providerId}")
	public Mono<ResponseEntity<Ingredient>> removeProvider(Authentication auth, @PathVariable String providerId, @PathVariable String ingredientId) {
		String username = auth.getName();
		return ingredientService.removeProviderToIngredient(ingredientId, providerId)
				.map(ingredient -> ResponseEntity.status(HttpStatus.OK).body(ingredient))
				.onErrorResume((error -> {
					System.err.println("Error al guardar el ingrediente: " + error.getMessage());
					return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
				}));
	}

	@DeleteMapping("/eliminar/{ingredientId}")
	public Mono<ResponseEntity<Void>> deleteIngredient (@PathVariable String ingredientId) {
		return ingredientService.deleteIngredient(ingredientId)
			.then(Mono.just(ResponseEntity.noContent().<Void>build()))
			.onErrorMap(e -> new ResponseStatusException(HttpStatus.NOT_FOUND,
					"Error al eliminar el ingrediente con ID: " + ingredientId));
	}
}
