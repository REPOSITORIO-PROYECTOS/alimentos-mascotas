package com.taup.alimentos_mascotas.Repositories.Admins.Management;

import com.taup.alimentos_mascotas.Models.Admins.Management.Recipe;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.CountQuery;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@ReadingConverter
public interface RecipeRepository extends ReactiveMongoRepository<Recipe, String> {

	@Query("{$or: [ { 'recipeName': {$regex: ?0, options: 'i' }, { 'recipeDescription': { $regex: ?0, $options: 'i'}} ] }")
	Flux<Recipe> findByKeyword(String keyword, PageRequest pageRequest);

	@CountQuery(value = "{$or: [ { 'recipeName': {$regex: ?0, options: 'i' }, { 'recipeDescription': { $regex: ?0, $options: 'i'}} ] }")
	Mono<Long> countByKeyword(String keyword);

	@Query("{}")
	Flux<Recipe> findRecipesPaged(PageRequest pageRequest);
}
