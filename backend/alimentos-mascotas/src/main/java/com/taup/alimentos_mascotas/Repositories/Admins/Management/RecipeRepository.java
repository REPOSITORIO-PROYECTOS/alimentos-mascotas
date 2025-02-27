package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.Recipe;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.CountQuery;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface RecipeRepository extends ReactiveMongoRepository<Recipe, String> {

	@Query("{$or: [ { 'recipeName': {$regex: ?0, options: 'i' }, { 'recipeDescription': { $regex: ?0, $options: 'i'}} ] }")
	Flux<Recipe> findByKeyword(String keyword, PageRequest pageRequest);

	@CountQuery(value = "{$or: [ { 'recipeName': {$regex: ?0, options: 'i' }, { 'recipeDescription': { $regex: ?0, $options: 'i'}} ] }")
	Mono<Long> countByKeyword(String keyword);

	@Query("{}")
	Flux<Recipe> findRecipesPaged(PageRequest pageRequest);

	@Query("{ 'ingredientsWithQuantity.?0': { $exists: true } }")
	Flux<Recipe> findByIngredientId(String ingredientId);

	@Query("{ 'createdProducts.?0': { $exists: true } }")
	Flux<Recipe> findByProductId(String productId);
}
